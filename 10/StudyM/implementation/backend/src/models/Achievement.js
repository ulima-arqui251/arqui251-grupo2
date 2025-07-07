import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'lessons',          // Completar lecciones
      'points',          // Acumular puntos
      'streak',          // Rachas de actividad
      'subject',         // Dominio de materias
      'time',            // Tiempo de estudio
      'social',          // Actividades sociales
      'special'          // Logros especiales
    ),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'count',           // Basado en cantidad (ej: completar X lecciones)
      'threshold',       // Basado en umbral (ej: alcanzar X puntos)
      'consecutive',     // Basado en consecutividad (ej: X días seguidos)
      'percentage',      // Basado en porcentaje (ej: 100% en una materia)
      'unique'           // Logro único/especial
    ),
    allowNull: false
  },
  condition: {
    type: DataTypes.JSON,
    allowNull: false,
    // Ejemplo: { "target": 10, "subject": "mathematics" }
    // Ejemplo: { "target": 1000, "type": "total_points" }
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    defaultValue: 'common',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'achievements',
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['type']
    },
    {
      fields: ['rarity']
    },
    {
      fields: ['is_active']
    }
  ]
});

export default Achievement;
