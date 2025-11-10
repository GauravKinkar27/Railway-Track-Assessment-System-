
// const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { spawn } = require('child_process');
// const path = require('path');
// const router = express.Router();
// const pool = require('../db');
// const analysisService = require('../services/analysisService');
// const { authenticateToken } = require('../middleware/auth');

// // Utility to handle async errors cleanly
// function asyncHandler(fn) {
//   return function (req, res, next) {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
// }

// // ====================== AUTH ROUTES ======================

// // POST /api/auth/register
// router.post('/auth/register', asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ error: 'Email and password required' });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   try {
//     await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
//     res.status(201).json({ success: true, message: 'User registered' });
//   } catch (err) {
//     if (err.code === 'ER_DUP_ENTRY') {
//       return res.status(400).json({ error: 'Email already exists' });
//     }
//     res.status(500).json({ error: 'Registration failed' });
//   }
// }));

// // POST /api/auth/login
// router.post('/auth/login', asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ error: 'Email and password required' });
//   }

//   const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
//   if (rows.length === 0) {
//     return res.status(401).json({ error: 'Invalid credentials' });
//   }

//   const user = rows[0];
//   const validPassword = await bcrypt.compare(password, user.password);
//   if (!validPassword) {
//     return res.status(401).json({ error: 'Invalid credentials' });
//   }

//   const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   res.json({ token, user: { id: user.id, email: user.email } });
// }));

// // ====================== PROTECTED ROUTES ======================
// router.use(authenticateToken);

// // GET /api/assets -> Retrieve all assets
// router.get('/assets', asyncHandler(async (req, res) => {
//   const [rows] = await pool.query('SELECT * FROM rail_assets ORDER BY uid DESC');
//   res.status(200).json(rows);
// }));

// // GET /api/assets/:uid -> Retrieve single asset + analysis
// router.get('/assets/:uid', asyncHandler(async (req, res) => {
//   const { uid } = req.params;
//   if (!uid) {
//     return res.status(400).json({ error: 'Asset UID is required' });
//   }

//   const [rows] = await pool.query('SELECT * FROM rail_assets WHERE uid = ?', [uid]);
//   if (rows.length === 0) {
//     return res.status(404).json({ error: 'Asset not found' });
//   }

//   const item = rows[0];
//   const assemblyRemark = analysisService.generateAssemblyRemark(item);
//   const lotStatusSummary = await analysisService.getVendorLotStatusSummary(item.vendor_name);
//   const vendorReport = await analysisService.getVendorContext(item.vendor_name);
//   const assetTypeReport = await analysisService.getAssetTypeContext(item.asset_type);

//   res.status(200).json({ item, assemblyRemark, lotStatusSummary, vendorReport, assetTypeReport });
// }));

// // POST /api/assets/:uid -> Update asset details
// router.post('/assets/:uid', asyncHandler(async (req, res) => {
//   const { uid } = req.params;
//   const { condition_lot, remarks, last_inspection } = req.body;

//   if (!condition_lot) {
//     return res.status(400).json({ error: 'condition_lot field is required' });
//   }

//   const inspectionDateForDb = last_inspection || null;
//   const sql = `UPDATE rail_assets SET condition_lot = ?, remarks = ?, last_inspection = ? WHERE uid = ?`;
//   await pool.query(sql, [condition_lot, remarks, inspectionDateForDb, uid]);

//   const [updatedRows] = await pool.query('SELECT * FROM rail_assets WHERE uid = ?', [uid]);
//   res.status(200).json({ success: true, item: updatedRows[0] });
// }));

// // GET /api/dashboard -> Summary statistics
// router.get('/dashboard', asyncHandler(async (req, res) => {
//   const [assets] = await pool.query('SELECT condition_lot, warranty_expiry FROM rail_assets');
//   const total = assets.length;
//   const good = assets.filter(a => a.condition_lot === 'Good').length;
//   const needsRepair = assets.filter(a =>
//     a.condition_lot &&
//     a.condition_lot.toLowerCase().includes('need') &&
//     (a.condition_lot.toLowerCase().includes('repair') || a.condition_lot.toLowerCase().includes('replacement'))
//   ).length;

//   const now = new Date();
//   const next30 = new Date(now);
//   next30.setDate(now.getDate() + 30);
//   const soonExpiring = assets.filter(a => {
//     if (!a.warranty_expiry) return false;
//     const expiryDate = new Date(a.warranty_expiry);
//     return expiryDate > now && expiryDate <= next30;
//   }).length;

