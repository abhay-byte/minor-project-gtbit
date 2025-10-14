const { verifySocketToken } = require('../api/middleware/socket.middleware');

const initializeSocket = (io) => {
    // Apply the authentication middleware to all incoming connections
    io.use(verifySocketToken);

    io.on('connection', (socket) => {
        // At this point, the user is authenticated, and socket.user has the payload
        const { userId, role } = socket.user;
        console.log(`User connected: ${userId} (Role: ${role})`);

        // Handle disconnection
        socket.on('disconnect', () => {
            // Updated to include the role for consistency
            console.log(`User disconnected: ${userId} (Role: ${role})`);
        });

        // ... future event handlers will go here
    });
};

module.exports = initializeSocket;