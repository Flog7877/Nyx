// Alte Version 
/*
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.flo-g.de', 
  port: 587,
  secure: false,        
  auth: {
    user: 'noreply@flo-g.de',
    pass: 'NFm2TKGkYdts' 
  },
});

module.exports = transporter;
*/

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
