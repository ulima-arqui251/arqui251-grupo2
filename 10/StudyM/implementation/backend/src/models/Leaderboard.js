import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Leaderboard = sequelize.define('Leaderboard', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  type: {
    type: DataTypes.ENUM(
      'global',          // Ranking global
      'weekly',          // Ranking semanal
      'monthly',         // Ranking mensual
      'subject',         // Ranking por materia
      'level',           // Ranking por nivel académico
      'institution'      // Ranking por institución
    ),
    allowNull: false
  },
  period: {
    type: DataTypes.STRING(20),
    allowNull: true,
    // Para rankings temporales: "2024-W01", "2024-01", etc.
  },
  subject: {
    type: DataTypes.STRING(50),
    allowNull: true,
    // Para rankings por materia
  },
  institutionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    // Para rankings por institución
  },
  rankings: {
    type: DataTypes.JSON,
    allowNull: false,
    // Array de rankings: [{ userId, points, position, change }]
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'leaderboards',
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['period']
    },
    {
      fields: ['subject']
    },
    {
      fields: ['institution_id']
    },
    {
      fields: ['last_updated']
    }
  ]
});

export default Leaderboard;
