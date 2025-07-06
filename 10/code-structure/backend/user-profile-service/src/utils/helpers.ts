/**
 * Utility functions for the User Profile Service
 */

export const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
};

export const generateSlug = (firstName: string, lastName: string, id: string): string => {
  const name = `${firstName}-${lastName}`.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${name}-${id.slice(0, 8)}`;
};

export const formatName = (firstName: string, lastName: string): string => {
  return `${sanitizeString(firstName)} ${sanitizeString(lastName)}`;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const extractDomainFromUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await sleep(delay * attempt);
    }
  }
  
  throw lastError!;
};

export const parseQueryParams = (query: any): { limit: number; offset: number } => {
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
  const offset = Math.max(parseInt(query.offset) || 0, 0);
  
  return { limit, offset };
};

export const createResponse = (
  success: boolean,
  message: string,
  data?: any,
  errors?: any[]
) => {
  return {
    success,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
    ...(errors && { errors })
  };
};

export const maskSensitiveData = (obj: any, sensitiveFields: string[] = ['password', 'token', 'secret']): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const masked = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***';
    }
  });
  
  return masked;
};
