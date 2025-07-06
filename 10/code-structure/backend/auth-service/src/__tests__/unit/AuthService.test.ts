import { AuthService } from '../../services/AuthService';
import { IUserRepository } from '../../repositories/UserRepository';
import { RegisterDto, LoginDto } from '../../types/user.types';

// Configurar mocks
const mockSendVerificationEmail = jest.fn();
const mockVerifyTOTP = jest.fn();
const mockJwtSign = jest.fn();

// Mock de módulos externos
jest.mock('../../services/emailService', () => ({
  sendVerificationEmail: (...args: any[]) => mockSendVerificationEmail(...args)
}));

jest.mock('../../services/twoFactorService', () => ({
  verifyTOTP: (...args: any[]) => mockVerifyTOTP(...args)
}));

jest.mock('jsonwebtoken', () => ({
  sign: (...args: any[]) => mockJwtSign(...args)
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-token-123')
  })
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockUser: any;

  beforeEach(() => {
    // Configurar variables de entorno para tests predecibles
    process.env.JWT_EXPIRES_IN = '24h';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    // Configurar mock del repositorio
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByVerificationToken: jest.fn(),
      findByPasswordResetToken: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    };

    // Mock de usuario con todos los métodos necesarios
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
      emailVerified: false,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      accountLockedUntil: null,
      profilePicture: null,
      lastLogin: null,
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      validatePassword: jest.fn(),
      incrementLoginAttempts: jest.fn(),
      resetLoginAttempts: jest.fn()
    };

    // Instanciar AuthService
    authService = new AuthService(mockUserRepository, 'test-secret-key');

    // Configurar mocks por defecto
    mockJwtSign.mockReturnValue('mocked-jwt-token');
    mockSendVerificationEmail.mockResolvedValue(undefined);
    mockVerifyTOTP.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterData: RegisterDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Smith',
      acceptTerms: true,
      role: 'student'
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await authService.register(validRegisterData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validRegisterData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validRegisterData.email,
          firstName: validRegisterData.firstName,
          lastName: validRegisterData.lastName,
          role: validRegisterData.role,
          emailVerificationToken: 'mock-token-123'
        })
      );
      expect(mockSendVerificationEmail).toHaveBeenCalledWith(
        validRegisterData.email,
        'mock-token-123'
      );
      expect(result.user.email).toBe(mockUser.email);
      expect(result.message).toContain('Usuario registrado exitosamente');
    });

    it('should throw error if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(validRegisterData))
        .rejects.toThrow('El email ya está registrado');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should auto-verify email in development when email service fails', async () => {
      process.env.NODE_ENV = 'development';
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockSendVerificationEmail.mockRejectedValue(new Error('Email service failed'));

      const result = await authService.register(validRegisterData);

      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, { emailVerified: true });
      expect(result.user.email).toBe(mockUser.email);

      delete process.env.NODE_ENV;
    });

    it('should use default role "student" if not provided', async () => {
      const registerDataWithoutRole = { ...validRegisterData };
      delete registerDataWithoutRole.role;

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      await authService.register(registerDataWithoutRole);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'student'
        })
      );
    });
  });

  describe('login', () => {
    const validLoginData: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    it('should login successfully with valid credentials', async () => {
      mockUser.validatePassword.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login(validLoginData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validLoginData.email);
      expect(mockUser.validatePassword).toHaveBeenCalledWith(validLoginData.password);
      expect(mockUser.resetLoginAttempts).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ lastLogin: expect.any(Date) })
      );
      expect(mockJwtSign).toHaveBeenCalledTimes(2); // access token + refresh token
      expect(result.user.email).toBe(mockUser.email);
      expect(result.accessToken).toBe('mocked-jwt-token');
      expect(result.refreshToken).toBe('mocked-jwt-token');
      expect(result.expiresIn).toBe(24 * 60 * 60);
    });

    it('should throw error for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(validLoginData))
        .rejects.toThrow('Credenciales inválidas');

      expect(mockUser.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw error for invalid password', async () => {
      mockUser.validatePassword.mockResolvedValue(false);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login(validLoginData))
        .rejects.toThrow('Credenciales inválidas');

      expect(mockUser.incrementLoginAttempts).toHaveBeenCalled();
      expect(mockUser.resetLoginAttempts).not.toHaveBeenCalled();
    });

    it('should throw error if account is locked', async () => {
      mockUser.accountLockedUntil = new Date(Date.now() + 10000); // locked for 10 seconds
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login(validLoginData))
        .rejects.toThrow('Cuenta bloqueada temporalmente');

      expect(mockUser.validatePassword).not.toHaveBeenCalled();
    });

    it('should require 2FA code when 2FA is enabled', async () => {
      mockUser.twoFactorEnabled = true;
      mockUser.validatePassword.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.login(validLoginData))
        .rejects.toThrow('Código 2FA requerido');

      expect(mockVerifyTOTP).not.toHaveBeenCalled();
    });

    it('should validate 2FA code when provided', async () => {
      mockUser.twoFactorEnabled = true;
      mockUser.twoFactorSecret = 'secret123';
      mockUser.validatePassword.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerifyTOTP.mockResolvedValue(true);

      const loginDataWith2FA = { ...validLoginData, totpCode: '123456' };
      const result = await authService.login(loginDataWith2FA);

      expect(mockVerifyTOTP).toHaveBeenCalledWith('secret123', '123456');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw error for invalid 2FA code', async () => {
      mockUser.twoFactorEnabled = true;
      mockUser.twoFactorSecret = 'secret123';
      mockUser.validatePassword.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerifyTOTP.mockResolvedValue(false);

      const loginDataWith2FA = { ...validLoginData, totpCode: '123456' };

      await expect(authService.login(loginDataWith2FA))
        .rejects.toThrow('Código 2FA inválido');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const token = 'valid-verification-token';
      mockUserRepository.findByVerificationToken.mockResolvedValue(mockUser);

      const result = await authService.verifyEmail(token);

      expect(mockUserRepository.findByVerificationToken).toHaveBeenCalledWith(token);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      );
      expect(result.message).toContain('Email verificado exitosamente');
    });

    it('should throw error for invalid verification token', async () => {
      const token = 'invalid-token';
      mockUserRepository.findByVerificationToken.mockResolvedValue(null);

      await expect(authService.verifyEmail(token))
        .rejects.toThrow('Token de verificación inválido o expirado');

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token for valid email', async () => {
      const email = 'test@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.requestPasswordReset(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          passwordResetToken: 'mock-token-123',
          passwordResetExpires: expect.any(Date)
        })
      );
      expect(result.message).toContain('recibirás instrucciones');
    });

    it('should return generic message for non-existent email (security)', async () => {
      const email = 'nonexistent@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.requestPasswordReset(email);

      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(result.message).toContain('recibirás instrucciones');
    });
  });

  describe('generateTokens (private method)', () => {
    it('should generate access and refresh tokens with correct payload', async () => {
      mockUser.validatePassword.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await authService.login({
        email: 'test@example.com',
        password: 'password'
      });

      // Verificar que se llamó jwt.sign con los payloads correctos
      expect(mockJwtSign).toHaveBeenNthCalledWith(1,
        {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        },
        'test-secret-key',
        { expiresIn: '24h' }
      );

      expect(mockJwtSign).toHaveBeenNthCalledWith(2,
        { userId: mockUser.id },
        'test-secret-key',
        { expiresIn: '7d' }
      );
    });
  });

  describe('mapToUserResponse (private method)', () => {
    it('should map user entity to UserResponseDto', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true
      });

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        emailVerified: mockUser.emailVerified,
        twoFactorEnabled: mockUser.twoFactorEnabled,
        profilePicture: mockUser.profilePicture,
        lastLogin: mockUser.lastLogin,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt
      });
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database connection failed'));

      await expect(authService.login({
        email: 'test@example.com',
        password: 'password'
      })).rejects.toThrow('Database connection failed');
    });

    it('should handle JWT generation errors', async () => {
      mockUser.validatePassword.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtSign.mockImplementation(() => {
        throw new Error('JWT generation failed');
      });

      await expect(authService.login({
        email: 'test@example.com',
        password: 'password'
      })).rejects.toThrow('JWT generation failed');
    });
  });
});
