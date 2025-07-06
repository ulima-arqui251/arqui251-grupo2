/**
 * Script para insertar configuraciones de capacidad usando IDs existentes
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

const createCapacitiesForExistingCourses = async () => {
  let connection;
  
  try {
    console.log('🔗 Conectando a MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conexión establecida');

    // Obtener todos los cursos existentes
    console.log('📋 Obteniendo cursos existentes...');
    const [courses] = await connection.execute('SELECT id, title, maxCapacity FROM courses');
    console.log(`   Encontrados ${courses.length} cursos`);

    if (courses.length === 0) {
      console.log('❌ No hay cursos en la base de datos');
      return;
    }

    // Insertar capacidad para cada curso
    console.log('\n📝 Insertando configuraciones de capacidad...');
    for (const course of courses) {
      try {
        const capacityId = uuidv4();
        const maxCapacity = course.maxCapacity || 50; // Usar la capacidad del curso o 50 por defecto
        
        const insertSQL = `
          INSERT INTO \`course_capacities\` (
            \`id\`,
            \`courseId\`, 
            \`maxCapacity\`,
            \`currentEnrollments\`,
            \`allowWaitlist\`,
            \`waitlistCount\`,
            \`createdAt\`,
            \`updatedAt\`
          ) VALUES (?, ?, ?, 0, 1, 0, NOW(), NOW())
        `;

        await connection.execute(insertSQL, [capacityId, course.id, maxCapacity]);
        console.log(`   ✅ "${course.title}": Capacidad ${maxCapacity} creada`);

      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`   ⚠️  "${course.title}": Ya tiene configuración de capacidad`);
        } else {
          console.log(`   ❌ "${course.title}": Error - ${error.message}`);
        }
      }
    }

    // Verificar resultados
    console.log('\n📊 Verificando configuraciones creadas...');
    const [capacities] = await connection.execute(`
      SELECT 
        c.id as courseId,
        c.title,
        cc.maxCapacity,
        cc.currentEnrollments,
        cc.allowWaitlist
      FROM courses c
      JOIN course_capacities cc ON c.id = cc.courseId
    `);

    console.log(`   Total configuraciones: ${capacities.length}`);
    capacities.forEach(cap => {
      console.log(`   ✅ "${cap.title}": ${cap.currentEnrollments}/${cap.maxCapacity} (Waitlist: ${cap.allowWaitlist ? 'Sí' : 'No'})`);
    });

    console.log('\n🎉 Configuraciones de capacidad creadas exitosamente!');

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

// Verificar que uuid esté disponible
try {
  require('uuid');
} catch (error) {
  console.error('❌ El paquete "uuid" no está instalado.');
  console.error('💡 Ejecuta: npm install uuid');
  process.exit(1);
}

// Ejecutar script
createCapacitiesForExistingCourses();
