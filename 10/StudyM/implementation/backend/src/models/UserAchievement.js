import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserAchievement = sequelize.define('UserAchievement', {
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
  achievementId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'achievements',
      key: 'id'
    }
  },
  unlockedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  progress: {
    type: DataTypes.JSON,
    allowNull: true,
    // Para tracking de progreso hacia el logro
    // Ejemplo: { "current": 7, "target": 10 }
  },
  isNotified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'user_achievements',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['achievement_id']
    },
    {
      fields: ['user_id', 'achievement_id'],
      unique: true
    },
    {
      fields: ['unlocked_at']
    }
  ]
});

export default UserAchievement;
