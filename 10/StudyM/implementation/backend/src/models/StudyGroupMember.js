import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const StudyGroupMember = sequelize.define('StudyGroupMember', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  role: {
    type: DataTypes.ENUM('member', 'moderator', 'owner'),
    allowNull: false,
    defaultValue: 'member'
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // userId y studyGroupId serán agregados como foreign keys
}, {
  tableName: 'study_group_members',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'study_group_id'] // Un usuario solo puede estar una vez en un grupo
    },
    {
      fields: ['study_group_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['role']
    }
  ]
});

export default StudyGroupMember;
