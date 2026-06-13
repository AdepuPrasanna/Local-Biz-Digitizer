const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// All admin routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/shops — list every registered shop
router.get('/shops', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('id, shop_name, owner_name, phone, address, duty_status, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ shops: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/shops/:id — full detail for one shop (counts + revenue)
router.get('/shops/:id', async (req, res) => {
  try {
    const { data: shop, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !shop) return res.status(404).json({ error: 'Shop not found' });

    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id);
    const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id);
    const { count: billCount } = await supabase.from('bills').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id);

    const { data: bills } = await supabase.from('bills').select('total_amount').eq('shop_id', shop.id);
    const totalRevenue = (bills || []).reduce((s, b) => s + Number(b.total_amount || 0), 0);

    res.json({
      shop,
      stats: {
        products: productCount || 0,
        customers: customerCount || 0,
        bills: billCount || 0,
        total_revenue: totalRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/shops/:id/duty — toggle a shop's on-duty/off-duty status
router.put('/shops/:id/duty', async (req, res) => {
  const { duty_status } = req.body; // 'on_duty' | 'off_duty'
  if (!['on_duty', 'off_duty'].includes(duty_status)) {
    return res.status(400).json({ error: 'duty_status must be on_duty or off_duty' });
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .update({ duty_status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ shop: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/shops/:id/admin — grant or revoke admin access for a shop
router.put('/shops/:id/admin', async (req, res) => {
  const { is_admin } = req.body;
  if (typeof is_admin !== 'boolean') {
    return res.status(400).json({ error: 'is_admin must be true or false' });
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .update({ is_admin })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ shop: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/bills — platform-wide bill feed (with shop name)
router.get('/bills', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('id, customer_name, total_amount, paid, whatsapp_sent, created_at, shop_id, shops(shop_name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return res.status(400).json({ error: error.message });

    const bills = data.map(b => ({ ...b, shop_name: b.shops?.shop_name, shops: undefined }));
    res.json({ bills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats — platform-wide overview
router.get('/stats', async (req, res) => {
  try {
    const { count: shopCount } = await supabase.from('shops').select('*', { count: 'exact', head: true });
    const { count: billCount } = await supabase.from('bills').select('*', { count: 'exact', head: true });
    const { count: onDutyCount } = await supabase.from('shops').select('*', { count: 'exact', head: true }).eq('duty_status', 'on_duty');

    const { data: allBills } = await supabase.from('bills').select('total_amount');
    const totalRevenue = (allBills || []).reduce((s, b) => s + Number(b.total_amount || 0), 0);

    res.json({
      total_shops: shopCount || 0,
      total_bills: billCount || 0,
      on_duty_shops: onDutyCount || 0,
      off_duty_shops: (shopCount || 0) - (onDutyCount || 0),
      total_revenue: totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
