import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import UserProfileService from '../services/UserProfileService';
import FileService from '../services/FileService';
import { CreateProfileRequest, UpdateProfileRequest, UpdatePreferencesRequest, UpdatePrivacyRequest } from '../types';

interface UploadRequest extends AuthRequest {
  file?: Express.Multer.File;
}

export class UserProfileController {
  
  async createProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false, 
          message: 'User authentication required' 
        });
        return;
      }

      const profileData: CreateProfileRequest = req.body;
      const profile = await UserProfileService.createProfile(
        req.user.userId,
        req.user.email,
        profileData
      );

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false, 
          message: 'User authentication required' 
        });
        return;
      }

      const profile = await UserProfileService.getProfile(req.user.userId);
      
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfileById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await UserProfileService.getProfileById(id);
      
      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
        return;
      }

      // Check if the requesting user has permission to view this profile
      let profileData;
      if (req.user && req.user.userId === profile.userId) {
        // User is viewing their own profile - return full data
        profileData = profile;
      } else {
        // User is viewing another user's profile - apply privacy settings
        profileData = profile.toPublicJSON();
      }

      res.json({
        success: true,
        data: profileData
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false, 
          message: 'User authentication required' 
        });
        return;
      }

      const updateData: UpdateProfileRequest = req.body;
      const profile = await UserProfileService.updateProfile(req.user.userId, updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false, 
          message: 'User authentication required' 
        });
        return;
      }

      const preferences: UpdatePreferencesRequest = req.body;
      const profile = await UserProfileService.updatePreferences(req.user.userId, preferences);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePrivacy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false, 
          message: 'User authentication required' 
        });
        return;
      }

      const privacy: UpdatePrivacyRequest = req.body;
      const profile = await UserProfileService.updatePrivacy(req.user.userId, privacy);

      res.json({
        success: true,
        message: 'Privacy settings updated successfully',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: UploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false, 
          message: 'User authentication required' 
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      // Get current profile to delete old avatar if exists
      const currentProfile = await UserProfileService.getProfile(req.user.userId);
      const oldAvatarUrl = currentProfile?.avatar;

      // Upload new avatar
      const avatarUrl = await FileService.uploadAvatar(req.file, req.user.userId);
      
      // Update profile with new avatar URL
      const profile = await UserProfileService.updateAvatar(req.user.userId, avatarUrl);

      // Delete old avatar file if it exists
      if (oldAvatarUrl) {
        await FileService.deleteAvatar(oldAvatarUrl);
      }

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatar: avatarUrl,
          profile: profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false, 
          message: 'User authentication required' 
        });
        return;
      }

      // Get profile to delete avatar file
      const profile = await UserProfileService.getProfile(req.user.userId);
      
      if (profile?.avatar) {
        await FileService.deleteAvatar(profile.avatar);
      }

      await UserProfileService.deleteProfile(req.user.userId);

      res.json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async searchProfiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: query = '', limit = 20, offset = 0 } = req.query;
      
      const profiles = await UserProfileService.searchProfiles(
        query as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      // Apply privacy settings to all profiles
      const publicProfiles = profiles.map(profile => profile.toPublicJSON());

      res.json({
        success: true,
        data: {
          profiles: publicProfiles,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: profiles.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicProfiles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      const profiles = await UserProfileService.getPublicProfiles(
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const publicProfiles = profiles.map(profile => profile.toPublicJSON());

      res.json({
        success: true,
        data: {
          profiles: publicProfiles,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: profiles.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false, 
          message: 'User authentication required' 
        });
        return;
      }

      const { limit = 50, offset = 0 } = req.query;
      
      const activities = await UserProfileService.getUserActivity(
        req.user.userId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: {
          activities,
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: activities.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserProfileController();
