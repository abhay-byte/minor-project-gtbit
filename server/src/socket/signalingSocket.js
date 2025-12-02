const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', ({ roomId, userData }) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        userData
      });
    });

    socket.on('signal', ({ signal, to, roomId }) => {
      io.to(to).emit('signal', {
        signal,
        from: socket.id
      });
    });

    socket.on('leave-room', (roomId) => {
      socket.to(roomId).emit('user-left', socket.id);
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = { initializeSocket };