const db = require('../config/db');
const bcrypt = require('bcrypt');


async function resetPassword(req, res) {

    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token und neues Passwort erforderlich' });
    }

    let rows;
    let r2;
    let user;
    let createdAt;
    let newHash;

    try {
        const sql = `SELECT id, reset_token_created FROM users WHERE reset_token=? LIMIT 1`;
        const query = await db.query(sql, [token]);
        rows = query[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler' });
    }

    if (!rows.length) {
        return res.status(400).json({ error: 'Token ungültig.' });
    }

    user = rows[0];
    createdAt = new Date(user.reset_token_created);
    if ((Date.now() - createdAt.getTime()) > 24 * 60 * 60 * 1000) {
        return res.status(400).json({ error: 'Token abgelaufen.' });
    }
    newHash = await bcrypt.hash(newPassword, 10);

    try {
        const updSql = `UPDATE users SET password_hash=?, reset_token=NULL WHERE id=?`;
        const updateQuery = await db.query(updSql, [newHash, user.id]);
        r2 = updateQuery[0];
    } catch (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Datenbankfehler' });
    }

    if (r2.affectedRows === 0) {
        return res.status(404).json({ error: 'User nicht gefunden beim PW Reset.' });
    }

    res.json({ message: 'Passwort zurückgesetzt. Du kannst dich nun einloggen.' });
}

module.exports = resetPassword;