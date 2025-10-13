// src/api/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

// This middleware function verifies the JWT provided in the request's Authorization header.
const verifyToken = (req, res, next) => {
    // Get token from the 'Authorization' header, typically in the format "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        // If no token is provided, deny access
        return res.status(403).json({ message: 'A token is required for authentication.' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user payload (e.g., { userId: 1, role: 'Patient' }) to the request object
        req.user = decoded;

    } catch (err) {
        // If the token is invalid (expired, malformed, etc.), return an error
        return res.status(401).json({ message: 'Invalid Token.' });
    }

    // If the token is valid, proceed to the next middleware or the route handler
    return next();
};

module.exports = verifyToken;
