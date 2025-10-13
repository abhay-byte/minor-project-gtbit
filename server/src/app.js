const express = require('express');
require('dotenv').config();

const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/users.routes');

const app = express();

// --- Middleware ---

app.use(express.json());

// --- API Routes ---

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 



// --- Server Setup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
