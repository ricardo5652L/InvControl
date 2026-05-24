import mysql from 'mysql2/promise';
import { config } from './config.js';

let pool = null;

/**
 * Creates a MySQL connection pool
 * Only called explicitly when DATA_SOURCE=mysql
 * @returns {mysql.Pool}
 */
function createPool() {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return pool;
}

/**
 * Gets the MySQL connection pool
 * Only creates pool if explicitly called
 * @returns {mysql.Pool}
 */
export function getPool() {
  return createPool();
}

/**
 * Tests the MySQL database connection
 * Only called when explicitly needed and DATA_SOURCE=mysql
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    if (config.DATA_SOURCE !== 'mysql') {
      return false;
    }

    const poolInstance = getPool();
    const connection = await poolInstance.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
}

/**
 * Closes the MySQL connection pool
 * Call this on server shutdown
 * @returns {Promise<void>}
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default {
  getPool,
  testConnection,
  closePool
};
