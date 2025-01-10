const db = require('../config/db');

async function getSettings(req, res) {
    const userId = req.user.userId;

    let rowsU;
    let rowsS;
    let username;
    const settingsObj = {};

    try {
        const sqlUser = 'SELECT username FROM users WHERE id=? LIMIT 1';
        const checkUser = await db.query(sqlUser, [userId]);
        rowsU = checkUser[0];
    } catch (errU) {
        console.error(errU);
        return res.status(500).json({ error: 'Datenbankfehler (user).' });
    }

    if (!rowsU.length) {
        return res.status(404).json({ error: 'User nicht gefunden.' });
    }

    username = rowsU[0].username;

    try {
        const sqlSettings = 'SELECT setting_key, setting_value FROM user_settings WHERE user_id=?';
        const settingsQuery = await db.query(sqlSettings, [userId]);
        rowsS = settingsQuery[0];
    } catch (errS) {
        console.error(errS);
        return res.status(500).json({ error: 'Datenbankfehler (settings).' });
    }

    rowsS.forEach((row) => {
        settingsObj[row.setting_key] = row.setting_value;
    });
    res.json({
        username,
        settings: settingsObj
    });
}

module.exports = getSettings;