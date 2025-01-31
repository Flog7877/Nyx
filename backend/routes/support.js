const mailer = require('../config/mail');
const db = require('../config/db');
const rateLimitMap = new Map();

async function supportRouter(req, res) {
  try {
    const userId = req.user ? req.user.userId : null;
    const { name, email, message } = req.body;

    let spamKey;
    if (userId) {
      spamKey = `user_${userId}`;
    } else {
      spamKey = `ip_${req.ip}`;
    }

    const lastSent = rateLimitMap.get(spamKey);
    const now = Date.now();
    const COOLDOWN_MS = 60 * 1000; 

    if (lastSent && now - lastSent < COOLDOWN_MS) {
      return res.status(429).json({
        error: 'Bitte warte kurz, bevor du erneut eine Nachricht sendest.',
      });
    }

    rateLimitMap.set(spamKey, now);

    if (!message || message.trim().length < 1) {
      return res.status(400).json({ error: 'Nachricht ist leer.' });
    }

    if (!userId) {
      if (!name || !email) {
        return res.status(400).json({ error: 'Name und E-Mail werden benötigt.' });
      }
    }
    const queryInsert = `
INSERT INTO support_messages (user_id, name, email, message_text)
VALUES (?, ?, ?, ?)
`;

    const [insertResult] = await db.query(queryInsert, [
      userId,
      name || null,
      email || null,
      message
    ]);

    const newId = insertResult.insertId;

    const [rows] = await db.query(
      `SELECT created_at FROM support_messages WHERE id = ?`,
      [newId]
    );
    const createdAt = rows[0]?.created_at || null;

    const mailOptions = {
      from: '"Support-Feld" <no-reply@flo-g.de>',
      to: 'support@flo-g.de',
      subject: 'Neue Support-Nachricht',
      text: `Neue Support-Nachricht:
      
    Von: ${userId ? `Benutzer-ID ${userId}` : `${name} <${email}>`}
    Datum: ${new Date(createdAt).toLocaleString()}
    Nachricht:
    ${message}`
    };

    mailer.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('Fehler beim Versenden der Mail:', mailErr);
      } else {
        console.log('Support-Mail gesendet:', info.response);
      }
    });

    return res.json({
      success: true,
      message: 'Nachricht erfolgreich gesendet!',
      data: {
        id: newId,
        createdAt
      }
    });
  } catch (err) {
    console.error('Fehler beim Verarbeiten der Support-Nachricht:', err);
    return res.status(500).json({
      error: 'Interner Serverfehler. Bitte später erneut versuchen.'
    });
  }
};

module.exports = supportRouter;
