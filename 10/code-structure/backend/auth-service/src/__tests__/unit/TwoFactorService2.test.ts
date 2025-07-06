import { generateTOTPSecret, verifyTOTP, generateBackupCodes } from '../../services/twoFactorService';

describe('TwoFactorService', () => {
  describe('generateTOTPSecret', () => {
    it('should generate a valid TOTP secret', async () => {
      const email = 'test@example.com';
      const result = await generateTOTPSecret(email);
      
      expect(result).toBeDefined();
      expect(result.secret).toBeDefined();
      expect(result.qrCode).toBeDefined();
      
      // El secreto debe tener la longitud correcta
      expect(result.secret).toMatch(/^[A-Z2-7]+$/);
      expect(result.secret.length).toBeGreaterThan(15);
      
      // El QR code debe ser un data URL válido
      expect(result.qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('should generate different secrets for different emails', async () => {
      const result1 = await generateTOTPSecret('user1@example.com');
      const result2 = await generateTOTPSecret('user2@example.com');
      
      expect(result1.secret).not.toBe(result2.secret);
      expect(result1.qrCode).not.toBe(result2.qrCode);
    });
  });

  describe('verifyTOTP', () => {
    it('should verify valid TOTP code', async () => {
      const email = 'test@example.com';
      const { secret } = await generateTOTPSecret(email);
      
      // Generamos un código usando el secreto
      const speakeasy = require('speakeasy');
      const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
      });
      
      const isValid = verifyTOTP(secret, token);
      expect(isValid).toBe(true);
    });

    it('should reject invalid TOTP code', async () => {
      const email = 'test@example.com';
      const { secret } = await generateTOTPSecret(email);
      const invalidToken = '123456';
      
      const isValid = verifyTOTP(secret, invalidToken);
      expect(isValid).toBe(false);
    });

    it('should reject empty or malformed codes', async () => {
      const email = 'test@example.com';
      const { secret } = await generateTOTPSecret(email);
      
      expect(verifyTOTP(secret, '')).toBe(false);
      expect(verifyTOTP(secret, '12345')).toBe(false); // Muy corto
      expect(verifyTOTP(secret, '1234567')).toBe(false); // Muy largo
      expect(verifyTOTP(secret, 'abcdef')).toBe(false); // No numérico
    });

    it('should handle invalid secret gracefully', () => {
      const invalidSecret = 'invalid-secret';
      const token = '123456';
      
      expect(() => {
        verifyTOTP(invalidSecret, token);
      }).not.toThrow();
      
      const isValid = verifyTOTP(invalidSecret, token);
      expect(isValid).toBe(false);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate backup codes', () => {
      const backupCodes = generateBackupCodes();
      
      expect(backupCodes).toBeDefined();
      expect(Array.isArray(backupCodes)).toBe(true);
      expect(backupCodes.length).toBe(10); // Por defecto 10 códigos
      
      // Cada código debe tener el formato correcto
      backupCodes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/); // 8 caracteres alfanuméricos
      });
      
      // Todos los códigos deben ser únicos
      const uniqueCodes = new Set(backupCodes);
      expect(uniqueCodes.size).toBe(backupCodes.length);
    });

    it('should generate different backup codes on multiple calls', () => {
      const codes1 = generateBackupCodes();
      const codes2 = generateBackupCodes();
      
      expect(codes1).not.toEqual(codes2);
    });

    it('should generate custom number of codes', () => {
      const count = 5;
      const codes = generateBackupCodes(count);
      
      expect(codes.length).toBe(count);
    });
  });
});
