const db = require('../config/db');
const bcrypt = require('bcrypt');


async function changePassword(req, res) {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Fehlende Felder.' });
    }
    let rows;
    let user;
    let match;
    let r2;

    try {
        const sql = 'SELECT password_hash FROM users WHERE id=? LIMIT 1';
        const checkPsw = await db.query(sql, [userId]);
        rows = checkPsw[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler' });
    }

    if (!rows.length) {
        return res.status(404).json({ error: 'User nicht gefunden' });
    }

    user = rows[0];
    match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
        return res.status(401).json({ error: 'Altes Passwort ist falsch.' });
    }

    try {
        const newHash = await bcrypt.hash(newPassword, 10);
        const updSql = 'UPDATE users SET password_hash=? WHERE id=?';
        const updateQuery = await db.query(updSql, [newHash, userId]);
        r2 = updateQuery[0];
    } catch (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Datenbankfehler' });
    }
    
    if (r2.affectedRows === 0) {
        return res.status(404).json({ error: 'User nicht gefunden' });
    }
    res.json({ message: 'Passwort erfolgreich geändert.' });
}

module.exports = changePassword;