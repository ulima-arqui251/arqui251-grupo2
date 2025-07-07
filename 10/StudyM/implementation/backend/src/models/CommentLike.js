import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const CommentLike = sequelize.define('CommentLike', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  type: {
    type: DataTypes.ENUM('like', 'dislike'),
    allowNull: false,
    defaultValue: 'like'
  },
  // userId y commentId serán agregados como foreign keys
}, {
  tableName: 'comment_likes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'comment_id'] // Un usuario solo puede dar un like/dislike por comentario
    },
    {
      fields: ['comment_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

export default CommentLike;
