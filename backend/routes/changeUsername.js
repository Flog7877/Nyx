const db = require('../config/db');
const timestamp = require('../middleware/timestamp');

async function changeUsername (req, res) {

    const userId = req.user.userId;
    const { newUsername } = req.body;
    if (!newUsername) {
        return res.status(400).json({ error: 'Neuer Benutzername fehlt.' });
    }
    if (newUsername.includes('@')) {
        return res.status(400).json({ error: 'Benutzername darf kein @ enthalten.' });
    }

    let rows;
    let r2;

    try {
        const checkSql = `SELECT id FROM users WHERE (username=? OR email=?) AND id <> ? LIMIT 1`;
        const query = await db.query(checkSql, [newUsername, newUsername, userId]);
        rows = query[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler' });
    }

    if (rows.length > 0) {
        return res.status(400).json({ error: 'Name oder Mail wird bereits verwendet.' });
    }

    try {
        const updSql = 'UPDATE users SET username=? WHERE id=?';
        const updateQuery = await db.query(updSql, [newUsername, userId]);
        r2 = updateQuery[0];
    } catch (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }

    if (r2.affectedRows === 0) {
        return res.status(404).json({ error: 'User nicht gefunden.' });
    }
    res.json({ message: 'Benutzername geändert.' });
    console.log(`[${timestamp()}] ID: ${userId}; neuer Benutzername: ${newUsername}`)
}

module.exports = changeUsername;