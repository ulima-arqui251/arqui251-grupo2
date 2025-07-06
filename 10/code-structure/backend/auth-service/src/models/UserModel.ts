import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';

// Definición de interfaces para cumplir RF-01 a RF-05
export interface UserAttributes {
  id: string;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin' | 'support';
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  googleId?: string;
  profilePicture?: string;
  lastLogin?: Date;
  loginAttempts: number;
  accountLockedUntil?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'emailVerified' | 'twoFactorEnabled' | 'loginAttempts' | 'isActive'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public passwordHash?: string;
  public firstName!: string;
  public lastName!: string;
  public role!: 'student' | 'teacher' | 'admin' | 'support';
  public emailVerified!: boolean;
  public emailVerificationToken?: string;
  public emailVerificationExpires?: Date;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;
  public twoFactorEnabled!: boolean;
  public twoFactorSecret?: string;
  public googleId?: string;
  public profilePicture?: string;
  public lastLogin?: Date;
  public loginAttempts!: number;
  public accountLockedUntil?: Date;
  public isActive!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Métodos de instancia para cumplir RF-01 a RF-05
  public async validatePassword(password: string): Promise<boolean> {
    if (!this.passwordHash) return false;
    return bcrypt.compare(password, this.passwordHash);
  }

  public async setPassword(password: string): Promise<void> {
    const saltRounds = 12;
    this.passwordHash = await bcrypt.hash(password, saltRounds);
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public isAccountLocked(): boolean {
    if (!this.accountLockedUntil) return false;
    return this.accountLockedUntil > new Date();
  }

  // RF-03: Máximo 3 intentos fallidos antes de bloquear por 10 minutos
  public async incrementLoginAttempts(): Promise<void> {
    this.loginAttempts += 1;
    
    if (this.loginAttempts >= 3) {
      this.accountLockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    }
    
    await this.save();
  }

  public async resetLoginAttempts(): Promise<void> {
    this.loginAttempts = 0;
    this.accountLockedUntil = undefined;
    this.lastLogin = new Date();
    await this.save();
  }

  public toJSON(): Partial<UserAttributes> {
    const values = { ...this.get() };
    // No exponer información sensible
    delete values.passwordHash;
    delete values.twoFactorSecret;
    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    return values;
  }
}

export default User;
