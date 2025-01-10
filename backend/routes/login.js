const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = require('../app')

async function login(req, res) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/E-Mail und Passwort erforderlich.' });
  }
  let query;
  let user;
  let updateQuery;
  let accessToken;
  let refreshToken;
  let passwordMatch;
  let results;
  if (identifier.includes('@')) {
    query = 'SELECT id, username, email, password_hash, is_verified FROM users WHERE email=? LIMIT 1';
  } else {
    query = 'SELECT id, username, email, password_hash, is_verified FROM users WHERE username=? LIMIT 1';
  }
  try {
    const initialQuery = await db.query(query, [identifier]);
    //console.log(initialQuery);
    results = initialQuery[0];
    user = results[0];
    //console.log('Der User: ', user);
    try {
      accessToken = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '30m' });
      refreshToken = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '14d' });
    } catch (err) {
      console.error('Nutzer-ID nicht gefunden: ', err);
      return res.status(401).json({ error: 'Fehler in der Datenbank.' })
    }
    updateQuery = 'UPDATE users SET refresh_token = ? WHERE id = ?';
    if (!results.length) {
      return res.status(401).json({ error: 'Ungültiger Benutzername/E-Mail oder Passwort.' });
    }
    user = results[0];
    passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Ungültiger Benutzername/E-Mail oder Passwort.' });
    }
  } catch (err) {
    console.error('Datenbankfehler beim Login:', err);
    return res.status(500).json({ error: 'Datenbankfehler.' });
  }
  try {
    const udtQuery = await db.query(updateQuery, [refreshToken, user.id]);
    //console.log(udtQuery);
    return res.json({
      accessToken,
      refreshToken,
      user_id: user.id,
      username: user.username,
    });
  } catch (updateErr) {
    console.error('Fehler beim Speichern des Refresh Tokens:', updateErr);
    return res.status(500).json({ error: 'Datenbankfehler.' });
  }
}

module.exports = login;