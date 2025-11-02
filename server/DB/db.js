// db.js - shared MySQL connection pool and helpers
const path = require('path');
const fs = require('fs');
// Load .env from the server directory (so running from project root still finds it)
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });
const mysql = require('mysql2/promise');

const {
  DB_HOST,
  DB_PORT = 3306,
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_CA_PATH,
  DB_CLIENT_CERT,
  DB_CLIENT_KEY
} = process.env;

// We'll create the pool lazily after validating env vars so we don't attempt
// a connection with empty/invalid credentials when the module is loaded.
let pool = null;

function validateEnv() {
  const required = [
    ['DB_HOST', DB_HOST],
    ['DB_USER', DB_USER],
    ['DB_PASS', DB_PASS],
    ['DB_NAME', DB_NAME]
  ];
  const missing = required.filter(([, val]) => !val).map(([k]) => k);
  if (missing.length) {
    const msg = `Missing required DB env vars: ${missing.join(', ')}.\nPlease add them to your .env or environment. Example:\nDB_HOST=your-host\nDB_PORT=3306\nDB_NAME=your_db\nDB_USER=your_user\nDB_PASS=your_password`;
    throw new Error(msg);
  }
}

function buildPoolConfig() {
  const poolConfig = {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  if (DB_CA_PATH) {
    // resolve SSL file paths relative to the server folder when not absolute
    const resolveFile = (p) => (path.isAbsolute(p) ? p : path.resolve(__dirname, '..', p));
    try {
      const caPath = resolveFile(DB_CA_PATH);
      const sslObj = { ca: fs.readFileSync(caPath) };
      if (DB_CLIENT_CERT && DB_CLIENT_KEY) {
        sslObj.cert = fs.readFileSync(resolveFile(DB_CLIENT_CERT));
        sslObj.key = fs.readFileSync(resolveFile(DB_CLIENT_KEY));
      }
      poolConfig.ssl = sslObj;
    } catch (err) {
      throw new Error(`Failed to read SSL files (checked relative to server/): ${err.message}`);
    }
  }

  return poolConfig;
}

function createPool() {
  if (pool) return pool;
  validateEnv();
  const cfg = buildPoolConfig();
  pool = mysql.createPool(cfg);
  return pool;
}

function ensurePool() {
  if (!pool) createPool();
  return pool;
}

// Initialize the pool and verify connectivity. Call this at app startup.
async function initDB() {
  try {
    // ensure pool exists (will validate env vars)
    createPool();
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT NOW() AS now');
      const serverTime = rows && rows[0] && rows[0].now ? rows[0].now : 'unknown';
      console.log(`MySQL connected -> ${DB_HOST}:${DB_PORT}/${DB_NAME} (server time: ${serverTime})`);
    } finally {
      conn.release();
    }
    return true;
  } catch (err) {
    // If it's our validation error, it will be descriptive already.
    console.error('MySQL connection failed:', err.message || err);
    // rethrow so the caller can decide to exit or retry
    throw err;
  }
}

// Helper: run queries using the pool
async function query(sql, params) {
  ensurePool();
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Helper: get a dedicated connection (useful for transactions)
async function getConnection() {
  ensurePool();
  return pool.getConnection();
}

// Close pool (useful on shutdown)
async function closePool() {
  try {
    if (!pool) return;
    await pool.end();
    console.log('MySQL pool closed');
  } catch (err) {
    console.error('Error closing MySQL pool:', err.message || err);
  }
}

// Export the pool and helpers. Typical usage:
// const db = require('./DB/db'); await db.initDB(); const rows = await db.query('SELECT 1');
module.exports = {
  // note: `pool` may be created lazily; prefer using query/getConnection/initDB
  pool,
  initDB,
  query,
  getConnection,
  closePool
};

// If this file is executed directly, run a quick connectivity check and exit.
if (require.main === module) {
  (async () => {
    try {
      await initDB();
      // close the pool after the check so the process can exit cleanly
      await closePool();
      process.exit(0);
    } catch (err) {
      // initDB already logged the error
      process.exit(1);
    }
  })();
}
