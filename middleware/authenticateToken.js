const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
