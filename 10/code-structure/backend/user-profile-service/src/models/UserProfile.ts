import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { UserProfile as IUserProfile, UserPreferences, PrivacySettings } from '../types';

interface UserProfileCreationAttributes extends Optional<IUserProfile, 'id' | 'createdAt' | 'updatedAt'> {}

class UserProfile extends Model<IUserProfile, UserProfileCreationAttributes> implements IUserProfile {
  public id!: string;
  public userId!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public avatar?: string;
  public bio?: string;
  public location?: string;
  public occupation?: string;
  public website?: string;
  public socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  public preferences!: UserPreferences;
  public privacy!: PrivacySettings;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual attributes
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public toPublicJSON() {
    const profile = this.toJSON();
    
    // Apply privacy settings
    if (this.privacy.profileVisibility === 'private') {
      return {
        id: profile.id,
        firstName: profile.firstName,
        avatar: profile.avatar
      };
    }

    if (this.privacy.profileVisibility === 'friends') {
      return {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        bio: profile.bio
      };
    }

    // Public profile
    const publicProfile: any = { ...profile };
    delete publicProfile.email;
    delete publicProfile.preferences;
    delete publicProfile.privacy;
    
    return publicProfile;
  }
}

UserProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users', // This will reference the auth-service users table
        key: 'id'
      }
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50],
        notEmpty: true
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    occupation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    socialLinks: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
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
        }
      }
    },
    privacy: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        profileVisibility: 'public',
        showProgress: true,
        showAchievements: true,
        showActivity: true,
        allowMessages: true
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'user_profiles',
    modelName: 'UserProfile',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['userId']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['firstName', 'lastName']
      }
    ]
  }
);

export default UserProfile;
