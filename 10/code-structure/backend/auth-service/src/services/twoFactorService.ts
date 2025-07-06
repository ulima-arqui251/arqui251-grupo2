import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * RF-03: Generar secreto para 2FA (TOTP)
 */
export async function generateTOTPSecret(email: string): Promise<{ secret: string; qrCode: string }> {
  const secret = speakeasy.generateSecret({
    name: email,
    issuer: process.env.TOTP_ISSUER || 'StudyMate',
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
  
  return {
    secret: secret.base32!,
    qrCode
  };
}

/**
 * RF-03: Verificar código TOTP (Time-based One-Time Password)
 */
export function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Permitir 2 ventanas de tiempo (30 segundos antes/después)
  });
}

/**
 * Generar código de backup para 2FA
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generar código de 8 dígitos
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    codes.push(code);
  }
  
  return codes;
}
