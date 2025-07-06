const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'studymate_dev',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log
  }
);

async function fixEnrollmentHistory() {
  try {
    console.log('🔧 Actualizando esquema de enrollment_history...');
    
    // Permitir NULL en previousStatus
    await sequelize.query(`
      ALTER TABLE enrollment_history 
      MODIFY COLUMN previousStatus ENUM('active', 'completed', 'dropped', 'suspended', 'pending', 'cancelled') NULL
    `);
    
    console.log('✅ Esquema actualizado correctamente');
    
    // Verificar el cambio
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM enrollment_history LIKE 'previousStatus'
    `);
    
    console.log('📋 Configuración actual del campo previousStatus:');
    console.log(results[0]);
    
  } catch (error) {
    console.error('❌ Error al actualizar esquema:', error);
  } finally {
    await sequelize.close();
  }
}

fixEnrollmentHistory();
