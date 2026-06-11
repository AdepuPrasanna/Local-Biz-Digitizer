const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const getShopId = async (userId) => {
  const { data } = await supabase.from('shops').select('id').eq('owner_id', userId).single();
  return data?.id;
};

// GET /api/credit/:customerId
router.get('/:customerId', authMiddleware, async (req, res) => {
  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const { data, error } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('shop_id', shopId)
      .eq('customer_id', req.params.customerId)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    // Calculate balance
    const balance = data.reduce((sum, entry) => {
      return entry.type === 'credit' ? sum + entry.amount : sum - entry.amount;
    }, 0);

    res.json({ entries: data, balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/credit — add credit or payment entry
router.post('/', authMiddleware, async (req, res) => {
  const { customer_id, amount, type, note } = req.body;

  if (!customer_id || !amount || !type) {
    return res.status(400).json({ error: 'customer_id, amount, and type are required' });
  }
  if (!['credit', 'payment'].includes(type)) {
    return res.status(400).json({ error: 'type must be credit or payment' });
  }

  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const { data, error } = await supabase
      .from('credit_ledger')
      .insert({ shop_id: shopId, customer_id, amount, type, note })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Update customer total_credit
    const { data: customer } = await supabase
      .from('customers')
      .select('total_credit')
      .eq('id', customer_id)
      .single();

    if (customer) {
      const newCredit = type === 'credit'
        ? (customer.total_credit || 0) + amount
        : Math.max(0, (customer.total_credit || 0) - amount);

      await supabase
        .from('customers')
        .update({ total_credit: newCredit })
        .eq('id', customer_id);
    }

    res.status(201).json({ entry: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
