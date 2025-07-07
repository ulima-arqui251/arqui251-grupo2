import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 200]
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Contenido de la lección (HTML/Markdown)
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  
  // Tipo de lección
  type: {
    type: DataTypes.ENUM('video', 'reading', 'interactive', 'quiz'),
    allowNull: false,
    defaultValue: 'reading'
  },
  
  // URL del video (si aplica)
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Duración estimada en minutos
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 15
  },
  
  // Orden dentro del curso
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  
  // Puntos que otorga la lección
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  
  // Estado de la lección
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // ¿Es lección premium?
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // ID del curso al que pertenece
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  }
}, {
  tableName: 'lessons',
  indexes: [
    { fields: ['course_id'] },
    { fields: ['type'] },
    { fields: ['is_active'] },
    { fields: ['is_premium'] },
    { fields: ['course_id', 'order'] }
  ]
});

export default Lesson;
