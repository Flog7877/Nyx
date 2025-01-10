const db = require('../config/db');


async function addCategory(req, res) {
    const userId = req.user.userId;
    const { slashPath, color } = req.body;
    if (!slashPath || !color) {
        return res.status(400).json({ error: 'slashPath und color sind erforderlich.' });
    }
    const parts = slashPath.split('/').filter(Boolean);
    if (parts.length === 0) {
        return res.status(400).json({ error: 'Ungültiger slashPath.' });
    }
    let parentId = null;
    async function createOrFindCategory (index) {
        if (index >= parts.length) {
            return res.status(201).json({ message: 'Kategorie(n) erfolgreich erstellt.' });
        }
        const catName = parts[index];

        const checkSql = `SELECT id, color FROM categories WHERE user_id=? AND name=? AND ${parentId ? 'parent_id=?' : 'parent_id IS NULL'} LIMIT 1`;
        const checkParams = parentId
            ? [userId, catName, parentId]
            : [userId, catName];

        let rows;
        let insertSql;
        let insertParams;
        let result;

        try {
            const checkQuery = await db.query(checkSql, checkParams);
            rows = checkQuery[0];
        } catch (err) {
            console.error('Fehler beim Überprüfen:', err);
            return res.status(500).json({ error: 'Datenbankfehler.' });
        }

        if (rows.length > 0) {
            parentId = rows[0].id;
            createOrFindCategory(index + 1);
        } else {
            insertSql = `INSERT INTO categories (name, parent_id, user_id, color) VALUES (?, ?, ?, ?)`;
            insertParams = [
                catName,
                parentId || null,
                userId,
                color
            ];

            try {
                const insertQuery = await db.query(insertSql, insertParams);
                result = insertQuery[0];
            } catch (err2) {
                console.error('Fehler beim Erstellen der Kategorie:', err2);
                return res.status(500).json({ error: 'Datenbankfehler.' });
            }
            
            parentId = result.insertId;
            createOrFindCategory(index + 1);
        }
    };
    createOrFindCategory(0);
}

module.exports = addCategory;