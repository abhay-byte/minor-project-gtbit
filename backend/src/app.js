const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const authRoutes = require('./api/routes/auth.routes');
const meRoutes = require('./api/routes/me.routes');
const professionalsRoutes = require('./api/routes/professionals.routes');
const appointmentsRoutes = require('./api/routes/appointments.routes');
const clinicsRoutes = require('./api/routes/clinics.routes');
const reviewsRoutes = require('./api/routes/reviews.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Clinico API is running!');
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection error');
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', meRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/clinics', clinicsRoutes);
app.use('/api/reviews', reviewsRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
