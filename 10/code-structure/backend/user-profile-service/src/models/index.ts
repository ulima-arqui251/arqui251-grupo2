import { sequelize } from '../config/database';
import UserProfile from './UserProfile';
import ActivityLog from './ActivityLog';

// Define associations
UserProfile.hasMany(ActivityLog, {
  foreignKey: 'userId',
  as: 'activities'
});

ActivityLog.belongsTo(UserProfile, {
  foreignKey: 'userId',
  as: 'user'
});

export {
  sequelize,
  UserProfile,
  ActivityLog
};

export default {
  sequelize,
  UserProfile,
  ActivityLog
};
