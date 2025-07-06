import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'support';
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface AuthServiceResponse {
  success: boolean;
  message: string;
  data?: AuthUser;
  error?: string;
}

export class AuthServiceClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    this.timeout = 5000; // 5 seconds timeout
  }

  /**
   * Verify a JWT token with the auth service
   */
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const response = await axios.get(`${this.baseURL}/api/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      if (response.data.success && response.data.data) {
        return response.data.data as AuthUser;
      }

      return null;
    } catch (error) {
      console.error('Error verifying token with auth service:', error);
      return null;
    }
  }

  /**
   * Get user information from auth service
   */
  async getUserById(userId: string, token: string): Promise<AuthUser | null> {
    try {
      const response = await axios.get(`${this.baseURL}/api/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      if (response.data.success && response.data.data) {
        return response.data.data as AuthUser;
      }

      return null;
    } catch (error) {
      console.error('Error getting user from auth service:', error);
      return null;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(token: string): Promise<AuthUser | null> {
    try {
      const response = await axios.get(`${this.baseURL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      if (response.data.success && response.data.data) {
        return response.data.data as AuthUser;
      }

      return null;
    } catch (error) {
      console.error('Error getting current user from auth service:', error);
      return null;
    }
  }

  /**
   * Check if auth service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: this.timeout
      });

      return response.status === 200;
    } catch (error) {
      console.error('Auth service health check failed:', error);
      return false;
    }
  }

  /**
   * Validate user exists in auth service
   */
  async validateUserExists(userId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/auth/users/${userId}/exists`, {
        timeout: this.timeout
      });

      return response.data.success && response.data.data?.exists;
    } catch (error) {
      console.error('Error validating user exists:', error);
      return false;
    }
  }

  /**
   * Notify auth service about profile creation
   */
  async notifyProfileCreated(userId: string, profileData: any): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/api/auth/users/${userId}/profile-created`, {
        profileData
      }, {
        timeout: this.timeout
      });
    } catch (error) {
      console.error('Error notifying profile creation:', error);
      // Don't throw error, this is just a notification
    }
  }

  /**
   * Notify auth service about profile deletion
   */
  async notifyProfileDeleted(userId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/api/auth/users/${userId}/profile-deleted`, {}, {
        timeout: this.timeout
      });
    } catch (error) {
      console.error('Error notifying profile deletion:', error);
      // Don't throw error, this is just a notification
    }
  }
}

export default new AuthServiceClient();
