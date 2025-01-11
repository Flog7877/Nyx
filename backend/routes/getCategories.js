const db = require('../config/db');

async function getCategories(req, res) {

    const userId = req.user.userId;
    if (!userId) {
        console.error('Benutzer-ID ist undefined oder null.');
        return res.status(400).json({ error: 'Ungültige Benutzer-ID.' });
    }

    let results;
    
    try {
        const query = `SELECT id, name, parent_id, color, pomodoro_focus_setting, pomodoro_pause_setting, ping_interval_setting, timer_time_setting FROM categories WHERE user_id=? ORDER BY name`;
        const SQLquery = await db.query(query, [userId]);
        results = SQLquery[0];
    } catch (err) {
        console.error('Fehler beim Abrufen der Kategorien:', err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }

    res.status(200).json(results);
}

module.exports = getCategories;