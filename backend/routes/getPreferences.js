const db = require('../config/db');

async function getPreferences(req, res) {
    //console.log('Die Request: ', req);
    const userId = req.user.userId;
    //console.log('(GET) Die entsprechende ID: ', userId);
    try {
        const [rows] = await db.query('SELECT notification_mode FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden.' });
        }
        //console.log('(GET) Das Ergebnis: ', rows[0]);
        return res.json({ notification_mode: rows[0].notification_mode });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }
}

module.exports = getPreferences;