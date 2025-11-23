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

// Configure pool based on environment
const poolConfig = parseConnectionString(process.env.DATABASE_URL);

// Production-specific database pool settings
if (process.env.NODE_ENV === 'production') {
  poolConfig.max = 10; // Maximum number of clients in the pool
  poolConfig.min = 2; // Minimum number of clients in the pool
  poolConfig.idleTimeoutMillis = 30000; // Close idle clients after 30 seconds
  poolConfig.connectionTimeoutMillis = 2000; // Return an error after 2 seconds if connection could not be established
  poolConfig.maxUses = 7500; // Close (and replace) a connection after it has been used 7500 times (a bit less than 50% of Postgres default max_connections)
}

const pool = new Pool(poolConfig);

module.exports = {
  // Used for single, one-off queries
  query: (text, params) => pool.query(text, params),
  // Used for transactions to get a dedicated client
  connect: () => pool.connect(),
  end: () => pool.end(),
};

