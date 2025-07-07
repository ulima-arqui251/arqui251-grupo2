import jwt from 'jsonwebtoken';
import { config } from '../../config/config.js';
import User from '../../models/User.js';
import twoFactorService from './twoFactor.service.js';

export class AuthService {
  
  // Generar JWT token
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId
    };
    
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
  }
  
  // Registro de usuario
  async register(userData) {
    const { email, password, firstName, lastName, role = 'estudiante', institutionId } = userData;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }
    
    // Crear nuevo usuario
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      institutionId
    });
    
    // Generar token
    const token = this.generateToken(user);
    
    return {
      user: user.toJSON(),
      token
    };
  }
  
  // Login de usuario
  async login(email, password, twoFactorToken = null) {
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    
    // Verificar si la cuenta está bloqueada (ESC-01)
    if (user.isLocked()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      throw new Error(`Cuenta bloqueada. Intenta nuevamente en ${lockTimeRemaining} minutos`);
    }
    
    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new Error('Cuenta desactivada');
    }
    
    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      // Incrementar intentos fallidos (ESC-01)
      await user.incLoginAttempts();
      throw new Error('Credenciales inválidas');
    }

    // Verificar si requiere 2FA
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        // Primer paso del login - solicitar 2FA
        const tempToken = twoFactorService.generateTempToken(user.id);
        return {
          requiresTwoFactor: true,
          tempToken: tempToken,
          message: 'Ingresa el código de autenticación de 2 factores'
        };
      } else {
        // Segundo paso del login - verificar 2FA
        const isValid2FA = await twoFactorService.verifyToken(user.id, twoFactorToken);
        if (!isValid2FA) {
          await user.incLoginAttempts();
          throw new Error('Código de 2FA inválido');
        }
      }
    }
    
    // Login exitoso - resetear intentos fallidos
    await user.resetLoginAttempts();
    
    // Generar token completo
    const token = this.generateToken(user);
    
    return {
      user: user.toJSON(),
      token,
      requiresTwoFactor: false
    };
  }
  
  // Refresh token
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (!user || !user.isActive) {
        throw new Error('Usuario inválido');
      }
      
      const newToken = this.generateToken(user);
      
      return {
        user: user.toJSON(),
        token: newToken
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
  
  // Cambiar contraseña
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Verificar contraseña actual
    const isValidPassword = await user.comparePassword(currentPassword);
    
    if (!isValidPassword) {
      throw new Error('Contraseña actual incorrecta');
    }
    
    // Actualizar contraseña
    await user.update({ password: newPassword });
    
    return { message: 'Contraseña actualizada correctamente' };
  }
  
  // Validar formato de email
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Validar fortaleza de contraseña
  static validatePassword(password) {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La contraseña debe incluir al menos una letra minúscula';
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La contraseña debe incluir al menos una letra mayúscula';
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return 'La contraseña debe incluir al menos un número';
    }
    
    return null; // Válida
  }
}
