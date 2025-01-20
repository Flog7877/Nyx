const db = require('../config/db');
const mailer = require('../config/mail');
const crypto = require('crypto');

const mail_text = (uname, link) => `
Hallo ${uname},
unter folgendem Link kann das Passwort (für ${uname}) zurückgesetzt werden:

${link}

Der Link ist für 24h gültig. Bei Rückfragen gerne an support@flo-g.de wenden.
`


async function forgotPassword(req, res) {
    const { identifier } = req.body;
    if (!identifier) {
        return res.status(400).json({ error: 'E-Mail oder Username erforderlich.' });
    }
    let query;
    if (identifier.includes('@')) {
        query = 'SELECT id, email, username FROM users WHERE email=? LIMIT 1';
    } else {
        query = 'SELECT id, email, username FROM users WHERE username=? LIMIT 1';
    }
    let rows;
    let user;
    let token;

    const now = new Date();

    try {
        const idQuery = await db.query(query, [identifier]);
        rows = idQuery[0];
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Datenbankfehler' });
    }

    if (!rows.length) {
        return res.status(404).json({ error: 'Nutzer nicht gefunden.' });
    }

    user = rows[0];
    token = crypto.randomBytes(32).toString('hex');

    try {
        const updSql = `UPDATE users SET reset_token=?, reset_token_created=? WHERE id=?`;
        const updateQuery = await db.query(updSql, [token, now, user.id]);
    } catch (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Datenbankfehler' });
    }
    const resetLink = `https://nyx.flo-g.de/resetPassword?token=${token}`;
    //const resetLink = `http://192.168.0.51:5173/resetPassword?token=${token}`;
    const mailOptions = {
        from: '"Flo (noreply)" <noreply@flo-g.de>',
        to: user.email,
        subject: 'Passwort zurücksetzen',
        text: mail_text(user.username, resetLink)
    };
    mailer.sendMail(mailOptions, (mErr) => {
        if (mErr) { console.error(mErr); }
    });
    res.json({ message: 'E-Mail zum Zurücksetzen verschickt (falls du existierst).' });

}

module.exports = forgotPassword;