import { User } from '../models';
import { CreateUserDto, UpdateUserDto } from '../types/user.types';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  update(id: string, userData: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<boolean>;
  findByVerificationToken(token: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    // Asegurar que role tiene un valor por defecto
    const userDataWithDefaults = {
      ...userData,
      role: userData.role || 'student' as const
    };
    return await User.create(userDataWithDefaults);
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Filtrar propiedades null y undefined para Sequelize
    const cleanedData: any = {};
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value === null) {
          cleanedData[key] = null; // Sequelize acepta null así
        } else {
          cleanedData[key] = value;
        }
      }
    });
    
    return await user.update(cleanedData);
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.destroy({ where: { id } });
    return result > 0;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
  }
}
