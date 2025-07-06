import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('user_profiles', {
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
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      occupation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
    });

    // Add indexes
    await queryInterface.addIndex('user_profiles', ['userId'], {
      unique: true,
      name: 'user_profiles_user_id_unique'
    });

    await queryInterface.addIndex('user_profiles', ['email'], {
      unique: true,
      name: 'user_profiles_email_unique'
    });

    await queryInterface.addIndex('user_profiles', ['firstName', 'lastName'], {
      name: 'user_profiles_full_name_index'
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('user_profiles');
  }
};
