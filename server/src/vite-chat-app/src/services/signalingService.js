import io from 'socket.io-client';

class SignalingService {
  constructor() {
    this.socket = null;
    this.roomId = null;
  }

  connect(serverUrl) {
    console.log('Connecting to signaling server:', serverUrl);
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('authToken')
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 100
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('✅ Connected to signaling server, socket ID:', this.socket.id);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from signaling server:', reason);
      });
    });
  }

 joinRoom(roomId, userData) {
    console.log('Joining room:', roomId, 'with data:', userData);
    this.roomId = roomId;
    this.socket.emit('join-room', { roomId, userData });
  }

  onUserJoined(callback) {
    this.socket.on('user-joined', (data) => {
      console.log('Event: user-joined', data);
      callback(data);
    });
  }

  onUserAlreadyInRoom(callback) {
    this.socket.on('user-already-in-room', (data) => {
      console.log('Event: user-already-in-room', data);
      callback(data);
    });
  }

  onUserLeft(callback) {
    this.socket.on('user-left', (userId) => {
      console.log('Event: user-left', userId);
      callback(userId);
    });
  }

  sendSignal(signal, to) {
    console.log('Sending signal to:', to);
    this.socket.emit('signal', { signal, to });
  }

  onSignal(callback) {
    this.socket.on('signal', (data) => {
      console.log('Event: signal from', data.from);
      callback(data);
    });
  }

  leaveRoom() {
    console.log('Leaving room:', this.roomId);
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', this.roomId);
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
    }
  }
}

export default new SignalingService();