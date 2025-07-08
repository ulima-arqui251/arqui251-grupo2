import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserStats = sequelize.define('UserStats', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  currentLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  experiencePoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  lessonsCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  lastActivityDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Estadísticas por materia
  mathPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sciencePoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  languagePoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  historyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  geographyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  artPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  musicPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  physicalEducationPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  technologyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  otherPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'user_stats',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id'],
      unique: true
    },
    {
      fields: ['total_points']
    },
    {
      fields: ['current_level']
    }
  ]
});

export default UserStats;
