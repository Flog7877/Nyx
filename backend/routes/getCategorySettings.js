const db = require('../config/db');

async function getUserSettings(req, res) {
  const userId = req.user.userId;
  try {
    const [rows] = await db.query(
      `SELECT setting_key, setting_value FROM user_settings WHERE user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fehler beim Laden der Benutzereinstellungen:', err);
    res.status(500).json({ error: 'Datenbankfehler beim Laden der Einstellungen' });
  }
}

module.exports = getUserSettings;
