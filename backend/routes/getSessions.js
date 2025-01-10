const db = require('../config/db');

async function getSessions(req, res) {
    const userId = req.user.userId;
    let rows;

    try {
        const sql = `
          SELECT 
            s.id, 
            s.modus, 
            s.focusTime, 
            s.pauseTime, 
            s.created_at, 
            s.start_time, 
            s.extra_data, 
            s.category_id, 
            s.note, 
            c.name AS category_name 
          FROM sessions s 
          LEFT JOIN categories c ON s.category_id = c.id 
          WHERE s.user_id = ? 
          ORDER BY s.created_at DESC
        `;
        const query = await db.query(sql, [userId]);
        rows = query[0];
    } catch (err) {
        console.error('Fehler beim Abrufen der Sessions:', err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }
    res.status(200).json(rows);
}

module.exports = getSessions;