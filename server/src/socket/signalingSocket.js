const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Store room participants
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Join room
    socket.on('join-room', ({ roomId, userData }) => {
      console.log(`User ${socket.id} joining room ${roomId}`, userData);
      
      socket.join(roomId);

      // Track participants in room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      // Get other users in room
      const otherUsers = Array.from(rooms.get(roomId)).filter(id => id !== socket.id);
      
      console.log(`Room ${roomId} now has ${rooms.get(roomId).size} participants`);
      console.log(`Other users in room:`, otherUsers);

      // Notify existing users about new user
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        userData: userData
      });

      // Send existing users to new user
      otherUsers.forEach(userId => {
        socket.emit('user-already-in-room', {
          userId: userId
        });
      });
    });

    // Forward WebRTC signals
    socket.on('signal', ({ signal, to }) => {
      console.log(`Forwarding signal from ${socket.id} to ${to}`);
      io.to(to).emit('signal', {
        signal: signal,
        from: socket.id
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
      
      // Remove user from all rooms
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          participants.delete(socket.id);
          socket.to(roomId).emit('user-left', socket.id);
          
          // Clean up empty rooms
          if (participants.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });

    // Explicit leave room
    socket.on('leave-room', (roomId) => {
      console.log(`User ${socket.id} leaving room ${roomId}`);
      
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        socket.to(roomId).emit('user-left', socket.id);
        socket.leave(roomId);
      }
    });
  });

  return io;
};

module.exports = { initializeSocket };