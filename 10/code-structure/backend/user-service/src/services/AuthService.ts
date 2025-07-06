import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Pool } from 'mysql2/promise';
import { 
  User, 
  UserRole, 
  CreateUserRequest, 
  LoginRequest, 
  LoginResponse, 
  AuthTokenPayload,
  RefreshTokenRequest
} from '../models/User';

export class AuthService {
  private db: Pool;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private jwtExpiresIn: string;
  private jwtRefreshExpiresIn: string;
  private saltRounds: number;

  constructor(db: Pool) {
    this.db = db;
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  }

  async register(userData: CreateUserRequest): Promise<Omit<User, 'password'>> {
    const connection = await this.db.getConnection();
    
    try {
      // Check if user already exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Insert user
      const userId = crypto.randomUUID();
      await connection.execute(`
        INSERT INTO users (
          id, email, password, firstName, lastName, role, 
          emailVerificationToken, phoneNumber, marketingConsent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        userData.email,
        hashedPassword,
        userData.firstName,
        userData.lastName,
        userData.role || UserRole.STUDENT,
        emailVerificationToken,
        userData.phoneNumber || null,
        userData.marketingConsent || false
      ]);

      // Fetch created user
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      const user = Array.isArray(users) && users.length > 0 ? users[0] as any : null;
      if (!user) {
        throw new Error('Failed to create user');
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } finally {
      connection.release();
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const connection = await this.db.getConnection();
    
    try {
      // Find user by email
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE email = ? AND isActive = TRUE',
        [credentials.email]
      );

      const user = Array.isArray(users) && users.length > 0 ? users[0] as any : null;
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await connection.execute(
        'UPDATE users SET lastLoginAt = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Generate tokens
      const accessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const refreshToken = this.generateRefreshToken();

      // Store refresh token
      await connection.execute(`
        INSERT INTO refresh_tokens (userId, token, expiresAt) 
        VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY))
      `, [user.id, refreshToken]);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };

    } finally {
      connection.release();
    }
  }

  async refreshToken(request: RefreshTokenRequest): Promise<{ accessToken: string; refreshToken: string }> {
    const connection = await this.db.getConnection();
    
    try {
      // Verify refresh token exists and is not expired
      const [tokens] = await connection.execute(`
        SELECT rt.*, u.id as userId, u.email, u.role 
        FROM refresh_tokens rt
        JOIN users u ON rt.userId = u.id
        WHERE rt.token = ? AND rt.expiresAt > CURRENT_TIMESTAMP AND rt.isRevoked = FALSE
      `, [request.refreshToken]);

      const tokenData = Array.isArray(tokens) && tokens.length > 0 ? tokens[0] as any : null;
      if (!tokenData) {
        throw new Error('Invalid refresh token');
      }

      // Revoke old refresh token
      await connection.execute(
        'UPDATE refresh_tokens SET isRevoked = TRUE WHERE token = ?',
        [request.refreshToken]
      );

      // Generate new tokens
      const accessToken = this.generateAccessToken({
        userId: tokenData.userId,
        email: tokenData.email,
        role: tokenData.role
      });

      const newRefreshToken = this.generateRefreshToken();

      // Store new refresh token
      await connection.execute(`
        INSERT INTO refresh_tokens (userId, token, expiresAt) 
        VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY))
      `, [tokenData.userId, newRefreshToken]);

      return {
        accessToken,
        refreshToken: newRefreshToken
      };

    } finally {
      connection.release();
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    const connection = await this.db.getConnection();
    
    try {
      if (refreshToken) {
        // Revoke specific refresh token
        await connection.execute(
          'UPDATE refresh_tokens SET isRevoked = TRUE WHERE userId = ? AND token = ?',
          [userId, refreshToken]
        );
      } else {
        // Revoke all refresh tokens for user
        await connection.execute(
          'UPDATE refresh_tokens SET isRevoked = TRUE WHERE userId = ?',
          [userId]
        );
      }
    } finally {
      connection.release();
    }
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const connection = await this.db.getConnection();
    
    try {
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE id = ? AND isActive = TRUE',
        [userId]
      );

      const user = Array.isArray(users) && users.length > 0 ? users[0] as any : null;
      if (!user) {
        return null;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } finally {
      connection.release();
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const connection = await this.db.getConnection();
    
    try {
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE emailVerificationToken = ?',
        [token]
      );

      const user = Array.isArray(users) && users.length > 0 ? users[0] as any : null;
      if (!user) {
        return false;
      }

      await connection.execute(
        'UPDATE users SET isEmailVerified = TRUE, emailVerificationToken = NULL WHERE id = ?',
        [user.id]
      );

      return true;

    } finally {
      connection.release();
    }
  }

  generateAccessToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload as object, this.jwtSecret, { 
      expiresIn: 86400 // 24 horas en segundos
    });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  verifyAccessToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthTokenPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
}
