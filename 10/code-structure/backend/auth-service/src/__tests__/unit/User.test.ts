import { User } from '../../models';
import { generateRandomUser } from '../helpers/testHelpers';

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password when creating user', async () => {
      const userData = generateRandomUser();
      
      const user = await User.create({
        email: userData.email,
        passwordHash: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      // La contraseña debe estar hasheada
      expect(user.passwordHash).not.toBe(userData.password);
      expect(user.passwordHash.length).toBeGreaterThan(50);
    });

    it('should validate correct password', async () => {
      const userData = generateRandomUser();
      const password = 'TestPassword123!';
      
      const user = await User.create({
        email: userData.email,
        passwordHash: password,
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      const isValid = await user.validatePassword(password);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const userData = generateRandomUser();
      
      const user = await User.create({
        email: userData.email,
        passwordHash: 'TestPassword123!',
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      const isValid = await user.validatePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('Login Attempts', () => {
    it('should increment login attempts', async () => {
      const userData = generateRandomUser();
      
      const user = await User.create({
        email: userData.email,
        passwordHash: 'TestPassword123!',
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      expect(user.loginAttempts).toBe(0);
      
      await user.incrementLoginAttempts();
      await user.reload();
      
      expect(user.loginAttempts).toBe(1);
    });

    it('should reset login attempts', async () => {
      const userData = generateRandomUser();
      
      const user = await User.create({
        email: userData.email,
        passwordHash: 'TestPassword123!',
        firstName: userData.firstName,
        lastName: userData.lastName,
        loginAttempts: 3
      });

      await user.resetLoginAttempts();
      await user.reload();
      
      expect(user.loginAttempts).toBe(0);
      expect(user.accountLockedUntil).toBeNull();
    });
  });

  describe('Validations', () => {
    it('should require valid email', async () => {
      const userData = generateRandomUser();
      
      await expect(User.create({
        email: 'invalid-email',
        passwordHash: 'TestPassword123!',
        firstName: userData.firstName,
        lastName: userData.lastName
      })).rejects.toThrow();
    });

    it('should require unique email', async () => {
      const userData = generateRandomUser();
      
      await User.create({
        email: userData.email,
        passwordHash: 'TestPassword123!',
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      await expect(User.create({
        email: userData.email, // mismo email
        passwordHash: 'TestPassword123!',
        firstName: 'Another',
        lastName: 'User'
      })).rejects.toThrow();
    });
  });
});
