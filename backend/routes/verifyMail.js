const db = require('../config/db');
const timestamp = require('../middleware/timestamp');

async function verifyMail(req, res) {
    const currentTime = new Date();
    const { token } = req.query;
    let rows;
    let result2;
    let user;
    let createdAt;
    let diffMs;

    if (!token) {
        return res.status(400).json({ error: 'Kein Token angegeben.' });
    }

    const sql = `SELECT id, verification_token_created FROM users WHERE verification_token=? AND is_verified=0 LIMIT 1`;
    try {
        const tokenQuery = await db.query(sql, [token]);
        rows = tokenQuery[0];
    } catch (err) {
        console.error('Datenbankfehler beim Verifizieren:', err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }

    if (rows.length === 0) {
        return res.status(400).json({ error: 'Token ungültig oder bereits verwendet.' });
    }

    user = rows[0];
    createdAt = new Date(user.verification_token_created);
    diffMs = currentTime - createdAt.getTime();

    if (diffMs > 24 * 60 * 60 * 1000) {
        return res.status(400).json({ error: 'Token abgelaufen. Bitte erneut anfordern.' });
    }

    const updSql = `UPDATE users SET is_verified=1, verification_token=NULL WHERE id=?`;

    try {
        const updateQuery = await db.query(updSql, [user.id]);
        result2 = updateQuery[0];
    } catch (err2) {
        console.error('Datenbankfehler beim Aktualisieren des Benutzers:', err2);
        return res.status(500).json({ error: 'Datenbankfehler beim Aktualisieren des Benutzerstatus.' });
    }
    if (result2.affectedRows === 0) {
        return res.status(400).json({ error: 'Konnte den Account nicht verifizieren.' });
    }

    console.log(`[${timestamp()}] Mail-Verifiziert von ${user}.`);
    return res.json({ message: 'E-Mail erfolgreich verifiziert. Du kannst dich jetzt einloggen.' });
}

module.exports = verifyMail;