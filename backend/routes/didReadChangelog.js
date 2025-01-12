const db = require('../config/db');

async function didReadChangelog(req, res) {
    const userId = req.user.id; 

    try {
        const [result] = await db.query('SELECT read_changelog FROM users WHERE id = ?', [userId]);
        const isRead = result ? result.read_changelog : true;

        res.status(200).json({ success: true, read: isRead });
    } catch (error) {
        console.error('Fehler beim Abfragen von read_changelog:', error);
        res.status(500).json({ success: false, error: 'Datenbankfehler.' });
    }
}

module.exports = didReadChangelog;
