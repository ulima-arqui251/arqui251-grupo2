import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Información básica
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  
  // Roles según documentación
  role: {
    type: DataTypes.ENUM('estudiante', 'docente', 'admin'),
    allowNull: false,
    defaultValue: 'estudiante'
  },
  
  // Información adicional
  institutionId: {
    type: DataTypes.STRING,
    allowNull: true // Para usuarios sin institución específica
  },
  
  // Control de acceso (ESC-01: Bloqueo tras 3 intentos)
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Estado del usuario
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // Autenticación de 2 factores
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Códigos de respaldo para 2FA
  backupCodes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  
  // Metadata
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['institution_id'] }
  ]
});

// Hooks para encriptar contraseña
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, config.BCRYPT_ROUNDS);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, config.BCRYPT_ROUNDS);
  }
});

// Métodos de instancia
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

User.prototype.incLoginAttempts = async function() {
  // Si ya estamos bloqueados y el tiempo de bloqueo expiró
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      loginAttempts: 1,
      lockUntil: null
    });
  }
  
  const updates = { loginAttempts: this.loginAttempts + 1 };
  
  // Si alcanzamos el máximo de intentos, bloquear cuenta (ESC-01)
  if (this.loginAttempts + 1 >= config.MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.lockUntil = Date.now() + config.LOCKOUT_TIME;
  }
  
  return this.update(updates);
};

User.prototype.resetLoginAttempts = async function() {
  return this.update({
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: new Date()
  });
};

// Método para obtener información pública del usuario
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.loginAttempts;
  delete values.lockUntil;
  return values;
};

export default User;
