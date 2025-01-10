const db = require('../config/db');
const mailer = require('../config/mail');
const crypto = require('crypto');

const mail_text = (usrname, link) => `
Hallo ${usrname},
hier ist ein neuer Link zum Verifizieren der E-Mail-Adresse:

${link}

Dieser Link ist für 24h gültig. Bei weiteren Problemen oder generellen Rückfragen, gerne jederzeit an support@flo-g.de wenden.
`

async function resendVerification(req, res) {

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Bitte E-Mail angeben.' });
    }

    let rows;
    let user;
    let lastSent;
    let diffMs;

    const newToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();


    const sql = `SELECT id, username, is_verified, verification_token_created FROM users WHERE email=? LIMIT 1`;
    try {
        const query = await db.query(sql, [email]);
        rows = query[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler.' });
    }

    if (rows.length === 0) {
        return res.status(404).json({ error: 'User nicht gefunden.' });
    }

    user = rows[0];
    if (user.is_verified === 1) {
        return res.status(400).json({ error: 'Bereits verifiziert.' });
    }
    if (user.verification_token_created) {
        lastSent = new Date(user.verification_token_created);
        diffMs = Date.now() - lastSent.getTime();
        if (diffMs < 60 * 1000) {
            return res.status(429).json({ error: 'Zu schnell, bitte warte 60s bevor du erneut sendest.' });
        }
    }
    const updSql = `UPDATE users SET verification_token=?, verification_token_created=? WHERE id=?`;
    try {
        db.query(updSql, [newToken, now, user.id]);
    } catch (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Datenbankfehler. Neues Verifikationstoken konnte nicht gesetzt werden.' });
    }

    const verifyLink = `https://nyx.flo-g.de/verify?token=${newToken}`;
    //const verifyLink = `http://localhost:5173/Nyx/verify?token=${newToken}`;
    const mailOptions = {
        from: '"Flo (noreply)" <noreply@flo-g.de>',
        to: email,
        subject: 'Erneute E-Mail-Verifizierung',
        text: mail_text(user.username, verifyLink)
    };
    mailer.sendMail(mailOptions, (mErr, info) => {
        if (mErr) {
            console.error('Mail-Fehler (Resend):', mErr);
        }
    });
    return res.status(200).json({ message: 'Verifizierungsmail erneut gesendet.' });
}

module.exports = resendVerification;