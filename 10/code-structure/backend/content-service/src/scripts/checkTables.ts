import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'studymate_dev',
  username: process.env.DB_USER || 'studymate',
  password: process.env.DB_PASSWORD || '12345',
  logging: false
});

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    console.log('\n📋 Describiendo estructura de la tabla users...');
    try {
      const [usersResults] = await sequelize.query('DESCRIBE users');
      console.log('Columnas en users:');
      console.table(usersResults);
    } catch (error) {
      console.log('⚠️ Tabla users no existe:', (error as Error).message);
    }
    
    console.log('\n📋 Describiendo estructura de la tabla courses...');
    try {
      const [courseResults] = await sequelize.query('DESCRIBE courses');
      console.log('Columnas en courses:');
      console.table(courseResults);
    } catch (error) {
      console.log('⚠️ Tabla courses no existe:', (error as Error).message);
    }
    
    console.log('\n📋 Listando todas las tablas...');
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('Tablas existentes:');
    console.table(tables);
    
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await sequelize.close();
  }
}

checkTables();
