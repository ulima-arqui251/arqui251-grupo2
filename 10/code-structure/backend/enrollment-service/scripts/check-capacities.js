/**
 * Script para verificar la tabla course_capacities
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345',
  database: 'studymate_dev'
};

const checkCapacities = async () => {
  let connection;
  
  try {
    console.log('🔗 Conectando a MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conexión establecida');

    // Verificar estructura de course_capacities
    console.log('\n📋 Estructura de tabla COURSE_CAPACITIES:');
    try {
      const [capacityColumns] = await connection.execute('DESCRIBE course_capacities');
      capacityColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    } catch (error) {
      console.log('  ❌ Tabla course_capacities no existe');
    }

    // Verificar datos en course_capacities
    console.log('\n📊 Datos en course_capacities:');
    try {
      const [capacities] = await connection.execute('SELECT COUNT(*) as count FROM course_capacities');
      console.log(`  Total capacidades: ${capacities[0].count}`);
      
      if (capacities[0].count > 0) {
        const [capacitySamples] = await connection.execute('SELECT * FROM course_capacities LIMIT 5');
        console.log('\n📋 Ejemplos de capacidades:');
        capacitySamples.forEach(capacity => {
          console.log(`  Course ${capacity.courseId}: ${capacity.currentEnrollments}/${capacity.maxCapacity} (Waitlist: ${capacity.allowWaitlist ? 'Sí' : 'No'})`);
        });
      }
    } catch (error) {
      console.log('  ❌ Error al leer course_capacities:', error.message);
    }

    // Verificar relación entre courses y course_capacities
    console.log('\n🔗 Relación courses <-> capacities:');
    try {
      const [joinResult] = await connection.execute(`
        SELECT 
          c.id as courseId,
          c.title,
          cc.maxCapacity,
          cc.currentEnrollments,
          cc.allowWaitlist
        FROM courses c
        LEFT JOIN course_capacities cc ON c.id = cc.courseId
        LIMIT 10
      `);
      
      joinResult.forEach(row => {
        if (row.maxCapacity !== null) {
          console.log(`  ✅ "${row.title}": ${row.currentEnrollments}/${row.maxCapacity}`);
        } else {
          console.log(`  ❌ "${row.title}": SIN CONFIGURACIÓN DE CAPACIDAD`);
        }
      });
    } catch (error) {
      console.log('  ❌ Error en JOIN:', error.message);
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
checkCapacities();
