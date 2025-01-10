const db = require('../config/db');


async function editSession(req, res) {

    const userId = req.user.userId;
    const sessionId = req.params.id;
    const { category_id, note } = req.body;

    let response;

    try {
        const sql = `UPDATE sessions SET category_id=?, note=? WHERE id=? AND user_id=?`;
        const query = await db.query(sql, [category_id || null, note || null, sessionId, userId]);
        response = query[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler' });
    }

    if (response.affectedRows === 0) {
        return res.status(404).json({ error: 'Session nicht gefunden oder Zugriff verweigert.' });
    }
    res.json({ message: 'Session aktualisiert.' });
}

module.exports = editSession;