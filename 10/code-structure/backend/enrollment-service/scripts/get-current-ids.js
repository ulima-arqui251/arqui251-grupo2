/**
 * Script para obtener los IDs actuales de usuarios y cursos
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345',
  database: 'studymate_dev'
};

const getCurrentIds = async () => {
  let connection;
  
  try {
    console.log('🔗 Conectando a MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conexión establecida');

    // Obtener usuarios por rol
    console.log('\n👥 IDs de usuarios:');
    const [users] = await connection.execute('SELECT id, first_name, last_name, role, email FROM users ORDER BY role');
    
    let adminId, teacherId, studentIds = [];
    
    users.forEach(user => {
      console.log(`   ${user.first_name} ${user.last_name} (${user.role}): ${user.id}`);
      
      if (user.role === 'admin') adminId = user.id;
      if (user.role === 'teacher') teacherId = user.id;
      if (user.role === 'student') studentIds.push(user.id);
    });

    // Obtener cursos
    console.log('\n📚 IDs de cursos:');
    const [courses] = await connection.execute('SELECT id, title, maxCapacity FROM courses ORDER BY title');
    
    courses.forEach((course, index) => {
      console.log(`   Course${index + 1}: "${course.title}" (Cap: ${course.maxCapacity}): ${course.id}`);
    });

    // Generar código para el script de prueba
    console.log('\n📋 Código para script de prueba:');
    console.log('const TEST_DATA = {');
    console.log(`  adminId: '${adminId}',`);
    console.log(`  teacherId: '${teacherId}',`);
    studentIds.forEach((id, index) => {
      console.log(`  student${index + 1}Id: '${id}',`);
    });
    courses.forEach((course, index) => {
      console.log(`  course${index + 1}Id: '${course.id}', // ${course.title}`);
    });
    console.log('};');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 Conexión cerrada');
    }
  }
};

// Ejecutar script
getCurrentIds();
