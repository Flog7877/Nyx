const db = require('../config/db');
const bcrypt = require('bcrypt');

// Das war die alte Registrierungs-Funktion. Die ist nur noch zu Testzwecken drin.

async function users(req, res) {
    let results;
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
    }
    try {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        try {
            const query = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
            const userQuery = await db.query(query, [username, password_hash]);
            results = userQuery[0];
        } catch (err) {
            console.error('Fehler beim Erstellen des Benutzers:', err);
            return res.status(500).json({ error: 'Datenbankfehler' });
        }
        res.status(201).json({ message: 'Benutzer erstellt', userId: results.insertId });
    } catch (err2) {
        console.error('Fehler beim Hashen des Passworts:', err2);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}

module.exports = users;