const express = require('express');
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

const app = express();

// --- Middleware ---
app.use(express.json());

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
app.use('/api/reviews', reviewRoutes);

// --- Server Setup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}${process.env.NODE_ENV === 'production' ? ' in production mode' : ''}`);
});
