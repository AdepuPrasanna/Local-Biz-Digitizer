const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const getShopId = async (userId) => {
  const { data } = await supabase.from('shops').select('id').eq('owner_id', userId).single();
  return data?.id;
};

// GET /api/customers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shopId)
      .order('name');

    if (error) return res.status(400).json({ error: error.message });
    res.json({ customers: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers
router.post('/', authMiddleware, async (req, res) => {
  const { name, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Customer name is required' });

  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const { data, error } = await supabase
      .from('customers')
      .insert({ shop_id: shopId, name, phone })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ customer: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const shopId = await getShopId(req.user.id);
    const { data, error } = await supabase
      .from('customers')
      .update({ name, phone })
      .eq('id', req.params.id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ customer: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
