const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// GET /api/shop/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json({ shop: data || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shop/setup
router.post('/setup', authMiddleware, async (req, res) => {
  const { shop_name, owner_name, phone, address } = req.body;

  if (!shop_name) {
    return res.status(400).json({ error: 'Shop name is required' });
  }

  try {
    // Check if shop already exists
    const { data: existing } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (existing) {
      // Update existing shop
      const { data, error } = await supabase
        .from('shops')
        .update({ shop_name, owner_name, phone, address })
        .eq('owner_id', req.user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.json({ shop: data });
    }

    // Create new shop
    const { data, error } = await supabase
      .from('shops')
      .insert({ owner_id: req.user.id, shop_name, owner_name, phone, address })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ shop: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
