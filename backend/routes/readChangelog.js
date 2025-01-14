const db = require('../config/db');

async function readChangelog(req, res) {
    const userId = req.user.userId; 
    try {
        console.log('Backend erhält PUT-Anfrage mit der UserID: ', userId);
        const query = await db.query('UPDATE users SET read_changelog = TRUE WHERE id = ?', [userId]);
        console.log(query);
        res.status(200).json({ success: true, message: 'Changelog gelesen.' });
    } catch (error) {
        console.error('Fehler beim Setzen von read_changelog:', error);
        res.status(500).json({ success: false, error: 'Datenbankfehler.' });
    }
}

module.exports = readChangelog;
