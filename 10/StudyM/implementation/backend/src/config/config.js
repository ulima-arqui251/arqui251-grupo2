import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DB_TYPE: process.env.DB_TYPE || 'sqlite',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '12345',
  DB_NAME: process.env.DB_NAME || 'studymate',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_STORAGE: process.env.DB_STORAGE || './database.sqlite',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Security
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
};
