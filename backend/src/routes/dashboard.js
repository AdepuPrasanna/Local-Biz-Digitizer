const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const getShopId = async (userId) => {
  const { data } = await supabase.from('shops').select('id').eq('owner_id', userId).single();
  return data?.id;
};

// GET /api/dashboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Today's bills
    const { data: todayBills } = await supabase
      .from('bills')
      .select('total_amount, paid, whatsapp_sent, customer_name, created_at')
      .eq('shop_id', shopId)
      .gte('created_at', todayISO)
      .order('created_at', { ascending: false });

    const todaySales = (todayBills || []).reduce((sum, b) => sum + b.total_amount, 0);
    const todayBillCount = (todayBills || []).length;

    // All products
    const { data: products } = await supabase
      .from('products')
      .select('id, name, quantity, selling_price')
      .eq('shop_id', shopId);

    const totalProducts = (products || []).length;
    const lowStockItems = (products || []).filter(p => p.quantity <= 5 && p.quantity >= 0);

    // Pending credit (customers who owe money)
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, phone, total_credit')
      .eq('shop_id', shopId)
      .gt('total_credit', 0);

    const totalPendingCredit = (customers || []).reduce((sum, c) => sum + c.total_credit, 0);

    // Recent 5 bills
    const { data: recentBills } = await supabase
      .from('bills')
      .select('id, customer_name, total_amount, paid, whatsapp_sent, created_at')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      today_sales: todaySales,
      today_bill_count: todayBillCount,
      total_products: totalProducts,
      low_stock_items: lowStockItems,
      total_pending_credit: totalPendingCredit,
      customers_with_credit: customers || [],
      recent_bills: recentBills || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
