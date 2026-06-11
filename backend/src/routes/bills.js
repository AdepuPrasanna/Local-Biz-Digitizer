const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const getShopId = async (userId) => {
  const { data } = await supabase.from('shops').select('id').eq('owner_id', userId).single();
  return data?.id;
};

// GET /api/bills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const { data, error } = await supabase
      .from('bills')
      .select('*, bill_items(*)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ bills: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bills/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const shopId = await getShopId(req.user.id);
    const { data, error } = await supabase
      .from('bills')
      .select('*, bill_items(*)')
      .eq('id', req.params.id)
      .eq('shop_id', shopId)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ bill: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bills — create bill + deduct inventory
router.post('/', authMiddleware, async (req, res) => {
  const { customer_id, customer_name, customer_phone, items, paid, send_whatsapp } = req.body;
  // items: [{ product_id, product_name, quantity, unit_price }]

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Bill must have at least one item' });
  }

  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    // 1. Create the bill
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        shop_id: shopId,
        customer_id: customer_id || null,
        customer_name: customer_name || 'Walk-in Customer',
        customer_phone: customer_phone || null,
        total_amount,
        paid: paid !== false,
      })
      .select()
      .single();

    if (billError) return res.status(400).json({ error: billError.message });

    // 2. Insert bill items
    const billItems = items.map(item => ({
      bill_id: bill.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('bill_items').insert(billItems);
    if (itemsError) return res.status(400).json({ error: itemsError.message });

    // 3. Deduct inventory for each item
    for (const item of items) {
      if (item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.product_id)
          .single();

        if (product) {
          const newQty = Math.max(0, product.quantity - item.quantity);
          await supabase
            .from('products')
            .update({ quantity: newQty, updated_at: new Date().toISOString() })
            .eq('id', item.product_id);
        }
      }
    }

    // 4. If not paid, add credit entry
    if (paid === false && customer_id) {
      await supabase.from('credit_ledger').insert({
        shop_id: shopId,
        customer_id,
        amount: total_amount,
        type: 'credit',
        note: `Bill #${bill.id.slice(0, 8)}`,
      });

      // Update customer total_credit
      const { data: customer } = await supabase
        .from('customers')
        .select('total_credit')
        .eq('id', customer_id)
        .single();

      if (customer) {
        await supabase
          .from('customers')
          .update({ total_credit: (customer.total_credit || 0) + total_amount })
          .eq('id', customer_id);
      }
    }

    res.status(201).json({ bill: { ...bill, bill_items: billItems }, send_whatsapp: send_whatsapp || false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
