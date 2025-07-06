/**
 * Script para verificar estructura de tablas existentes
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345',
  database: 'studymate_dev'
};

const checkTables = async () => {
  let connection;
  
  try {
    console.log('🔗 Conectando a MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conexión establecida');

    // Verificar estructura de tabla users
    console.log('\n📋 Estructura de tabla USERS:');
    try {
      const [userColumns] = await connection.execute('DESCRIBE users');
      userColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    } catch (error) {
      console.log('  ❌ Tabla users no existe');
    }

    // Verificar estructura de tabla courses
    console.log('\n📋 Estructura de tabla COURSES:');
    try {
      const [courseColumns] = await connection.execute('DESCRIBE courses');
      courseColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    } catch (error) {
      console.log('  ❌ Tabla courses no existe');
    }

    // Verificar datos existentes
    console.log('\n📊 Datos existentes:');
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`  Usuarios: ${users[0].count}`);
      
      const [userSample] = await connection.execute('SELECT * FROM users LIMIT 3');
      if (userSample.length > 0) {
        console.log('  Ejemplo de usuario:', userSample[0]);
      }
    } catch (error) {
      console.log('  ❌ No se pudieron leer usuarios');
    }

    try {
      const [courses] = await connection.execute('SELECT COUNT(*) as count FROM courses');
      console.log(`  Cursos: ${courses[0].count}`);
    } catch (error) {
      console.log('  ❌ No se pudieron leer cursos');
    }

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
checkTables();
