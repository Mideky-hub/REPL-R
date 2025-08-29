import { Pool, Client } from 'pg';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'replay_db',
  user: process.env.DB_USER || 'replay_user',
  password: process.env.DB_PASSWORD || 'replay_secure_password_2024',
  ssl: false, // Disable SSL for Docker internal communication
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close clients after 30 seconds of inactivity
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create a connection pool
let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  
  return pool;
};

// Get a single client from the pool
export const getClient = async () => {
  const pool = getPool();
  return await pool.connect();
};

// Execute a query with automatic connection handling
export const query = async (text: string, params?: unknown[]) => {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT health_check() as status');
    console.log('Database health check:', result.rows[0]?.status);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Close all connections (useful for testing or graceful shutdown)
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (client: { query: (text: string, values?: unknown[]) => Promise<unknown> }) => Promise<T>
): Promise<T> => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Database connection test
export const testConnection = async () => {
  try {
    const client = new Client(dbConfig);
    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();
    
    console.log('✅ Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};