const db = require('../config/db');
const jwt = require('jsonwebtoken');
const secretKey = require('../app')

async function refreshToken(req, res) {

    const { token: refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Kein Refresh-Token bereitgestellt.' });
    }

    let results;

    try {
        const query = 'SELECT id FROM users WHERE refresh_token = ?';
        let querySQL = await db.query(query, [refreshToken]);
        results = querySQL[0];
    } catch (err) {
        console.error('Datenbankfehler beim Überprüfen des Refresh-Tokens:', err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }

    if (!results.length) {
        return res.status(403).json({ error: 'Ungültiges Refresh-Token.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, secretKey);
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            secretKey,
            { expiresIn: '30m' }
        );
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error('Ungültiges Refresh-Token:', err.message);
        res.status(403).json({ error: 'Ungültiges Refresh-Token.' });
    }
}

module.exports = refreshToken;