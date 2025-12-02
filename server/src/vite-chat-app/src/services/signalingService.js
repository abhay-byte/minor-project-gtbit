import io from 'socket.io-client';

class SignalingService {
  constructor() {
    this.socket = null;
    this.roomId = null;
  }

  connect(serverUrl) {
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('authToken') || ''
      }
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => resolve());
      this.socket.on('connect_error', (error) => reject(error));
    });
 }

  joinRoom(roomId, userData) {
    this.roomId = roomId;
    this.socket.emit('join-room', { roomId, userData });
  }

  onUserJoined(callback) {
    this.socket.on('user-joined', callback);
  }

  onUserLeft(callback) {
    this.socket.on('user-left', callback);
  }

  sendSignal(signal, to) {
    this.socket.emit('signal', { signal, to, roomId: this.roomId });
  }

  onSignal(callback) {
    this.socket.on('signal', callback);
  }

  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', this.roomId);
      this.socket.disconnect();
    }
  }
}

export default new SignalingService();