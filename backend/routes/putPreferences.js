const db = require('../config/db');

async function putPreferences(req, res) {
    //console.log('(PUT) Die Anfrage: ', req);
    const userId = req.user.userId;
    //console.log('(PUT) Die entsprechende User-ID: ', userId);
    const { notification_mode } = req.body;
    try {
        const query = await db.query('UPDATE users SET notification_mode = ? WHERE id = ?', [notification_mode, userId]);
        //console.log('(PUT) Das Ergebnis: ', query[0]);
        return res.json({ message: 'Einstellungen gespeichert.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }
}

module.exports = putPreferences;