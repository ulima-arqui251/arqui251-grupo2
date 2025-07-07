import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  value: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  weight: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 1.0,
    validate: {
      min: 0,
      max: 10
    }
  },
  
  type: {
    type: DataTypes.ENUM('assignment', 'quiz', 'exam', 'participation', 'project'),
    allowNull: false
  },
  
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  isExcused: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  
  assignmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'assignments',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
  
}, {
  tableName: 'grades',
  indexes: [
    { fields: ['course_id'] },
    { fields: ['student_id'] },
    { fields: ['teacher_id'] },
    { fields: ['assignment_id'] },
    { fields: ['type'] },
    { fields: ['value'] }
  ]
});

export default Grade;
