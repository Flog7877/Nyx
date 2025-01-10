const db = require('../config/db');

async function deleteSession(req, res) {

    const userId = req.user.userId;
    const sessionId = req.params.id;

    let result;

    try {
        const sql = `DELETE FROM sessions WHERE id=? AND user_id=?`;
        const query = await db.query(sql, [sessionId, userId]);
        result = query[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Session nicht gefunden oder Zugriff verweigert.' });
    }
    res.status(200).json({ message: 'Session erfolgreich gelöscht.' });
}

module.exports = deleteSession;