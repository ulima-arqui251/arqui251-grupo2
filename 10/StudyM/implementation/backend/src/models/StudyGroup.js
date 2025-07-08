import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const StudyGroup = sequelize.define('StudyGroup', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del grupo no puede estar vacío'
      },
      len: {
        args: [3, 100],
        msg: 'El nombre debe tener entre 3 y 100 caracteres'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La descripción no puede exceder 500 caracteres'
      }
    }
  },
  subject: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: {
        args: [['matematicas', 'ciencias', 'lenguaje', 'historia', 'arte', 'tecnologia', 'general']],
        msg: 'Materia no válida'
      }
    }
  },
  level: {
    type: DataTypes.ENUM('principiante', 'intermedio', 'avanzado'),
    allowNull: false,
    defaultValue: 'principiante'
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20,
    validate: {
      min: {
        args: [2],
        msg: 'Un grupo debe tener al menos 2 miembros máximo'
      },
      max: {
        args: [50],
        msg: 'Un grupo no puede tener más de 50 miembros'
      }
    }
  },
  memberCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // ownerId será agregado como foreign key
}, {
  tableName: 'study_groups',
  timestamps: true,
  paranoid: true, // soft delete
  indexes: [
    {
      fields: ['subject']
    },
    {
      fields: ['level']
    },
    {
      fields: ['is_private']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['owner_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default StudyGroup;
