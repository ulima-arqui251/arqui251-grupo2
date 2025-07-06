// Configuración global para los tests
import { config } from 'dotenv';
import path from 'path';

// Cargar variables de entorno para testing
config({ path: path.join(__dirname, '../..', '.env.test') });

// Configurar timeout global para tests
jest.setTimeout(30000);

// Mock para servicios externos en desarrollo
jest.mock('../services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

// Mock de console.log para reducir ruido en tests (excepto errores)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Mantener errores para debugging
};
