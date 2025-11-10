const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

const pool = require('./db');
const analysisService = require('./services/analysisService');

const app = express();
const port = process.env.PORT || 3000;

// ------------------
// 🧱 Express Setup
// ------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// NEW: CORS for React dev (remove in prod if needed)
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));

// ------------------
// 🔗 API Routes
// ------------------
app.use('/api', require('./routes/api'));

// ------------------
// 🌐 EJS ROUTES (Kept as fallback)
// ------------------
app.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT uid, asset_type, vendor_name, condition_lot, depot_code FROM rail_assets ORDER BY uid DESC'
    );
    res.render('dashboard', { items });
  } catch (err) {
    console.error('Error fetching items for dashboard:', err);
    res.status(500).send('Error loading dashboard');
  }
});

app.get('/item/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const [rows] = await pool.query('SELECT * FROM rail_assets WHERE uid = ?', [uid]);
    if (rows.length === 0) return res.status(404).send('Item not found');

    const item = rows[0];
    const assemblyRemark = analysisService.generateAssemblyRemark(item);
    const lotStatusSummary = await analysisService.getVendorLotStatusSummary(item.vendor_name);
    const vendorReport = await analysisService.getVendorContext(item.vendor_name);
    const assetTypeReport = await analysisService.getAssetTypeContext(item.asset_type);

    item.formatted_last_inspection = item.last_inspection
      ? new Date(item.last_inspection).toISOString().split('T')[0]
      : '';

    res.render('item', {
      item,
      assemblyRemark,
      lotStatusSummary: lotStatusSummary || { ready: 0, notReady: 0 },
      vendorReport: vendorReport || null,
      assetTypeReport: assetTypeReport || null,
    });
  } catch (err) {
    console.error('Error fetching item details:', err);
    res.status(500).send('Server Error');
  }
});

app.post('/item/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { condition_lot, remarks, last_inspection } = req.body;

    const sql = `UPDATE rail_assets SET condition_lot=?, remarks=?, last_inspection=? WHERE uid=?`;
    await pool.query(sql, [condition_lot, remarks, last_inspection || null, uid]);

    req.flash('success_msg', 'Asset details updated successfully!');
    res.redirect(`/item/${uid}`);
  } catch (err) {
    console.error('Error updating item:', err);
    req.flash('error_msg', 'Failed to update asset details.');
    res.redirect(`/item/${req.params.uid}`);
  }
});

app.get('/reports', async (req, res) => {
  try {
    const vendorReport = await analysisService.generateVendorReport();
    const inventoryReport = await analysisService.generateInventoryReport();
    res.render('report', {
      pageTitle: 'AI-Generated Reports',
      vendorReport,
      inventoryReport,
    });
  } catch (err) {
    console.error('Error generating reports:', err);
    res.status(500).send('Error generating reports');
  }
});

// ------------------
// ⚡ React Frontend Serve
// ------------------
// Serve React build in production (from Vite's dist)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  });
} else {
  // Dev: Fallback to index.html if in public (for manual build testing)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
      next();
    }
  });
}

// ------------------
// 🚀 Start Server
// ------------------
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});