const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/users.routes');
const professionalRoutes = require('./api/routes/professional.routes');
const appointmentsRoutes = require('./api/routes/appointments.routes');
const clinicRoutes = require('./api/routes/clinics.routes');
const chatRoutes = require('./api/routes/chat.routes');
const prescriptionRoutes = require('./api/routes/prescriptions.routes');
const vaultRoutes = require('./api/routes/vault.routes');
const reviewRoutes = require('./api/routes/reviews.routes');
const healthRoutes = require('./api/routes/health.routes');
const medicalProfileRoutes = require('./api/routes/medicalProfile.routes');
const consultationsRoutes = require('./api/routes/consultations.routes');
const uploadReportRequestsRoutes = require('./api/routes/upload-report-requests.routes');
const conversationRoutes = require('./api/routes/conversations.routes');
const aiChatRoutes = require('./api/routes/aiChat.routes');
const signalingRoutes = require('./api/routes/signaling');

const app = express();

// --- CORS Configuration ---
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(url => url.trim());
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Allow credentials to be sent with requests
};

app.use(cors(corsOptions));

// --- Middleware ---
app.use(express.json({
  type: ['application/json', 'application/*+json', 'text/plain'],
  limit: '10mb'
}));

// Production-specific middleware
if (process.env.NODE_ENV === 'production') {
  // Enable trust proxy for SSL termination
  app.set('trust proxy', 1);
  
  // Add security headers in production
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', healthRoutes);
app.use('/api', medicalProfileRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/upload-report-requests', uploadReportRequestsRoutes);
app.use('/api/ai', aiChatRoutes);
app.use('/api/signaling', signalingRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Clinico API Server",
        version: "1.0.0",
        status: "running",
        documentation: "/api",
        health: "/api/health"
    });
});

// --- Server Setup ---
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    // Only run the server if this file is executed directly
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}${process.env.NODE_ENV === 'production' ? ' in production mode' : ''}`);
    });
}

// --- Export App for Testing and Server ---
module.exports = app;
