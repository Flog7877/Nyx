const db = require('../config/db');

async function changeSettings(req, res) {
    const userId = req.user.userId;
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Settings-Objekt fehlt.' });
    }
    const queries = [];
    Object.entries(settings).forEach(([key, val]) => {
        queries.push(new Promise((resolve, reject) => {
            try {
                const sqlUpsert = `INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)`;
                db.query(sqlUpsert, [userId, key, String(val)]);
            } catch (err) {
                return reject(err);
            }
            resolve(true);
        }));
    });
    Promise.all(queries)
        .then(() => {
            res.json({ message: 'Einstellungen gespeichert.' });
        })
        .catch((err) => {
            console.error('Fehler bei settings-update:', err);
            res.status(500).json({ error: 'Datenbankfehler.' });
        });
}

module.exports = changeSettings;