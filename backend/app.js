const dotenv = require('dotenv');
const express = require('express');
const db = require('./config/db');
const mailer = require('./config/mail');
const crypto = require('crypto');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const nodeEnv = process.env.NODE_ENV || 'development';
console.log('Die ausgelesene NODE_ENV:', nodeEnv);

dotenv.config({
  path: nodeEnv === 'production' ? '.env' : '.env.development'
});

const secretKey = process.env.JWT_SECRET;

module.exports = secretKey;

if (!secretKey) {
  console.error('Fehler: JWT_SECRET ist nicht definiert.');
  process.exit(1);
}

const verifyToken = require('./middleware/auth');
const checkVerified = require('./middleware/checkVerified');

const app = express();
const router = express.Router();

console.log('Die Abfrage: ', nodeEnv === 'development');

const port = nodeEnv === 'development' ? 3001 : 3000;

const corsOptions = {
  origin: nodeEnv === 'development' ? 'http://192.168.0.51:5173' : 'https://nyx.flo-g.de',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json());
router.use(express.json());

// --- Routen ----

const login = require('./routes/login');
const register = require('./routes/register');
const verifyMail = require('./routes/verifyMail');
const resendVerification = require('./routes/resendVerification');
const users = require('./routes/users');
const deleteUser = require('./routes/userDelete');
const validateToken = require('./routes/validateToken');
const refreshToken = require('./routes/refreshToken');
const logout = require('./routes/logout');
const getSettings = require('./routes/settings');
const changeUsername = require('./routes/changeUsername');
const changePassword = require('./routes/changePassword');
const changeSettings = require('./routes/changeSettings');
const forgotPassword = require('./routes/forgotPassword');
const resetPassword = require('./routes/resetPassword');
const getCategories = require('./routes/getCategories');
const addCategory = require('./routes/addCategory');
const editCategory = require('./routes/editCategory');
const deleteCategory = require('./routes/deleteCategory');
const saveSession = require('./routes/saveSession');
const getSessions = require('./routes/getSessions');
const editSession = require('./routes/editSession');
const deleteSession = require('./routes/deleteSession');
const updateRoundComment = require('./routes/updateRoundComment');
const supportRouter = require('./routes/support');
const getCategorySettings = require('./routes/getCategorySettings');
// ----------------------------------------------------------------------------

app.post('/api/register', register);

app.get('/api/verify', verifyMail);

app.post('/api/resendVerification', resendVerification);

app.post('/api/users', users);

app.delete('/api/settings/user', verifyToken, checkVerified, deleteUser);

app.post('/api/login', login);

app.get('/api/validate-token', verifyToken, validateToken);

app.post('/api/refresh-token', refreshToken);

app.post('/api/logout', verifyToken, logout);

app.get('/api/settings', verifyToken, checkVerified, getSettings);

app.put('/api/settings/username', verifyToken, checkVerified, changeUsername);

app.put('/api/settings/password', verifyToken, checkVerified, changePassword);

app.put('/api/settings', verifyToken, checkVerified, changeSettings);

app.post('/api/forgotPassword', forgotPassword);

app.post('/api/resetPassword', resetPassword);

app.get('/api/categories', verifyToken, checkVerified, getCategories);

app.post('/api/categories', verifyToken, checkVerified, addCategory);

app.put('/api/categories/:id', verifyToken, checkVerified, editCategory);

app.delete('/api/categories/:id', verifyToken, checkVerified, deleteCategory);

app.get('/api/user_settings', verifyToken, checkVerified, getCategorySettings);

app.post('/api/sessions', verifyToken, checkVerified, saveSession);

app.get('/api/sessions', verifyToken, checkVerified, getSessions);

app.put('/api/sessions/:id', verifyToken, checkVerified, editSession);

app.delete('/api/sessions/:id', verifyToken, checkVerified, deleteSession);

app.post('/api/sessions/:sessionId/rounds/:roundNr', verifyToken, checkVerified, updateRoundComment);

app.post('/api/support', verifyToken, supportRouter);

// --------------------------------------------------------------------------------------

app.use(router);

// --- Debugging ---

app.get('/api/test', (req, res) => {
  res.send('Das Backend funktioniert!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server läuft auf http://0.0.0.0:${port}`);
});
