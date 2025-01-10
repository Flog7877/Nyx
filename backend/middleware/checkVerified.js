const db = require('../config/db');

async function checkVerified(req, res, next) {
  
  const userId = req.user.userId;

  let rows;

  try {
    const checkSql = 'SELECT is_verified FROM users WHERE id=? LIMIT 1';
    const query = await db.query(checkSql, [userId]);
    rows = query[0];
  } catch (err) {
    console.error('DB-Fehler in checkVerified:', err);
    return res.status(500).json({ error: 'Datenbankfehler.' });
  }

  if (rows.length === 0) {
    return res.status(401).json({ error: 'User nicht gefunden' });
  }

  if (rows[0].is_verified === 0) {

    return res.status(403).json({ error: 'not-verified' });
  }

  next();
}

module.exports = checkVerified;