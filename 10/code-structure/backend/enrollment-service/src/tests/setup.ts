// Configuración de entorno de testing

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '10';
process.env.API_KEY_AUTH_SERVICE = 'test-auth-key';
process.env.API_KEY_USER_SERVICE = 'test-user-key';
process.env.API_KEY_CONTENT_SERVICE = 'test-content-key';
process.env.API_KEY_PROGRESS_SERVICE = 'test-progress-key';
process.env.API_KEY_PAYMENT_SERVICE = 'test-payment-key';