//   res.status(200).json({ total, good, needsRepair, soonExpiring });
// }));

// // GET /api/vendors -> Vendor-based aggregated report
// router.get('/vendors', asyncHandler(async (req, res) => {
//   const data = await analysisService.generateVendorReport();
//   res.status(200).json(data);
// }));

// // GET /api/inventory -> Inventory breakdown
// router.get('/inventory', asyncHandler(async (req, res) => {
//   const data = await analysisService.generateInventoryReport();
//   res.status(200).json(data);
// }));

// // NEW: POST /api/predict-fittings (Runs Python script)
// router.post('/predict-fittings', asyncHandler(async (req, res) => {
//   const { line_length_km, gauge_type } = req.body;
//   if (!line_length_km || !gauge_type) {
//     return res.status(400).json({ error: 'Line length and gauge type required' });
//   }

//   const pythonPath = 'python'; // Adjust to full path if needed
//   const scriptPath = path.join(__dirname, '../predict_fittings.py');
//   const pythonProcess = spawn(pythonPath, [scriptPath]);
//   const inputData = JSON.stringify({ line_length_km, gauge_type });

//   let output = '';
//   let errorOutput = '';

//   pythonProcess.stdin.write(inputData);
//   pythonProcess.stdin.end();

//   pythonProcess.stdout.on('data', (data) => {
//     output += data.toString();
//   });

//   pythonProcess.stderr.on('data', (data) => {
//     errorOutput += data.toString();
//   });

//   pythonProcess.on('close', (code) => {
//     if (code === 0 && output) {
//       try {
//         const result = JSON.parse(output);
//         res.status(200).json(result);
//       } catch (parseErr) {
//         res.status(500).json({ error: 'Failed to parse prediction' });
//       }
//     } else {
//       res.status(500).json({ error: errorOutput || 'Prediction failed. Check Python script.' });
//     }
//   });
// }));

// // NEW: GET /api/alerts-expiring (assets expiring in 10 days)
// router.get('/alerts-expiring', asyncHandler(async (req, res) => {
//   const [assets] = await pool.query('SELECT uid, warranty_expiry FROM rail_assets WHERE warranty_expiry IS NOT NULL');
//   const now = new Date();
//   const in10Days = new Date(now);
//   in10Days.setDate(now.getDate() + 10);

//   const expiring = assets
//     .filter(a => {
//       const expiryDate = new Date(a.warranty_expiry);
//       return expiryDate > now && expiryDate <= in10Days;
//     })
//     .map(a => ({
//       uid: a.uid,
//       expiry: a.warranty_expiry.split(' ')[0] // Format YYYY-MM-DD
//     }));

//   res.status(200).json(expiring);
// }));

// // ====================== GLOBAL ERROR HANDLER ======================
// router.use((err, req, res, next) => {
//   console.error('API Error:', err.stack);
//   res.status(500).json({
//     error: 'Internal Server Error',
//     message: err.message,
//   });
// });

// module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();
const pool = require('../db');
const analysisService = require('../services/analysisService');
const { authenticateToken } = require('../middleware/auth');

// Utility to handle async errors cleanly
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ====================== AUTH ROUTES ======================

// POST /api/auth/register
router.post('/auth/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    res.status(201).json({ success: true, message: 'User registered' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
}));

// POST /api/auth/login
router.post('/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = rows[0];
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, email: user.email } });
}));

// ====================== PROTECTED ROUTES ======================
router.use(authenticateToken);

// GET /api/assets -> Retrieve all assets
router.get('/assets', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM rail_assets ORDER BY uid DESC');
  res.status(200).json(rows);
}));

// GET /api/assets/:uid -> Retrieve single asset + analysis
router.get('/assets/:uid', asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).json({ error: 'Asset UID is required' });
  }

  const [rows] = await pool.query('SELECT * FROM rail_assets WHERE uid = ?', [uid]);
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  const item = rows[0];
  const assemblyRemark = analysisService.generateAssemblyRemark(item);
  const lotStatusSummary = await analysisService.getVendorLotStatusSummary(item.vendor_name);
  const vendorReport = await analysisService.getVendorContext(item.vendor_name);
  const assetTypeReport = await analysisService.getAssetTypeContext(item.asset_type);

  res.status(200).json({ item, assemblyRemark, lotStatusSummary, vendorReport, assetTypeReport });
}));

