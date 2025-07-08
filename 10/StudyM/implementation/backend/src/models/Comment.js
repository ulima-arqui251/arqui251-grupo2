import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El contenido del comentario no puede estar vacío'
      },
      len: {
        args: [1, 2000],
        msg: 'El comentario debe tener entre 1 y 2000 caracteres'
      }
    }
  },
  isAnswer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isBestAnswer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  likeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  // parentCommentId para respuestas a comentarios
  parentCommentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  // userId y postId serán agregados como foreign keys
}, {
  tableName: 'comments',
  timestamps: true,
  paranoid: true, // soft delete
  indexes: [
    {
      fields: ['post_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['parent_comment_id']
    },
    {
      fields: ['is_best_answer']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Auto-referencia para respuestas a comentarios
Comment.belongsTo(Comment, { 
  as: 'parentComment', 
  foreignKey: 'parentCommentId' 
});
Comment.hasMany(Comment, { 
  as: 'replies', 
  foreignKey: 'parentCommentId' 
});

export default Comment;
