import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El título no puede estar vacío'
      },
      len: {
        args: [3, 200],
        msg: 'El título debe tener entre 3 y 200 caracteres'
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El contenido no puede estar vacío'
      },
      len: {
        args: [10, 5000],
        msg: 'El contenido debe tener entre 10 y 5000 caracteres'
      }
    }
  },
  type: {
    type: DataTypes.ENUM('question', 'discussion', 'resource', 'announcement'),
    allowNull: false,
    defaultValue: 'discussion'
  },
  subject: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: {
        args: [['matematicas', 'ciencias', 'lenguaje', 'historia', 'arte', 'tecnologia', 'general']],
        msg: 'Materia no válida'
      }
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  likeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  // userId será agregado como foreign key
}, {
  tableName: 'posts',
  timestamps: true,
  paranoid: true, // soft delete
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['subject']
    },
    {
      fields: ['is_pinned']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id']
    }
  ]
});

export default Post;
