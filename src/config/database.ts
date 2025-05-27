import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

// MySQL connection pool
let pool: mysql.Pool;

/**
 * Initialize the database connection pool
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'auth_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    logger.info('Database connection established');
    
    // Initialize database schema if it doesn't exist
    await initializeSchema(connection);
    
    connection.release();
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    throw error;
  }
};

/**
 * Execute a SQL query
 */
export const executeQuery = async <T>(
  sql: string, 
  params: any[] = []
): Promise<T> => {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
};

/**
 * Initialize database schema if it doesn't exist
 */
const initializeSchema = async (connection: mysql.PoolConnection): Promise<void> => {
  try {
    // Create users table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        profile_picture VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create social_accounts table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS social_accounts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        provider_access_token TEXT,
        provider_refresh_token TEXT,
        provider_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_provider_account (user_id, provider)
      )
    `);

    // Create refresh_tokens table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        revoked BOOLEAN DEFAULT false,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    logger.info('Database schema initialized');
  } catch (error) {
    logger.error('Failed to initialize database schema:', error);
    throw error;
  }
};