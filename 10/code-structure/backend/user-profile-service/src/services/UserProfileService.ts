import { UserProfile, ActivityLog } from '../models';
import { 
  CreateProfileRequest, 
  UpdateProfileRequest, 
  UpdatePreferencesRequest, 
  UpdatePrivacyRequest 
} from '../types';
import { Op } from 'sequelize';
import AuthServiceClient from './AuthServiceClient';

export class UserProfileService {
  
  async createProfile(userId: string, email: string, profileData: CreateProfileRequest): Promise<UserProfile> {
    // Validate user exists in auth service
    const userExists = await AuthServiceClient.validateUserExists(userId);
    if (!userExists) {
      throw new Error('User not found in authentication service');
    }

    // Check if profile already exists
    const existingProfile = await UserProfile.findOne({ where: { userId } });
    if (existingProfile) {
      throw new Error('Profile already exists for this user');
    }

    // Get additional user info from auth service if available
    let authUser = null;
    try {
      const authServiceAvailable = await AuthServiceClient.healthCheck();
      if (authServiceAvailable) {
        // This would require a service-to-service authentication method
        // For now, we'll just validate the user exists
      }
    } catch (error) {
      console.warn('Could not get user info from auth service:', error);
    }

    // Create the profile
    const profile = await UserProfile.create({
      userId,
      email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      bio: profileData.bio,
      location: profileData.location,
      occupation: profileData.occupation,
      website: profileData.website,
      socialLinks: profileData.socialLinks || {},
      preferences: {
        language: 'es',
        timezone: 'America/Mexico_City',
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          studyReminders: true,
          progressUpdates: true,
          socialActivity: false
        },
        studySettings: {
          defaultStudyTime: 25,
          breakTime: 5,
          dailyGoal: 120,
          weeklyGoal: 840,
          difficultyLevel: 'intermediate',
          preferredCategories: []
        },
        ...profileData.preferences
      },
      privacy: {
        profileVisibility: 'public',
        showProgress: true,
        showAchievements: true,
        showActivity: true,
        allowMessages: true,
        ...profileData.privacy
      }
    });

    // Log the activity
    await ActivityLog.logActivity(
      userId,
      'profile_created',
      'User profile created successfully'
    );

    // Notify auth service about profile creation
    try {
      await AuthServiceClient.notifyProfileCreated(userId, {
        profileId: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName
      });
    } catch (error) {
      console.warn('Could not notify auth service about profile creation:', error);
    }

    return profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return await UserProfile.findOne({ 
      where: { userId },
      include: [{
        model: ActivityLog,
        as: 'activities',
        limit: 10,
        order: [['timestamp', 'DESC']]
      }]
    });
  }

  async getProfileById(profileId: string): Promise<UserProfile | null> {
    return await UserProfile.findOne({ 
      where: { id: profileId },
      include: [{
        model: ActivityLog,
        as: 'activities',
        limit: 10,
        order: [['timestamp', 'DESC']]
      }]
    });
  }

  async updateProfile(userId: string, updateData: UpdateProfileRequest): Promise<UserProfile> {
    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Update the profile
    await profile.update(updateData);

    // Log the activity
    await ActivityLog.logActivity(
      userId,
      'profile_updated',
      'User profile updated successfully',
      { updatedFields: Object.keys(updateData) }
    );

    return profile;
  }

  async updatePreferences(userId: string, preferences: UpdatePreferencesRequest): Promise<UserProfile> {
    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Merge with existing preferences
    const updatedPreferences = {
      ...profile.preferences,
      ...preferences,
      notifications: {
        ...profile.preferences.notifications,
        ...preferences.notifications
      },
      studySettings: {
        ...profile.preferences.studySettings,
        ...preferences.studySettings
      }
    };

    await profile.update({ preferences: updatedPreferences });

    // Log the activity
    await ActivityLog.logActivity(
      userId,
      'preferences_updated',
      'User preferences updated successfully',
      { updatedFields: Object.keys(preferences) }
    );

    return profile;
  }

  async updatePrivacy(userId: string, privacy: UpdatePrivacyRequest): Promise<UserProfile> {
    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Merge with existing privacy settings
    const updatedPrivacy = {
      ...profile.privacy,
      ...privacy
    };

    await profile.update({ privacy: updatedPrivacy });

    // Log the activity
    await ActivityLog.logActivity(
      userId,
      'privacy_updated',
      'User privacy settings updated successfully',
      { updatedFields: Object.keys(privacy) }
    );

    return profile;
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile> {
    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    await profile.update({ avatar: avatarUrl });

    // Log the activity
    await ActivityLog.logActivity(
      userId,
      'avatar_updated',
      'User avatar updated successfully',
      { avatarUrl }
    );

    return profile;
  }

  async deleteProfile(userId: string): Promise<void> {
    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Delete associated activity logs
    await ActivityLog.destroy({ where: { userId } });

    // Delete the profile
    await profile.destroy();

    // Notify auth service about profile deletion
    try {
      await AuthServiceClient.notifyProfileDeleted(userId);
    } catch (error) {
      console.warn('Could not notify auth service about profile deletion:', error);
    }

    // Note: We can't log this activity since the profile is deleted
  }

  async searchProfiles(query: string, limit: number = 20, offset: number = 0): Promise<UserProfile[]> {
    return await UserProfile.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${query}%` } },
          { lastName: { [Op.like]: `%${query}%` } },
          { occupation: { [Op.like]: `%${query}%` } },
          { location: { [Op.like]: `%${query}%` } }
        ],
        '$privacy.profileVisibility$': {
          [Op.in]: ['public', 'friends']
        }
      },
      limit,
      offset,
      order: [['firstName', 'ASC']]
    });
  }

  async getPublicProfiles(limit: number = 20, offset: number = 0): Promise<UserProfile[]> {
    return await UserProfile.findAll({
      where: {
        '$privacy.profileVisibility$': 'public'
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  async getUserActivity(userId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    const activities = await ActivityLog.getUserActivity(userId, limit, offset);
    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      description: activity.description,
      metadata: activity.metadata,
      timestamp: activity.timestamp
    }));
  }
}

export default new UserProfileService();
