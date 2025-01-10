const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,      
  user: process.env.DB_USER,      
  password: process.env.DB_PASS,   
  database: process.env.DB_NAME,  
  timezone: 'local', 
  waitForConnections: true,
  connectionLimit: 10,             
  queueLimit: 0
});


(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Verbunden mit der Datenbank als ID ' + connection.threadId);
    connection.release();
  } catch (err) {
    console.error('Fehler bei der Verbindung zur Datenbank:', err);
    process.exit(1); 
  }
})();

module.exports = pool;