// POST /api/assets/:uid -> Update asset details
router.post('/assets/:uid', asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { condition_lot, remarks, last_inspection, latitude, longitude } = req.body;

  if (!condition_lot) {
    return res.status(400).json({ error: 'condition_lot field is required' });
  }

  // Validate latitude if provided
  if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    return res.status(400).json({ error: 'Invalid latitude value' });
  }

  // Validate longitude if provided
  if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    return res.status(400).json({ error: 'Invalid longitude value' });
  }

  const inspectionDateForDb = last_inspection || null;
  const latForDb = latitude || null;
  const longForDb = longitude || null;
  const sql = `UPDATE rail_assets SET condition_lot = ?, remarks = ?, last_inspection = ?, latitude = ?, longitude = ? WHERE uid = ?`;
  await pool.query(sql, [condition_lot, remarks, inspectionDateForDb, latForDb, longForDb, uid]);

  const [updatedRows] = await pool.query('SELECT * FROM rail_assets WHERE uid = ?', [uid]);
  res.status(200).json({ success: true, item: updatedRows[0] });
}));

// GET /api/dashboard -> Summary statistics
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [assets] = await pool.query('SELECT condition_lot, warranty_expiry FROM rail_assets');
  const total = assets.length;
  const good = assets.filter(a => a.condition_lot === 'Good').length;
  const needsRepair = assets.filter(a =>
    a.condition_lot &&
    a.condition_lot.toLowerCase().includes('need') &&
    (a.condition_lot.toLowerCase().includes('repair') || a.condition_lot.toLowerCase().includes('replacement'))
  ).length;

  const now = new Date();
  const next30 = new Date(now);
  next30.setDate(now.getDate() + 30);
  const soonExpiring = assets.filter(a => {
    if (!a.warranty_expiry) return false;
    const expiryDate = new Date(a.warranty_expiry);
    return expiryDate > now && expiryDate <= next30;
  }).length;

  res.status(200).json({ total, good, needsRepair, soonExpiring });
}));

// GET /api/vendors -> Vendor-based aggregated report
router.get('/vendors', asyncHandler(async (req, res) => {
  const data = await analysisService.generateVendorReport();
  res.status(200).json(data);
}));

// GET /api/inventory -> Inventory breakdown
router.get('/inventory', asyncHandler(async (req, res) => {
  const data = await analysisService.generateInventoryReport();
  res.status(200).json(data);
}));

// NEW: POST /api/predict-fittings (Runs Python script)
router.post('/predict-fittings', asyncHandler(async (req, res) => {
  const { line_length_km, gauge_type } = req.body;
  if (!line_length_km || !gauge_type) {
    return res.status(400).json({ error: 'Line length and gauge type required' });
  }

  const pythonPath = 'python'; // Adjust to full path if needed
  const scriptPath = path.join(__dirname, '../predict_fittings.py');
  const pythonProcess = spawn(pythonPath, [scriptPath]);
  const inputData = JSON.stringify({ line_length_km, gauge_type });

  let output = '';
  let errorOutput = '';

  pythonProcess.stdin.write(inputData);
  pythonProcess.stdin.end();

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0 && output) {
      try {
        const result = JSON.parse(output);
        res.status(200).json(result);
      } catch (parseErr) {
        res.status(500).json({ error: 'Failed to parse prediction' });
      }
    } else {
      res.status(500).json({ error: errorOutput || 'Prediction failed. Check Python script.' });
    }
  });
}));

// NEW: GET /api/alerts-expiring (assets expiring in 10 days)
router.get('/alerts-expiring', asyncHandler(async (req, res) => {
  const [assets] = await pool.query('SELECT uid, warranty_expiry FROM rail_assets WHERE warranty_expiry IS NOT NULL');
  const now = new Date();
  const in10Days = new Date(now);
  in10Days.setDate(now.getDate() + 10);

  const expiring = assets
    .filter(a => {
      const expiryDate = new Date(a.warranty_expiry);
      return expiryDate > now && expiryDate <= in10Days;
    })
    .map(a => ({
      uid: a.uid,
      expiry: a.warranty_expiry.split(' ')[0] // Format YYYY-MM-DD
    }));

  res.status(200).json(expiring);
}));

// ====================== GLOBAL ERROR HANDLER ======================
router.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

module.exports = router;