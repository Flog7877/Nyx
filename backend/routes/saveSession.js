const db = require('../config/db');

async function saveSession(req, res) {
    const { user_id, category_id, modus, focusTime, pauseTime, start_time, extra_data } = req.body;
    if (!user_id || !modus) {
        return res.status(400).json({ error: 'Pflichtfelder fehlen (user_id, modus).' });
    }

    let results;
    let values;
    try {
        const query = `INSERT INTO sessions (user_id, category_id, modus, focusTime, pauseTime, start_time, extra_data) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        values = [user_id, category_id || null, modus, focusTime || 0, pauseTime || 0, start_time || null, extra_data ? JSON.stringify(extra_data) : null];
        const querySQL = await db.query(query, values);
        results = querySQL[0];
    } catch (err) {
        console.error('Fehler beim Speichern der Sitzung:', err);
        return res.status(500).json({ error: 'Datenbankfehler. Bitte an support@flo-g.de wenden.' });
    }
    return res.status(201).json({ message: 'Sitzung erfolgreich gespeichert.', sessionId: results.insertId });
}

module.exports = saveSession;