const supabase = require('../config/supabase');

// Must run AFTER authMiddleware (req.user must be set)
const adminMiddleware = async (req, res, next) => {
  try {
    const { data: shop, error } = await supabase
      .from('shops')
      .select('id, is_admin')
      .eq('owner_id', req.user.id)
      .single();

    if (error || !shop || !shop.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.shop = shop;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = adminMiddleware;
