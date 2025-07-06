import { z } from 'zod';

// Esquema de validación para variables de entorno
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3005'),
  
  // Database
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().transform(Number).default('3306'),
  DB_NAME: z.string().min(1),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Security
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('5'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.string().transform(Boolean).default('true'),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Validar configuración al inicio
export const validateConfig = (): EnvConfig => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Error en configuración de entorno:', error);
    process.exit(1);
  }
};

// Configuración validada y tipada
export const config = validateConfig();
