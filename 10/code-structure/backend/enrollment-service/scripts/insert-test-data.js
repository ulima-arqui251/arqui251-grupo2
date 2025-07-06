/**
 * Script para insertar datos de prueba en tablas existentes
 * Adaptado a la estructura real de la base de datos
 */

const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345',
  database: 'studymate_dev'
};

const insertTestData = async () => {
  let connection;
  
  try {
    console.log('🔗 Conectando a MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conexión establecida');

    // Generar UUIDs únicos para los datos de prueba
    const adminId = uuidv4();
    const teacherId = uuidv4();
    const student1Id = uuidv4();
    const student2Id = uuidv4();
    const student3Id = uuidv4();

    // Insertar usuarios de prueba con estructura real
    console.log('📝 Insertando usuarios de prueba...');
    const insertUsersSQL = `
      INSERT IGNORE INTO \`users\` (
        \`id\`, 
        \`email\`, 
        \`password_hash\`, 
        \`first_name\`, 
        \`last_name\`, 
        \`role\`,
        \`email_verified\`,
        \`is_active\`
      ) VALUES
      (?, 'admin@studymate.com', '$2b$10$DummyHashForTestingOnly123456789', 'Admin', 'User', 'admin', 1, 1),
      (?, 'teacher@studymate.com', '$2b$10$DummyHashForTestingOnly123456789', 'John', 'Instructor', 'teacher', 1, 1),
      (?, 'student1@studymate.com', '$2b$10$DummyHashForTestingOnly123456789', 'Alice', 'Johnson', 'student', 1, 1),
      (?, 'student2@studymate.com', '$2b$10$DummyHashForTestingOnly123456789', 'Bob', 'Smith', 'student', 1, 1),
      (?, 'student3@studymate.com', '$2b$10$DummyHashForTestingOnly123456789', 'Emma', 'Wilson', 'student', 1, 1);
    `;

    await connection.execute(insertUsersSQL, [adminId, teacherId, student1Id, student2Id, student3Id]);
    console.log('✅ Usuarios de prueba insertados');

    // Generar UUIDs para cursos
    const course1Id = uuidv4();
    const course2Id = uuidv4();
    const course3Id = uuidv4();
    const course4Id = uuidv4();

    // Insertar cursos de prueba
    console.log('📝 Insertando cursos de prueba...');
    const insertCoursesSQL = `
      INSERT IGNORE INTO \`courses\` (
        \`id\`, 
        \`title\`, 
        \`description\`, 
        \`instructorId\`, 
        \`maxCapacity\`,
        \`currentEnrollments\`,
        \`isActive\`
      ) VALUES
      (?, 'JavaScript Fundamentals', 'Learn the basics of JavaScript programming from scratch. Perfect for beginners.', ?, 30, 0, 1),
      (?, 'React Development', 'Build modern web applications with React. Covers components, hooks, and state management.', ?, 25, 0, 1),
      (?, 'Node.js Backend Development', 'Server-side development with Node.js, Express, and databases.', ?, 20, 0, 1),
      (?, 'Full-Stack Web Development', 'Complete web development course covering frontend and backend technologies.', ?, 15, 0, 1);
    `;

    await connection.execute(insertCoursesSQL, [course1Id, teacherId, course2Id, teacherId, course3Id, teacherId, course4Id, teacherId]);
    console.log('✅ Cursos de prueba insertados');

    // Insertar configuración de capacidad para cada curso
    console.log('📝 Insertando configuración de capacidad...');
    const insertCapacitySQL = `
      INSERT IGNORE INTO \`course_capacities\` (
        \`id\`,
        \`courseId\`, 
        \`maxCapacity\`,
        \`currentEnrollments\`,
        \`allowWaitlist\`,
        \`waitlistCount\`,
        \`createdAt\`,
        \`updatedAt\`
      ) VALUES
      (?, ?, 30, 0, 1, 0, NOW(), NOW()),
      (?, ?, 25, 0, 1, 0, NOW(), NOW()),
      (?, ?, 20, 0, 1, 0, NOW(), NOW()),
      (?, ?, 15, 0, 1, 0, NOW(), NOW());
    `;

    const capacity1Id = uuidv4();
    const capacity2Id = uuidv4();
    const capacity3Id = uuidv4();
    const capacity4Id = uuidv4();

    await connection.execute(insertCapacitySQL, [
      capacity1Id, course1Id,
      capacity2Id, course2Id,
      capacity3Id, course3Id,
      capacity4Id, course4Id
    ]);
    console.log('✅ Configuración de capacidad insertada');

    // Verificar datos insertados
    console.log('\n📊 Verificando datos insertados...');
    
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`   Total usuarios: ${users[0].count}`);
    
    const [courses] = await connection.execute('SELECT COUNT(*) as count FROM courses');
    console.log(`   Total cursos: ${courses[0].count}`);

    const [capacities] = await connection.execute('SELECT COUNT(*) as count FROM course_capacities');
    console.log(`   Total capacidades: ${capacities[0].count}`);

    // Mostrar algunos ejemplos
    console.log('\n👥 Usuarios de ejemplo:');
    const [userSamples] = await connection.execute('SELECT id, email, first_name, last_name, role FROM users LIMIT 5');
    userSamples.forEach(user => {
      console.log(`   ${user.first_name} ${user.last_name} (${user.role}) - ${user.email}`);
    });

    console.log('\n📚 Cursos de ejemplo:');
    const [courseSamples] = await connection.execute(`
      SELECT c.id, c.title, c.maxCapacity, u.first_name, u.last_name 
      FROM courses c 
      JOIN users u ON c.instructorId = u.id 
      LIMIT 5
    `);
    courseSamples.forEach(course => {
      console.log(`   "${course.title}" - Instructor: ${course.first_name} ${course.last_name} (Cap: ${course.maxCapacity})`);
    });

    console.log('\n🎉 Datos de prueba insertados exitosamente!');
    console.log('\n📋 IDs generados para referencia:');
    console.log(`   Admin ID: ${adminId}`);
    console.log(`   Teacher ID: ${teacherId}`);
    console.log(`   Student1 ID: ${student1Id}`);
    console.log(`   Student2 ID: ${student2Id}`);
    console.log(`   Student3 ID: ${student3Id}`);
    console.log(`   Course1 ID: ${course1Id}`);
    console.log(`   Course2 ID: ${course2Id}`);
    console.log(`   Course3 ID: ${course3Id}`);
    console.log(`   Course4 ID: ${course4Id}`);
    console.log(`   Capacity1 ID: ${capacity1Id}`);
    console.log(`   Capacity2 ID: ${capacity2Id}`);
    console.log(`   Capacity3 ID: ${capacity3Id}`);
    console.log(`   Capacity4 ID: ${capacity4Id}`);

  } catch (error) {
    console.error('❌ Error durante la inserción:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 Verifica las credenciales de MySQL (usuario/contraseña)');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗃️  Verifica que la base de datos "studymate_dev" exista');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.error('🔄 Algunos datos ya existen (esto es normal si ejecutas el script múltiples veces)');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 Conexión cerrada');
    }
  }
};

// Verificar que uuid esté disponible
try {
  require('uuid');
} catch (error) {
  console.error('❌ El paquete "uuid" no está instalado.');
  console.error('💡 Ejecuta: npm install uuid');
  process.exit(1);
}

// Ejecutar script
insertTestData();
