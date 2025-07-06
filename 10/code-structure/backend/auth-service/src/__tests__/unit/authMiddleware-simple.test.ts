import { Request, Response, NextFunction } from 'express';
import { authenticateToken, authorizeRoles, optionalAuth } from '../../middleware/authMiddleware';

// Mock básico de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

const jwt = require('jsonwebtoken');

describe('AuthMiddleware Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Configurar JWT_SECRET para los tests
    process.env.JWT_SECRET = 'test-secret-key';
    
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    test('should return 401 if no authorization header is provided', () => {
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token de acceso requerido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 if authorization header is empty', () => {
      mockRequest.headers = { authorization: 'Bearer' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token de acceso requerido'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 403 if token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      
      // Mock jwt.verify para simular error
      jwt.verify.mockImplementation((token: string, secret: string, callback: Function) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido o expirado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should set user and call next if token is valid', () => {
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      
      const mockPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'student'
      };

      // Mock jwt.verify para simular éxito
      jwt.verify.mockImplementation((token: string, secret: string, callback: Function) => {
        callback(null, mockPayload);
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual({
        userId: '123',
        email: 'test@example.com',
        role: 'student'
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    test('should return 401 if user is not authenticated', () => {
      const middleware = authorizeRoles('admin');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuario no autenticado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 403 if user role is not authorized', () => {
      mockRequest.user = {
        userId: '123',
        email: 'test@example.com',
        role: 'student'
      };
      
      const middleware = authorizeRoles('admin', 'teacher');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next if user role is authorized', () => {
      mockRequest.user = {
        userId: '123',
        email: 'test@example.com',
        role: 'admin'
      };
      
      const middleware = authorizeRoles('admin', 'teacher');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    test('should work with single role', () => {
      mockRequest.user = {
        userId: '123',
        email: 'test@example.com',
        role: 'student'
      };
      
      const middleware = authorizeRoles('student');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    test('should call next without setting user if no token is provided', () => {
      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    test('should call next without setting user if token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      
      // Mock jwt.verify para simular error
      jwt.verify.mockImplementation((token: string, secret: string, callback: Function) => {
        callback(new Error('Invalid token'), null);
      });

      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    test('should set user and call next if token is valid', () => {
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      
      const mockPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'student'
      };

      // Mock jwt.verify para simular éxito
      jwt.verify.mockImplementation((token: string, secret: string, callback: Function) => {
        callback(null, mockPayload);
      });

      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual({
        userId: '123',
        email: 'test@example.com',
        role: 'student'
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
