const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const getShopId = async (userId) => {
  const { data } = await supabase.from('shops').select('id').eq('owner_id', userId).single();
  return data?.id;
};

// Parse OCR text into structured items
const parseOCRText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const items = [];
  const unrecognized = [];

  for (const line of lines) {
    // Match patterns like: "Product Name   10   25.50" or "Sugar 5kg   20   45"
    const match = line.match(/^(.+?)\s{2,}(\d+)\s+(\d+(?:\.\d+)?)$/) ||
                  line.match(/^(.+?)\s+(\d+)\s+(?:Rs\.?|₹)?\s*(\d+(?:\.\d+)?)$/i);

    if (match) {
      const name = match[1].trim();
      const quantity = parseInt(match[2]);
      const purchase_price = parseFloat(match[3]);
      if (name.length > 1 && quantity > 0) {
        items.push({ name, quantity, purchase_price });
      }
    } else {
      // Try simpler: any line with at least one number might be a product
      const simpleMatch = line.match(/^(.{3,}?)\s+(\d+)(?:\s.*)?$/);
      if (simpleMatch && !line.toLowerCase().includes('total') && !line.toLowerCase().includes('date')) {
        items.push({ name: simpleMatch[1].trim(), quantity: parseInt(simpleMatch[2]), purchase_price: 0 });
      } else {
        unrecognized.push(line);
      }
    }
  }

  return { items, unrecognized };
};

// POST /api/ocr/scan
router.post('/scan', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    // Run Tesseract OCR
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng', {
      logger: () => {}, // suppress logs
    });

    const { items, unrecognized } = parseOCRText(text);

    // Upload image to Supabase Storage
    const fileName = `${shopId}/${Date.now()}.jpg`;
    const { data: uploadData } = await supabase.storage
      .from('supply-scans')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    const imageUrl = uploadData
      ? `${process.env.SUPABASE_URL}/storage/v1/object/public/supply-scans/${fileName}`
      : null;

    // Save scan record
    const { data: scan, error } = await supabase
      .from('supply_scans')
      .insert({
        shop_id: shopId,
        image_url: imageUrl,
        raw_ocr_text: text,
        parsed_items: items,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ scan_id: scan.id, items, unrecognized, raw_text: text });
  } catch (err) {
    console.error('OCR error:', err);
    res.status(500).json({ error: 'OCR processing failed: ' + err.message });
  }
});

// POST /api/ocr/apply/:scanId — apply parsed items to inventory
router.post('/apply/:scanId', authMiddleware, async (req, res) => {
  const { items } = req.body; // user may have edited items before applying

  try {
    const shopId = await getShopId(req.user.id);
    if (!shopId) return res.status(404).json({ error: 'Shop not found' });

    let added = 0, updated = 0;

    for (const item of items) {
      if (!item.name) continue;

      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id, quantity')
        .eq('shop_id', shopId)
        .ilike('name', item.name.trim())
        .single();

      if (existing) {
        // Update quantity
        await supabase
          .from('products')
          .update({
            quantity: existing.quantity + (item.quantity || 0),
            purchase_price: item.purchase_price || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        updated++;
      } else {
        // Add new product
        await supabase.from('products').insert({
          shop_id: shopId,
          name: item.name.trim(),
          quantity: item.quantity || 0,
          purchase_price: item.purchase_price || 0,
          selling_price: 0,
          unit: 'pcs',
        });
        added++;
      }
    }

    // Mark scan as applied
    await supabase
      .from('supply_scans')
      .update({ status: 'applied' })
      .eq('id', req.params.scanId);

    res.json({ message: `Inventory updated: ${added} added, ${updated} updated`, added, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
