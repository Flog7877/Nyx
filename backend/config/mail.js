const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Fehler bei der Mailer-Verbindung:', error);
  } else {
    console.log('Mailserver ist bereit und verbunden.');
  }
});

module.exports = transporter;

