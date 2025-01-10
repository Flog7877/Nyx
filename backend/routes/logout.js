const db = require('../config/db');

async function logout(req, res) {
    const query = 'UPDATE users SET refresh_token = NULL WHERE id = ?';
    try {
        db.query(query, [req.user.userId]);
    } catch (err) {
        console.error('Fehler beim Löschen des Refresh Tokens:', err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }
    res.json({ message: 'Erfolgreich ausgeloggt.' });
}

module.exports = logout;