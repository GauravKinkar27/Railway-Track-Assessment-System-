const jwt = require('jsonwebtoken');
const pool = require('../db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    // Optional: Fetch user from DB for extra checks
    // const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id]);
    // if (rows.length === 0) return res.status(403).json({ error: 'User not found' });
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };