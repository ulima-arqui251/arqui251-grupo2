const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'studymate_dev',
};

async function showTables() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('📋 Listando todas las tablas en la base de datos...');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tablas encontradas:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

showTables();
