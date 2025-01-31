const db = require('../config/db');
const bcrypt = require('bcrypt');

// Hier funktioniert gar nix lul

async function deleteUser (req, res) {
    const userId = req.user.userId;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Passwort fehlt.' });
  }
  const sql = `SELECT password_hash FROM users WHERE id=? LIMIT 1`;
  db.query(sql, [userId], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Datenbankfehler' });
    }
    if (!rows.length) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Passwort falsch.' });
    }
    const delSql = `DELETE FROM users WHERE id=?`;
    db.query(delSql, [userId], (err2, r2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Datenbankfehler' });
      }
      if (r2.affectedRows === 0) {
        return res.status(404).json({ error: 'User nicht gefunden' });
      }
      res.json({ message: 'Benutzer + Daten gelöscht.' });
    });
  });
}

module.exports = deleteUser;