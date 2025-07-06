const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'studymate_dev',
};

async function listAllUsers() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('👥 Listando todos los usuarios en la base de datos...\n');
    
    const [users] = await connection.execute('SELECT id, email, role FROM users ORDER BY email');
    
    console.log('Usuarios encontrados:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });
    
    console.log(`📊 Total de usuarios: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

listAllUsers();
