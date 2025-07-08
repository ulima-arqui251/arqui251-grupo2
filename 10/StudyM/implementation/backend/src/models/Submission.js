import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  grade: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  status: {
    type: DataTypes.ENUM('submitted', 'graded', 'returned', 'late'),
    allowNull: false,
    defaultValue: 'submitted'
  },
  
  isLate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  gradedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  assignmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'assignments',
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
  tableName: 'submissions',
  indexes: [
    { fields: ['assignment_id'] },
    { fields: ['student_id'] },
    { fields: ['status'] },
    { fields: ['submitted_at'] },
    { fields: ['graded_by'] },
    { 
      fields: ['assignment_id', 'student_id'],
      unique: true
    }
  ]
});

export default Submission;
