import { AuthService } from './auth.service.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }
  
  // POST /api/auth/register
  async register(req, res) {
    try {
      const result = await this.authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
      
    } catch (error) {
      // Para login fallido, no dar pistas específicas sobre qué falló
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/auth/verify-2fa
  async verify2FA(req, res) {
    try {
      const { tempToken, token } = req.body;
      const result = await this.authService.verify2FA(tempToken, token);
      
      res.json({
        success: true,
        message: '2FA verificado exitosamente',
        data: result
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/auth/refresh
  async refreshToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token requerido'
        });
      }
      
      const result = await this.authService.refreshToken(token);
      
      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: result
      });
      
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/auth/profile
  async getProfile(req, res) {
    try {
      // El usuario está disponible gracias al middleware authenticate
      res.json({
        success: true,
        data: {
          user: req.user.toJSON()
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }
  
  // PUT /api/auth/change-password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await this.authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      
      res.json({
        success: true,
        message: result.message
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/auth/logout
  async logout(req, res) {
    try {
      // En un sistema JWT stateless, el logout es principalmente del lado cliente
      // Aquí podríamos agregar el token a una blacklist si fuera necesario
      
      res.json({
        success: true,
        message: 'Logout exitoso'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }
}
