async function validateToken (req, res) {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(500).json({ error: 'Benutzer-ID konnte nicht ermittelt werden.' });
    }
    res.status(200).json({ message: 'Token ist gültig.', user_id: userId });
}

module.exports = validateToken;