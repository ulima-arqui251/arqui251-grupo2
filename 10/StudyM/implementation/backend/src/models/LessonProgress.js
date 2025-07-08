import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const LessonProgress = sequelize.define('LessonProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Estado de progreso
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
    allowNull: false,
    defaultValue: 'not_started'
  },
  
  // Progreso en porcentaje (0-100)
  progressPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  // Tiempo invertido en minutos
  timeSpent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  // Fecha de inicio
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Fecha de finalización
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Puntuación obtenida (si es quiz)
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  // Puntos ganados
  pointsEarned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  // ID del usuario
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // ID de la lección
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    }
  }
}, {
  tableName: 'lesson_progress',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['lesson_id'] },
    { fields: ['status'] },
    { 
      fields: ['user_id', 'lesson_id'],
      unique: true // Un usuario solo puede tener un progreso por lección
    }
  ]
});

export default LessonProgress;
