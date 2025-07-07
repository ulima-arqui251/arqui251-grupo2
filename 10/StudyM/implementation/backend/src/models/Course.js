import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Course = sequelize.define('Course', {
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
  
  // Materias según documentación (2-3 materias core)
  subject: {
    type: DataTypes.ENUM('matematicas', 'ciencias', 'programacion'),
    allowNull: false
  },
  
  // Nivel de dificultad
  level: {
    type: DataTypes.ENUM('basico', 'intermedio', 'avanzado'),
    allowNull: false,
    defaultValue: 'basico'
  },
  
  // Duración estimada en minutos
  estimatedDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60
  },
  
  // Imagen de portada
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Estado del curso
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Orden para mostrar cursos
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // ID del docente que creó el curso
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'courses',
  indexes: [
    { fields: ['subject'] },
    { fields: ['level'] },
    { fields: ['is_active'] },
    { fields: ['created_by'] }
  ]
});

export default Course;
