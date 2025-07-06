const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'studymate_dev',
};

async function cleanEnrollments() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧹 Limpiando inscripciones existentes...');
    
    // Limpiar todas las tablas relacionadas con inscripciones
    await connection.execute('DELETE FROM enrollment_history');
    console.log('✅ Limpiado enrollment_history');
    
    await connection.execute('DELETE FROM waitlists');
    console.log('✅ Limpiado waitlists');
    
    await connection.execute('DELETE FROM enrollments');
    console.log('✅ Limpiado enrollments');
    
    // Reiniciar las capacidades a 0
    await connection.execute('UPDATE course_capacities SET currentEnrollments = 0, waitlistCount = 0');
    console.log('✅ Reiniciado contadores de capacidad');
    
    console.log('🎉 Limpieza completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await connection.end();
  }
}

cleanEnrollments();
