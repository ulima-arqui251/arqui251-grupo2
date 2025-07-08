import twoFactorService from './twoFactor.service.js';
import { successResponse, errorResponse, forbiddenResponse } from '../../utils/responses.js';

class TwoFactorController {
  /**
   * Generar QR code para configurar 2FA
   */
  async generateQR(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await twoFactorService.generateSecret(userId);
      
      return successResponse(res, {
        qrCode: result.qrCode,
        manualEntryKey: result.manualEntryKey,
        backupCodes: result.backupCodes
      }, 'QR generado exitosamente. Escanea con Google Authenticator.');
    } catch (error) {
      console.error('Error generando QR 2FA:', error);
      return errorResponse(res, error.message || 'Error al generar QR de 2FA', 500);
    }
  }

  /**
   * Activar 2FA después de verificar el primer token
   */
  async enable2FA(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      const result = await twoFactorService.enable2FA(userId, token);
      
      return successResponse(res, {
        enabled: result.enabled,
        backupCodes: result.backupCodes
      }, result.message);
    } catch (error) {
      console.error('Error activando 2FA:', error);
      return errorResponse(res, error.message || 'Error al activar 2FA', 400);
    }
  }

  /**
   * Desactivar 2FA
   */
  async disable2FA(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      const result = await twoFactorService.disable2FA(userId, password);
      
      return successResponse(res, {
        disabled: result.disabled
      }, result.message);
    } catch (error) {
      console.error('Error desactivando 2FA:', error);
      return errorResponse(res, error.message || 'Error al desactivar 2FA', 400);
    }
  }

  /**
   * Verificar token de 2FA (usado durante el login)
   */
  async verifyToken(req, res) {
    try {
      const { tempToken, twoFactorToken } = req.body;
      
      // Verificar token temporal
      const jwt = await import('jsonwebtoken');
      const { config } = await import('../../config/config.js');
      
      let decoded;
      try {
        decoded = jwt.verify(tempToken, config.JWT_SECRET);
      } catch (error) {
        return errorResponse(res, 'Token temporal inválido o expirado', 401);
      }

      if (!decoded.temp || !decoded.requires2FA) {
        return errorResponse(res, 'Token temporal inválido', 401);
      }

      // Verificar código 2FA
      const isValid = await twoFactorService.verifyToken(decoded.id, twoFactorToken);
      
      if (!isValid) {
        return errorResponse(res, 'Código de 2FA inválido', 401);
      }

      // Generar token de acceso completo
      const { AuthService } = await import('./auth.service.js');
      const authService = new AuthService();
      const { User } = await import('../../models/index.js');
      
      const user = await User.findByPk(decoded.id);
      const accessToken = authService.generateToken(user);

      return successResponse(res, {
        user: user.toJSON(),
        token: accessToken
      }, 'Autenticación de 2 factores exitosa');
    } catch (error) {
      console.error('Error verificando token 2FA:', error);
      return errorResponse(res, 'Error al verificar código 2FA', 500);
    }
  }

  /**
   * Regenerar códigos de respaldo
   */
  async regenerateBackupCodes(req, res) {
    try {
      const userId = req.user.id;
      
      const newCodes = await twoFactorService.regenerateBackupCodes(userId);
      
      return successResponse(res, {
        backupCodes: newCodes
      }, 'Códigos de respaldo regenerados exitosamente');
    } catch (error) {
      console.error('Error regenerando códigos:', error);
      return errorResponse(res, error.message || 'Error al regenerar códigos', 400);
    }
  }

  /**
   * Obtener estado de 2FA del usuario
   */
  async getStatus(req, res) {
    try {
      const userId = req.user.id;
      
      const status = await twoFactorService.get2FAStatus(userId);
      
      return successResponse(res, status, 'Estado de 2FA obtenido');
    } catch (error) {
      console.error('Error obteniendo estado 2FA:', error);
      return errorResponse(res, 'Error al obtener estado de 2FA', 500);
    }
  }

  /**
   * Obtener códigos de respaldo restantes
   */
  async getBackupCodes(req, res) {
    try {
      const userId = req.user.id;
      const { User } = await import('../../models/index.js');
      
      const user = await User.findByPk(userId);
      if (!user) {
        return errorResponse(res, 'Usuario no encontrado', 404);
      }

      if (!user.twoFactorEnabled) {
        return errorResponse(res, '2FA no está activado', 400);
      }

      return successResponse(res, {
        backupCodes: user.backupCodes || [],
        remaining: user.backupCodes ? user.backupCodes.length : 0
      }, 'Códigos de respaldo obtenidos');
    } catch (error) {
      console.error('Error obteniendo códigos de respaldo:', error);
      return errorResponse(res, 'Error al obtener códigos de respaldo', 500);
    }
  }
}

export default new TwoFactorController();
