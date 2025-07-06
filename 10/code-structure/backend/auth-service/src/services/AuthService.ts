import { IUserRepository } from '../repositories/UserRepository';
import { CreateUserDto, UpdateUserDto, UserResponseDto, AuthResponseDto, LoginDto, RegisterDto } from '../types/user.types';
import { generateTOTPSecret, verifyTOTP } from './twoFactorService';
import { sendVerificationEmail } from './emailService';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSecret: string = process.env.JWT_SECRET || 'default-secret'
  ) {}

  async register(registerData: RegisterDto): Promise<{ user: UserResponseDto; message: string }> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(registerData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Generar token de verificación
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Crear usuario
    const userData: CreateUserDto = {
      email: registerData.email,
      passwordHash: registerData.password, // Se encriptará en el hook del modelo
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      role: registerData.role || 'student',
      emailVerificationToken,
      emailVerificationExpires
    };

    const user = await this.userRepository.create(userData);

    // Enviar email de verificación (en desarrollo auto-verificar)
    try {
      await sendVerificationEmail(registerData.email, emailVerificationToken);
    } catch (emailError) {
      console.log('Warning: No se pudo enviar correo de verificación:', emailError);
      if (process.env.NODE_ENV === 'development') {
        await this.userRepository.update(user.id, { emailVerified: true });
      }
    }

    return {
      user: this.mapToUserResponse(user),
      message: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.'
    };
  }

  async login(loginData: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuario
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si la cuenta está bloqueada
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      throw new Error('Cuenta bloqueada temporalmente');
    }

    // Verificar contraseña
    const isValidPassword = await user.validatePassword(loginData.password);
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      throw new Error('Credenciales inválidas');
    }

    // Verificar 2FA si está habilitado
    if (user.twoFactorEnabled) {
      if (!loginData.totpCode) {
        throw new Error('Código 2FA requerido');
      }
      
      const isValidTOTP = await verifyTOTP(user.twoFactorSecret!, loginData.totpCode);
      if (!isValidTOTP) {
        throw new Error('Código 2FA inválido');
      }
    }

    // Login exitoso
    await user.resetLoginAttempts();
    await this.userRepository.update(user.id, { lastLogin: new Date() });

    // Generar tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.mapToUserResponse(user),
      ...tokens
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new Error('Token de verificación inválido o expirado');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    return { message: 'Email verificado exitosamente' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe
      return { message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    // Enviar email de reset (implementar según necesidades)
    
    return { message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña' };
  }

  private generateTokens(user: any): { accessToken: string; refreshToken: string; expiresIn: number } {
    const accessTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const refreshTokenPayload = {
      userId: user.id
    };

    const expiresIn = 24 * 60 * 60; // 24 horas en segundos

    const accessToken = (jwt as any).sign(
      accessTokenPayload,
      this.jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = (jwt as any).sign(
      refreshTokenPayload,
      this.jwtSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken, expiresIn };
  }

  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      profilePicture: user.profilePicture,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
