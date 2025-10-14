const express = require('express');
require('dotenv').config();
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
const initializeSocket = require('./socket'); 

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/users.routes');
const professionalRoutes = require('./api/routes/professional.routes');
const appointmentsRoutes = require('./api/routes/appointments.routes');
const clinicRoutes = require('./api/routes/clinics.routes');

const app = express();

// --- Socket.io Integration ---
const httpServer = http.createServer(app); 
const io = new Server(httpServer, {
    cors: {
        origin: "*", // In production, restrict this to your frontend's domain
        methods: ["GET", "POST"]
    }
});

initializeSocket(io);

// --- Middleware ---

app.use(cors());
app.use(express.json());

// --- API Routes ---

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/professionals', professionalRoutes); 
app.use('/api/appointments', appointmentsRoutes); 
app.use('/api/clinics', clinicRoutes);

// --- Server Setup ---
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = { app, httpServer }; // Export for testing
