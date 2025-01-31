const db = require('../config/db');

async function deleteCategory(req, res) {
    const userId = req.user.userId;
    const categoryId = req.params.id;

    let rows;
    let result2;

    try {
        const childCheckSql = `SELECT id FROM categories WHERE user_id=? AND parent_id=? LIMIT 1`;
        const checkQuery = await db.query(childCheckSql, [userId, categoryId])
        rows = checkQuery[0];
    } catch (err) {
        console.error('Fehler beim Prüfen von Childs:', err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }

    if (rows.length > 0) {
        return res.status(400).json({
            error: 'Kategorie kann nicht gelöscht werden, da noch Unterkategorien existieren.',
        });
    }

    try {
        const deleteSql = `DELETE FROM categories WHERE id=? AND user_id=?`;
        const deleteQuery = await db.query(deleteSql, [categoryId, userId])
        result2 = deleteQuery[0];
    } catch (err2) {
        console.error('Fehler beim Löschen der Kategorie:', err2);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }

    if (result2.affectedRows === 0) {
        return res.status(404).json({ error: 'Kategorie nicht gefunden oder Zugriff verweigert.' });
    }
    return res.status(200).json({ message: 'Kategorie erfolgreich gelöscht.' });
}

module.exports = deleteCategory;