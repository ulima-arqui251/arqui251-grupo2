import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PointsTransaction = sequelize.define('PointsTransaction', {
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
  points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'lesson_completed',
      'achievement_unlocked',
      'daily_bonus',
      'streak_bonus',
      'perfect_score',
      'first_lesson',
      'quiz_completed',
      'challenge_completed',
      'referral_bonus',
      'admin_adjustment'
    ),
    allowNull: false
  },
  source: {
    type: DataTypes.ENUM('lesson', 'achievement', 'system', 'admin'),
    allowNull: false
  },
  sourceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // ID de la lección, logro, etc. que generó los puntos
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    // Información adicional sobre la transacción
  }
}, {
  tableName: 'points_transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['source']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default PointsTransaction;
