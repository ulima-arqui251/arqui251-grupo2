import { Sequelize } from 'sequelize';
import { config } from './config.js';

// Configuración para SQLite (desarrollo) o MySQL (producción)
let sequelize;

if (config.DB_TYPE === 'sqlite' || !config.DB_HOST) {
  // Usar SQLite para desarrollo local
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.DB_STORAGE || './database.sqlite',
    logging: config.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  // Usar MySQL para producción
  sequelize = new Sequelize({
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    dialect: 'mysql',
    logging: config.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
}

// Test de conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida correctamente');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
  }
};

export default sequelize;
export { sequelize, testConnection };
