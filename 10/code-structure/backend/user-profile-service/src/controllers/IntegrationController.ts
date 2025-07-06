import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import UserProfileService from '../services/UserProfileService';
import { CreateProfileRequest } from '../types';

export class IntegrationController {
  
  /**
   * Endpoint for auth service to create a profile when a user registers
   */
  async createProfileFromAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, email, firstName, lastName } = req.body;

      if (!userId || !email || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, email, firstName, lastName'
        });
        return;
      }

      // Check if profile already exists
      const existingProfile = await UserProfileService.getProfile(userId);
      if (existingProfile) {
        res.status(409).json({
          success: false,
          message: 'Profile already exists for this user',
          data: existingProfile
        });
        return;
      }

      // Create basic profile
      const profileData: CreateProfileRequest = {
        firstName,
        lastName
      };

      const profile = await UserProfileService.createProfile(userId, email, profileData);

      res.status(201).json({
        success: true,
        message: 'Profile created successfully from auth service',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint for auth service to update user email when changed
   */
  async updateUserEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const profile = await UserProfileService.getProfile(userId);
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      // Update profile email
      await profile.update({ email });

      res.json({
        success: true,
        message: 'Profile email updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint for auth service to delete profile when user is deleted
   */
  async deleteProfileFromAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await UserProfileService.getProfile(userId);
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      await UserProfileService.deleteProfile(userId);

      res.json({
        success: true,
        message: 'Profile deleted successfully from auth service'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check endpoint for auth service
   */
  async healthCheck(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        message: 'User Profile Service is healthy',
        timestamp: new Date().toISOString(),
        service: 'user-profile-service',
        version: '1.0.0'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile summary for auth service
   */
  async getProfileSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await UserProfileService.getProfile(userId);
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      // Return basic profile info for auth service
      const summary = {
        id: profile.id,
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        hasCompletedProfile: !!(profile.bio && profile.location),
        profileVisibility: profile.privacy.profileVisibility,
        lastUpdated: profile.updatedAt
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new IntegrationController();
