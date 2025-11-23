// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Parse the DATABASE_URL to extract SSL options and configure SSL properly
const parseConnectionString = (connectionString) => {
  // Parse the connection string manually to extract SSL parameters
  const url = new URL(connectionString);
  const config = {
    host: url.hostname,
    port: parseInt(url.port),
    database: url.pathname.split('/')[1],
    user: url.username,
    password: url.password,
    ssl: {
      rejectUnauthorized: false // Accept self-signed certificates from Aiven
    }
  };
  
  // Check for sslmode in search parameters
  const sslmode = url.searchParams.get('sslmode');
  if (sslmode === 'disable') {
    config.ssl = false;
  }
  
  return config;
};

const pool = new Pool(parseConnectionString(process.env.DATABASE_URL));

module.exports = {
  // Used for single, one-off queries
  query: (text, params) => pool.query(text, params),
  // Used for transactions to get a dedicated client
  connect: () => pool.connect(),
  end: () => pool.end(),
};

