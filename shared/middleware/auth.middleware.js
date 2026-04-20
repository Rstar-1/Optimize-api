const jwt = require('jsonwebtoken');
const { getUserById } = require('../utils/jwt');
const { roles } = require('../constants/roles');
const { messages } = require('../constants/messages');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: messages.unauthorized });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: messages.forbidden });
        req.user = user;
        next();
    });
};

const authorizeRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: messages.forbidden });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRole,
};