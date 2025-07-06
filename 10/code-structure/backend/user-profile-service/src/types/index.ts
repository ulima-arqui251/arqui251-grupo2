export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: UserPreferences;
  privacy: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  studySettings: StudySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  studyReminders: boolean;
  progressUpdates: boolean;
  socialActivity: boolean;
}

export interface StudySettings {
  defaultStudyTime: number; // in minutes
  breakTime: number; // in minutes
  dailyGoal: number; // in minutes
  weeklyGoal: number; // in minutes
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredCategories: string[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgress: boolean;
  showAchievements: boolean;
  showActivity: boolean;
  allowMessages: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface CreateProfileRequest {
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  occupation?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: Partial<UserPreferences>;
  privacy?: Partial<PrivacySettings>;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UpdatePreferencesRequest {
  language?: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: Partial<NotificationSettings>;
  studySettings?: Partial<StudySettings>;
}

export interface UpdatePrivacyRequest {
  profileVisibility?: 'public' | 'friends' | 'private';
  showProgress?: boolean;
  showAchievements?: boolean;
  showActivity?: boolean;
  allowMessages?: boolean;
}
