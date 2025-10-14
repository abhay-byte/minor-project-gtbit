// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  // Used for single, one-off queries
  query: (text, params) => pool.query(text, params),
  // Used for transactions to get a dedicated client
  connect: () => pool.connect(),
  end: () => pool.end(), 
};

