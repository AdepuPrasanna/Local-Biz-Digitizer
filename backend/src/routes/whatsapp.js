const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const getShopId = async (userId) => {
  const { data } = await supabase.from('shops').select('*').eq('owner_id', userId).single();
  return data;
};

// POST /api/whatsapp/send/:billId
router.post('/send/:billId', authMiddleware, async (req, res) => {
  try {
    const shop = await getShopId(req.user.id);
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    // Fetch bill with items
    const { data: bill, error } = await supabase
      .from('bills')
      .select('*, bill_items(*)')
      .eq('id', req.params.billId)
      .eq('shop_id', shop.id)
      .single();

    if (error || !bill) return res.status(404).json({ error: 'Bill not found' });
    if (!bill.customer_phone) return res.status(400).json({ error: 'Customer phone number is required to send WhatsApp' });

    // Format receipt message
    const date = new Date(bill.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    let itemLines = bill.bill_items.map(item =>
      `• ${item.product_name} x${item.quantity} — ₹${item.total_price.toFixed(2)}`
    ).join('\n');

    const message =
      `🧾 *Receipt from ${shop.shop_name}*\n` +
      `📅 Date: ${date}\n\n` +
      `*Items:*\n${itemLines}\n\n` +
      `*Total: ₹${bill.total_amount.toFixed(2)}*\n` +
      `Status: ${bill.paid ? '✅ Paid' : '⏳ Pending'}\n\n` +
      `Thank you for shopping at ${shop.shop_name}! 🙏`;

    // Send via Twilio
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Format phone: ensure it starts with country code
    let phone = bill.customer_phone.replace(/\s+/g, '');
    if (!phone.startsWith('+')) phone = '+91' + phone;

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phone}`,
      body: message,
    });

    // Mark bill as whatsapp_sent
    await supabase
      .from('bills')
      .update({ whatsapp_sent: true })
      .eq('id', bill.id);

    res.json({ message: 'WhatsApp receipt sent successfully', phone });
  } catch (err) {
    console.error('WhatsApp error:', err);
    res.status(500).json({ error: 'Failed to send WhatsApp: ' + err.message });
  }
});

module.exports = router;
