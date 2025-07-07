import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  enrolledAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped', 'suspended'),
    allowNull: false,
    defaultValue: 'active'
  },
  
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  finalGrade: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  certificateIssued: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  }
  
}, {
  tableName: 'enrollments',
  indexes: [
    { fields: ['course_id'] },
    { fields: ['student_id'] },
    { fields: ['status'] },
    { fields: ['enrolled_at'] },
    { 
      fields: ['course_id', 'student_id'],
      unique: true
    }
  ]
});

export default Enrollment;
