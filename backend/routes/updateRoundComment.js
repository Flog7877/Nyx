const db = require('../config/db');

async function updateRoundComment(req, res) {
    console.log('updateRoundComment aufgerufen mit Params:', req.params, 'Body:', req.body);

    const userId = req.user.userId;
    const { sessionId, roundNr } = req.params;
    const { comment } = req.body;

    // Abrufen der Session
    let session;
    try {
        const [rows] = await db.query(
            'SELECT extra_data FROM sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );
        console.log('Datenbankabfrage erfolgreich:', rows);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Session nicht gefunden.' });
        }
        session = rows[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler beim Abrufen der Session.' });
    }

    // Parsing von extra_data und Aktualisierung des Rundensatzes
    let extraData;
    try {
        if (typeof session.extra_data === 'string') {
            extraData = session.extra_data ? JSON.parse(session.extra_data) : {};
        } else {
            extraData = session.extra_data || {};
        }
    } catch (e) {
        console.error('Fehler beim Parsen von extra_data:', e);
        return res.status(500).json({ error: 'Fehler beim Verarbeiten der Session-Daten.' });
    }

    if (!extraData.rounds || !Array.isArray(extraData.rounds)) {
        console.error('Keine Rundeninformationen in extra_data vorhanden.');
        return res.status(400).json({ error: 'Keine Rundeninformationen vorhanden.' });
    }

    const roundIndex = extraData.rounds.findIndex(r => r.nr == roundNr);
    if (roundIndex === -1) {
        console.error(`Runde ${roundNr} nicht gefunden in extra_data.`);
        return res.status(404).json({ error: 'Runde nicht gefunden.' });
    }

    extraData.rounds[roundIndex].comment = comment;

    try {
        const result = await db.query(
            'UPDATE sessions SET extra_data = ? WHERE id = ? AND user_id = ?',
            [JSON.stringify(extraData), sessionId, userId]
        );
        console.log('Update erfolgreich:', result);
        console.log('Antworte mit Erfolg.');
        return res.json({ message: 'Rundenkommentar aktualisiert.' });
    } catch (err) {
        console.error('Fehler beim Aktualisieren der Session:', err);
        return res.status(500).json({ error: 'Datenbankfehler beim Aktualisieren der Session.' });
    }


}

module.exports = updateRoundComment;
