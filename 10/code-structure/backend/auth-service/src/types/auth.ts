// Tipos para extender Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'student' | 'teacher' | 'admin' | 'support';
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: 'student' | 'teacher' | 'admin' | 'support';
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'support';
  iat?: number;
  exp?: number;
}
