import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PostLike = sequelize.define('PostLike', {
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
  // userId y postId serán agregados como foreign keys
}, {
  tableName: 'post_likes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'post_id'] // Un usuario solo puede dar un like/dislike por post
    },
    {
      fields: ['post_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

export default PostLike;
