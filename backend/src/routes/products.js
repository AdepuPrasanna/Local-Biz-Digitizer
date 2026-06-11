const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Helper: get shop_id for current user
const getShopId = async (userId) => {
  const { data } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', userId)
    .single();
  return data?.id;
};

// GET /api/products
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found. Please set up your shop first.' });

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('name');

    if (error) return res.status(400).json({ error: error.message });
    res.json({ products: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', authMiddleware, async (req, res) => {
  const { name, quantity, unit, purchase_price, selling_price } = req.body;
  if (!name) return res.status(400).json({ error: 'Product name is required' });

  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const { data, error } = await supabase
      .from('products')
      .insert({ shop_id: shopId, name, quantity: quantity || 0, unit: unit || 'pcs', purchase_price: purchase_price || 0, selling_price: selling_price || 0 })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ product: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, quantity, unit, purchase_price, selling_price } = req.body;

  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const { data, error } = await supabase
      .from('products')
      .update({ name, quantity, unit, purchase_price, selling_price, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('shop_id', shopId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ product: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .eq('shop_id', shopId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
