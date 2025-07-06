import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'studymate_users',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

export const createConnection = async (): Promise<mysql.Connection> => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('📊 Database connection established successfully');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const createPool = (): mysql.Pool => {
  try {
    const pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      charset: dbConfig.charset,
      timezone: dbConfig.timezone,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('📊 Database pool created successfully');
    return pool;
  } catch (error) {
    console.error('❌ Database pool creation failed:', error);
    throw error;
  }
};

// Initialize database and tables
export const initializeDatabase = async (): Promise<void> => {
  let connection: mysql.Connection | null = null;
  
  try {
    // Create database if it doesn't exist
    const connectionWithoutDB = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connectionWithoutDB.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connectionWithoutDB.end();

    // Connect to the database
    connection = await createConnection();

    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
        isEmailVerified BOOLEAN DEFAULT FALSE,
        emailVerificationToken VARCHAR(255) NULL,
        resetPasswordToken VARCHAR(255) NULL,
        resetPasswordExpires DATETIME NULL,
        lastLoginAt DATETIME NULL,
        isActive BOOLEAN DEFAULT TRUE,
        profilePicture VARCHAR(500) NULL,
        bio TEXT NULL,
        dateOfBirth DATE NULL,
        phoneNumber VARCHAR(20) NULL,
        address TEXT NULL,
        city VARCHAR(100) NULL,
        country VARCHAR(100) NULL,
        timezone VARCHAR(50) DEFAULT 'UTC',
        language VARCHAR(10) DEFAULT 'es',
        marketingConsent BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_isActive (isActive),
        INDEX idx_emailVerificationToken (emailVerificationToken),
        INDEX idx_resetPasswordToken (resetPasswordToken)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createUsersTable);

    // Create refresh_tokens table for token management
    const createRefreshTokensTable = `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        userId VARCHAR(36) NOT NULL,
        token VARCHAR(500) NOT NULL,
        expiresAt DATETIME NOT NULL,
        isRevoked BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_token (token),
        INDEX idx_expiresAt (expiresAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createRefreshTokensTable);

    console.log('✅ Database and tables initialized successfully');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export default { createConnection, createPool, initializeDatabase };
