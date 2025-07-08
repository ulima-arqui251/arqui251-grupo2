import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 255]
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  instructions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString()
    }
  },
  
  maxPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 1,
      max: 1000
    }
  },
  
  type: {
    type: DataTypes.ENUM('homework', 'quiz', 'exam', 'project', 'essay'),
    allowNull: false,
    defaultValue: 'homework'
  },
  
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'medium'
  },
  
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  allowLateSubmission: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
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
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
  
}, {
  tableName: 'assignments',
  indexes: [
    { fields: ['course_id'] },
    { fields: ['created_by'] },
    { fields: ['due_date'] },
    { fields: ['type'] },
    { fields: ['is_published'] }
  ]
});

export default Assignment;
