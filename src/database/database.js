import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'octodock',
  max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Executes a parameterized query using the connection pool.
 * @param {string} text - The SQL query text.
 * @param {Array<any>} [params] - Optional array of query parameters.
 * @returns {Promise<any>} - Resolves with the query result rows.
 */
export async function query(text, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * Retrieves a client from the pool for transactional operations.
 * Remember to release the client after use.
 * @returns {Promise<import('pg').PoolClient>}
 */
export async function getClient() {
  return pool.connect();
}

export default pool;
