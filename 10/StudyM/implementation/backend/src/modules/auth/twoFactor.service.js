import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { User } from '../../models/index.js';

class TwoFactorService {
  /**
   * Generar secret para 2FA
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Secret y QR code
   */
  async generateSecret(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Generar secret único
      const secret = speakeasy.generateSecret({
        name: `StudyMate (${user.email})`,
        issuer: 'StudyMate',
        length: 32
      });

      // Generar códigos de respaldo
      const backupCodes = this.generateBackupCodes();

      // Guardar secret temporalmente (no activado aún)
      await user.update({
        twoFactorSecret: secret.base32,
        backupCodes: backupCodes
      });

      // Generar QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        backupCodes: backupCodes,
        manualEntryKey: secret.base32
      };
    } catch (error) {
      console.error('Error generando secret 2FA:', error);
      throw error;
    }
  }

  /**
   * Activar 2FA verificando el primer token
   * @param {number} userId - ID del usuario
   * @param {string} token - Token de 6 dígitos
   * @returns {Promise<Object>} Resultado de la activación
   */
  async enable2FA(userId, token) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.twoFactorSecret) {
        throw new Error('No hay un secret de 2FA configurado. Genera uno primero.');
      }

      if (user.twoFactorEnabled) {
        throw new Error('2FA ya está activado para este usuario');
      }

      // Verificar el token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2 // Permitir 2 intervalos de tiempo antes/después
      });

      if (!verified) {
        throw new Error('Token inválido. Verifica que tengas la hora correcta en tu dispositivo.');
      }

      // Activar 2FA
      await user.update({
        twoFactorEnabled: true
      });

      return {
        enabled: true,
        backupCodes: user.backupCodes,
        message: '2FA activado exitosamente'
      };
    } catch (error) {
      console.error('Error activando 2FA:', error);
      throw error;
    }
  }

  /**
   * Desactivar 2FA
   * @param {number} userId - ID del usuario
   * @param {string} password - Contraseña del usuario para confirmar
   * @returns {Promise<Object>} Resultado de la desactivación
   */
  async disable2FA(userId, password) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.twoFactorEnabled) {
        throw new Error('2FA no está activado para este usuario');
      }

      // Verificar contraseña
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
      }

      // Desactivar 2FA
      await user.update({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: []
      });

      return {
        disabled: true,
        message: '2FA desactivado exitosamente'
      };
    } catch (error) {
      console.error('Error desactivando 2FA:', error);
      throw error;
    }
  }

  /**
   * Verificar token de 2FA
   * @param {number} userId - ID del usuario
   * @param {string} token - Token de 6 dígitos o código de respaldo
   * @returns {Promise<boolean>} True si el token es válido
   */
  async verifyToken(userId, token) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.twoFactorEnabled) {
        return true; // Si no tiene 2FA activado, no necesita verificación
      }

      // Verificar si es un código de respaldo
      if (token.length === 8 && user.backupCodes.includes(token)) {
        // Usar el código de respaldo (solo una vez)
        const updatedBackupCodes = user.backupCodes.filter(code => code !== token);
        await user.update({
          backupCodes: updatedBackupCodes
        });
        return true;
      }

      // Verificar token normal de 6 dígitos
      if (token.length === 6) {
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: token,
          window: 2
        });
        return verified;
      }

      return false;
    } catch (error) {
      console.error('Error verificando token 2FA:', error);
      return false;
    }
  }

  /**
   * Regenerar códigos de respaldo
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Nuevos códigos de respaldo
   */
  async regenerateBackupCodes(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.twoFactorEnabled) {
        throw new Error('2FA no está activado para este usuario');
      }

      const newBackupCodes = this.generateBackupCodes();
      
      await user.update({
        backupCodes: newBackupCodes
      });

      return newBackupCodes;
    } catch (error) {
      console.error('Error regenerando códigos de respaldo:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de 2FA para un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estado de 2FA
   */
  async get2FAStatus(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        enabled: user.twoFactorEnabled,
        hasSecret: !!user.twoFactorSecret,
        backupCodesRemaining: user.backupCodes ? user.backupCodes.length : 0
      };
    } catch (error) {
      console.error('Error obteniendo estado 2FA:', error);
      throw error;
    }
  }

  /**
   * Generar códigos de respaldo
   * @returns {Array} Array de códigos de respaldo
   */
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      // Generar código de 8 caracteres alfanumérico
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verificar si un usuario requiere 2FA para el login
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>} True si requiere 2FA
   */
  async requires2FA(userId) {
    try {
      const user = await User.findByPk(userId);
      return user ? user.twoFactorEnabled : false;
    } catch (error) {
      console.error('Error verificando requerimiento 2FA:', error);
      return false;
    }
  }

  /**
   * Generar token temporal para login con 2FA
   * @param {number} userId - ID del usuario
   * @returns {string} Token temporal
   */
  generateTempToken(userId) {
    const jwt = require('jsonwebtoken');
    const { config } = require('../../config/config.js');
    
    return jwt.sign(
      { 
        id: userId, 
        temp: true, 
        requires2FA: true 
      },
      config.JWT_SECRET,
      { expiresIn: '10m' } // Token temporal válido por 10 minutos
    );
  }
}

export default new TwoFactorService();
