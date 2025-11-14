// src/api/middleware/socket.middleware.js
const jwt = require('jsonwebtoken');

/**
 * Socket.io middleware for JWT authentication.
 * It runs once per socket connection attempt.
 *
 * @param {object} socket - The socket instance for the connecting client.
 * @param {function} next - The callback to proceed.
 */
const verifySocketToken = (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error('Authentication error: No token provided.'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token.'));
        }
        
        socket.user = decoded;
        
        next();
    });
};

module.exports = { verifySocketToken };
