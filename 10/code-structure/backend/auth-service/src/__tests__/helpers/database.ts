import { Sequelize } from 'sequelize';
import { User } from '../../models';

// Configuración para base de datos de test
const testConfig = {
  database: process.env.TEST_DB_NAME || 'studymate_test',
  username: process.env.TEST_DB_USER || 'studymate',
  password: process.env.TEST_DB_PASSWORD || '12345',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '3306'),
  dialect: 'mysql' as const,
  logging: false, // Silenciar logs en tests
  define: {
    timestamps: true,
    underscored: false,
  }
};

let sequelize: Sequelize;

export const initTestDatabase = async (): Promise<Sequelize> => {
  sequelize = new Sequelize(testConfig);
  
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a base de datos de test establecida');
    
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ force: true }); // force: true recrea las tablas en cada test
    console.log('✓ Tablas de test sincronizadas');
    
    return sequelize;
  } catch (error) {
    console.error('✗ Error conectando a base de datos de test:', error);
    throw error;
  }
};

export const closeTestDatabase = async (): Promise<void> => {
  if (sequelize) {
    await sequelize.close();
    console.log('✓ Conexión a base de datos de test cerrada');
  }
};

export const cleanTestDatabase = async (): Promise<void> => {
  if (sequelize) {
    await User.destroy({ where: {}, force: true });
    console.log('✓ Base de datos de test limpiada');
  }
};

export { sequelize as testSequelize };
