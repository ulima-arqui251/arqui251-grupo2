export interface CreateUserDto {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'teacher' | 'admin' | 'support';
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  googleId?: string;
  profilePicture?: string;
}

export interface UpdateUserDto {
  email?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  role?: 'student' | 'teacher' | 'admin' | 'support';
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  googleId?: string;
  profilePicture?: string;
  lastLogin?: Date;
  loginAttempts?: number;
  accountLockedUntil?: Date;
  isActive?: boolean;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  profilePicture?: string;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
  totpCode?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  role?: 'student' | 'teacher';
}

export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
