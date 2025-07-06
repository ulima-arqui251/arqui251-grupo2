/**
 * Script para inicializar tablas base necesarias para Enrollment Service
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345',
  database: 'studymate_dev'
};

const createBaseTables = async () => {
  let connection;
  
  try {
    console.log('🔗 Conectando a MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conexión establecida');

    // Crear tabla users
    const createUsersSQL = `
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` CHAR(36) BINARY PRIMARY KEY,
        \`email\` VARCHAR(255) UNIQUE NOT NULL,
        \`firstName\` VARCHAR(100) NOT NULL,
        \`lastName\` VARCHAR(100) NOT NULL,
        \`role\` ENUM('student', 'instructor', 'admin') DEFAULT 'student',
        \`isActive\` BOOLEAN DEFAULT true,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;

    console.log('📝 Creando tabla users...');
    await connection.execute(createUsersSQL);
    console.log('✅ Tabla users creada');

    // Crear tabla courses
    const createCoursesSQL = `
      CREATE TABLE IF NOT EXISTS \`courses\` (
        \`id\` CHAR(36) BINARY PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`instructorId\` CHAR(36) BINARY,
        \`isActive\` BOOLEAN DEFAULT true,
        \`maxCapacity\` INT DEFAULT 50,
        \`currentEnrollments\` INT DEFAULT 0,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`instructorId\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB;
    `;

    console.log('📝 Creando tabla courses...');
    await connection.execute(createCoursesSQL);
    console.log('✅ Tabla courses creada');

    // Insertar datos de prueba en users
    const insertUsersSQL = `
      INSERT IGNORE INTO \`users\` (\`id\`, \`email\`, \`firstName\`, \`lastName\`, \`role\`) VALUES
      ('550e8400-e29b-41d4-a716-446655440000', 'admin@studymate.com', 'Admin', 'User', 'admin'),
      ('550e8400-e29b-41d4-a716-446655440001', 'instructor@studymate.com', 'John', 'Instructor', 'instructor'),
      ('550e8400-e29b-41d4-a716-446655440002', 'student1@studymate.com', 'Alice', 'Student', 'student'),
      ('550e8400-e29b-41d4-a716-446655440003', 'student2@studymate.com', 'Bob', 'Student', 'student');
    `;

    console.log('📝 Insertando usuarios de prueba...');
    await connection.execute(insertUsersSQL);
    console.log('✅ Usuarios de prueba insertados');

    // Insertar datos de prueba en courses
    const insertCoursesSQL = `
      INSERT IGNORE INTO \`courses\` (\`id\`, \`title\`, \`description\`, \`instructorId\`, \`maxCapacity\`) VALUES
      ('550e8400-e29b-41d4-a716-446655440100', 'JavaScript Fundamentals', 'Learn the basics of JavaScript programming', '550e8400-e29b-41d4-a716-446655440001', 30),
      ('550e8400-e29b-41d4-a716-446655440101', 'React Development', 'Build modern web apps with React', '550e8400-e29b-41d4-a716-446655440001', 25),
      ('550e8400-e29b-41d4-a716-446655440102', 'Node.js Backend', 'Server-side development with Node.js', '550e8400-e29b-41d4-a716-446655440001', 20);
    `;

    console.log('📝 Insertando cursos de prueba...');
    await connection.execute(insertCoursesSQL);
    console.log('✅ Cursos de prueba insertados');

    // Verificar datos
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [courses] = await connection.execute('SELECT COUNT(*) as count FROM courses');
    
    console.log('📊 Resumen:');
    console.log(`   Usuarios: ${users[0].count}`);
    console.log(`   Cursos: ${courses[0].count}`);
    console.log('🎉 Inicialización completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 Verifica las credenciales de MySQL (usuario/contraseña)');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗃️  Verifica que la base de datos "studymate_dev" exista');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Conexión cerrada');
    }
  }
};

// Ejecutar script
createBaseTables();
