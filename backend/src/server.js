require('dotenv').config();
const express = require('express');
const cors = require('cors');

const shopRoutes = require('./routes/shop');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const billRoutes = require('./routes/bills');
const ocrRoutes = require('./routes/ocr');
const whatsappRoutes = require('./routes/whatsapp');
const creditRoutes = require('./routes/credit');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BizEase API is running 🚀', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/shop', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ BizEase backend running on port ${PORT}`);
  console.log(`📡 Supabase: ${process.env.SUPABASE_URL}`);
});
