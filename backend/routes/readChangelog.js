const db = require('../config/db');

async function readChangelog(req, res) {
    const userId = req.user.id; 

    try {
        await db.query('UPDATE users SET read_changelog = TRUE WHERE id = ?', [userId]);
        res.status(200).json({ success: true, message: 'Changelog gelesen.' });
    } catch (error) {
        console.error('Fehler beim Setzen von read_changelog:', error);
        res.status(500).json({ success: false, error: 'Datenbankfehler.' });
    }
}

module.exports = readChangelog;
