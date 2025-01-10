const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const secretKey = process.env.JWT_SECRET; 

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Zugriff verweigert. Kein Token bereitgestellt.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, secretKey);  // Deklaration von decoded hier
        req.user = { userId: decoded.userId };
        next();
    } catch (err) {
        // Vermeide die Verwendung von decoded hier, da es undefiniert sein könnte
        console.error(`Ungültiges Token:`, err.message);
        return res.status(401).json({ error: 'Ungültiges Token.' });
    }
};

module.exports = verifyToken;
