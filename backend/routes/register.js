const db = require('../config/db');
const mailer = require('../config/mail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const mail_text = (uname, link) => `
Hallo ${uname},
mit folgendem Link kann die E-Mail-Adresse verifiziert werden:

${link}

Der Link ist 24h gültig. Bei Rückfragen gerne jederzeit an support@flo-g.de wenden!
`;

async function register(req, res) {

    const now = new Date();

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Alle Felder (Benutzername, E-Mail, Passwort) sind erforderlich.' });
    }

    let results;
    let results2;
    let saltRounds;
    let hashedPassword;
    let newUserId;
    let verification_token;

    try {
        const checkEmailQuery = 'SELECT id FROM users WHERE email = ?';
        try {
            const mailQuery = await db.query(checkEmailQuery, [email]);
            results = mailQuery[0];
            if (results.length > 0) {
                return res.status(400).json({ error: 'E-Mail wird bereits verwendet.' });
            }
        } catch (err) {
            console.error('Fehler beim Überprüfen der E-Mail:', err);
            return res.status(500).json({ error: 'Datenbankfehler.' });
        };

        saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertUserQuery = `INSERT INTO users (username, email, password_hash, is_verified) VALUES (?, ?, ?, 0)`;

        try {
            const instUsrQuery = await db.query(insertUserQuery, [username, email, hashedPassword]);
            results2 = instUsrQuery[0];

            newUserId = results2.insertId;
            verification_token = crypto.randomBytes(32).toString('hex');
        } catch (err2) {
            console.error('Fehler beim Speichern des Benutzers:', err2);
            return res.status(500).json({ error: 'Datenbankfehler.' });
        };

        try {
            const updateQuery = `UPDATE users SET verification_token=?, verification_token_created=? WHERE id=?`;
            const updtQuery = await db.query(updateQuery, [verification_token, now, newUserId]);
        } catch (err3) {
            console.error('Fehler beim Setzen des Tokens:', err3);
            return res.status(500).json({ error: 'Datenbankfehler.' });
        };

        const verifyLink = `https://nyx.flo-g.de/verify?token=${verification_token}`;
        //const verifyLink = `http://localhost:5173/Nyx/verify?token=${verification_token}`;

        const mailOptions = {
            from: '"Flo (noreply)" <noreply@flo-g.de>',
            to: email,
            subject: 'E-Mail-Verifizierung',
            text: mail_text(username, verifyLink)
        };

        mailer.sendMail(mailOptions, (mailErr, info) => {
            if (mailErr) {
                console.error('Fehler beim Versenden der Verifizierungs-Mail:', mailErr);
            } else {
                console.log('Verifizierungs-Mail gesendet:', info.response);
            }
        });

        res.status(201).json({
            message: 'Benutzer erfolgreich registriert. Bitte E-Mail verifizieren!',
            userId: newUserId
        });

    } catch (err) {
        console.error('Fehler bei der Registrierung:', err);
        res.status(500).json({ error: 'Interner Serverfehler.' });
    }
}

module.exports = register;