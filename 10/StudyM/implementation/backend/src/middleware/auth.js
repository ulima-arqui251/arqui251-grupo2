import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/User.js';

// Middleware para verificar JWT
export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }
    
    const token = authHeader.substring(7); // Remover "Bearer "
    
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Verificar que el usuario aún existe y está activo
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo'
      });
    }
    
    // Agregar usuario a la request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// Middleware para verificar roles específicos (ESC-16)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: permisos insuficientes'
      });
    }
    
    next();
  };
};

// Middleware opcional para extraer usuario si hay token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // En auth opcional, ignoramos errores de token
    next();
  }
};

// Alias para compatibilidad
export const authenticateToken = authenticateJWT;
export const authenticate = authenticateJWT;
