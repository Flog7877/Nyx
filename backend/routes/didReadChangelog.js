const db = require('../config/db');

/**
 * 
 * @param {*} req Das ist ein Kommentar uwu 
 * @param {*} res Das ist auch ein Kommentar :3
 */
async function didReadChangelog(req, res) {
    const userId = req.user.userId;

    try {
        console.log('Konsole erhält GET-Anfrage von userID: ', userId);
        const [result] = await db.query('SELECT read_changelog FROM users WHERE id = ?', [userId]);
        console.log(result);
        const isRead = result ? result[0].read_changelog : true;

        res.status(200).json({ success: true, read: isRead });
    } catch (error) {
        console.error('Fehler beim Abfragen von read_changelog:', error);
        res.status(500).json({ success: false, error: 'Datenbankfehler.' });
    }
}

module.exports = didReadChangelog;