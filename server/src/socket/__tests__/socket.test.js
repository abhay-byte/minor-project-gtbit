// src/socket/__tests__/socket.test.js
const http = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');
const initializeSocket = require('../index'); 

jest.mock('jsonwebtoken');

describe('Socket.io Integration', () => {
    let io, clientSocket, httpServer, port;

    beforeAll((done) => {
        httpServer = http.createServer();
        io = new Server(httpServer);
        
        initializeSocket(io);

        httpServer.listen(() => {
            port = httpServer.address().port;
            done();
        });
    });

    afterAll(() => {
        io.close();
        httpServer.close();
    });

    afterEach(() => {
        if (clientSocket && clientSocket.connected) {
            clientSocket.disconnect();
        }
    });

    describe('Authentication Middleware', () => {
        it('should allow connection with a valid token', (done) => {
            const userPayload = { userId: 1, role: 'Patient' };
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, userPayload); 
            });

            clientSocket = new Client(`http://localhost:${port}`, {
                auth: { token: 'valid_token' }
            });

            clientSocket.on('connect', () => {
                expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET, expect.any(Function));
                done();
            });
        });

        it('should reject connection without a token', (done) => {
            clientSocket = new Client(`http://localhost:${port}`);

            clientSocket.on('connect_error', (err) => {
                expect(err.message).toBe('Authentication error: No token provided.');
                done();
            });
        });

        it('should reject connection with an invalid token', (done) => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            clientSocket = new Client(`http://localhost:${port}`, {
                auth: { token: 'invalid_token' }
            });

            clientSocket.on('connect_error', (err) => {
                expect(err.message).toBe('Authentication error: Invalid token.');
                done();
            });
        });
    });

    describe('Connection Handler', () => {
        it('should log a connection and disconnection message', (done) => {
            const userPayload = { userId: 123, role: 'Test' };
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, userPayload);
            });
            
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            clientSocket = new Client(`http://localhost:${port}`, {
                auth: { token: 'valid_token' }
            });

            clientSocket.on('connect', () => {
                clientSocket.disconnect();
            });

            clientSocket.on('disconnect', () => {
                setTimeout(() => {
                    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('User connected: 123 (Role: Test)'));
                    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('User disconnected: 123 (Role: Test)'));
                    
                    consoleSpy.mockRestore();
                    done();
                }, 50); 
            });
        });
    });
});

