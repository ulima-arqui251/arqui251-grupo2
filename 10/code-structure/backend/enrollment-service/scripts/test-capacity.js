const axios = require('axios');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const baseURL = 'http://localhost:3003';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Datos de prueba reales de la base de datos
const users = [
  { id: '6dd14afa-1c0b-4906-93ab-4fd1033cd774', email: 'student1@studymate.com', role: 'student' },
  { id: 'df58bd16-bbf4-4a2e-9391-747391e521c7', email: 'student2@studymate.com', role: 'student' },
  { id: '6f01354b-bedb-45ff-8853-060ec478d8c3', email: 'student3@studymate.com', role: 'student' },
  { id: 'bddb2a49-beda-49d6-9d24-69df616c93b2', email: 'teacher@studymate.com', role: 'teacher' },
  { id: '399ed608-3eca-43a9-bc25-95ae45240e37', email: 'admin@studymate.com', role: 'admin' }
];

const courses = [
  { id: '6c559227-c56f-47aa-bff4-9d4856197285', title: 'Full-Stack Web Development' },
  { id: '0e705949-c446-4de6-b654-c98729323eaa', title: 'JavaScript Fundamentals' },
  { id: '2f8a1b5c-9d7e-4c3a-a1b2-3c4d5e6f7890', title: 'React & Modern Frontend' },
  { id: '4e3d2c1b-6a5b-4c3d-9e8f-1a2b3c4d5e6f', title: 'Node.js Backend Development' }
];

function generateJWT(user) {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'studymate_dev',
};

async function testCapacityTracking() {
  console.log('🔬 Probando seguimiento de capacidad y waitlist\n');

  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. Establecer capacidad muy baja para un curso
    console.log('1️⃣ Configurando capacidad baja para testing...');
    await connection.execute(
      'UPDATE course_capacities SET maxCapacity = 2, currentEnrollments = 0, waitlistCount = 0 WHERE courseId = ?',
      [courses[0].id] // Full-Stack Web Development
    );
    console.log(`✅ Capacidad de "${courses[0].title}" configurada a 2 estudiantes\n`);

    // 2. Crear primera inscripción
    console.log('2️⃣ Primera inscripción...');
    const student1Token = generateJWT(users[0]);
    const response1 = await axios.post(`${baseURL}/api/enrollment/enrollments`, {
      courseId: courses[0].id
    }, {
      headers: { Authorization: `Bearer ${student1Token}` }
    });
    
    if (response1.data.success) {
      console.log('✅ Primera inscripción exitosa');
    } else {
      console.log('❌ Error en primera inscripción:', response1.data.message);
    }

    // 3. Verificar capacidad después de primera inscripción
    console.log('\n3️⃣ Verificando capacidad después de primera inscripción...');
    const capacityCheck1 = await axios.get(`${baseURL}/api/enrollment/capacity/${courses[0].id}`);
    console.log('📊 Estado actual:', {
      currentEnrollments: capacityCheck1.data.data.currentEnrollments,
      maxCapacity: capacityCheck1.data.data.maxCapacity,
      availableSpots: capacityCheck1.data.data.availableSpots,
      isFull: capacityCheck1.data.data.isFull
    });

    // 4. Segunda inscripción
    console.log('\n4️⃣ Segunda inscripción...');
    const student2Token = generateJWT(users[1]);
    try {
      const response2 = await axios.post(`${baseURL}/api/enrollment/enrollments`, {
        courseId: courses[0].id
      }, {
        headers: { Authorization: `Bearer ${student2Token}` }
      });
      
      if (response2.data.success) {
        console.log('✅ Segunda inscripción exitosa');
      } else {
        console.log('❌ Error en segunda inscripción:', response2.data.message);
      }
    } catch (error) {
      console.log('❌ Error interno en segunda inscripción:', error.response?.data || error.message);
    }

    // 5. Verificar capacidad después de segunda inscripción
    console.log('\n5️⃣ Verificando capacidad después de segunda inscripción...');
    const capacityCheck2 = await axios.get(`${baseURL}/api/enrollment/capacity/${courses[0].id}`);
    console.log('📊 Estado actual:', {
      currentEnrollments: capacityCheck2.data.data.currentEnrollments,
      maxCapacity: capacityCheck2.data.data.maxCapacity,
      availableSpots: capacityCheck2.data.data.availableSpots,
      isFull: capacityCheck2.data.data.isFull
    });

    // 6. Tercera inscripción (debería ir a waitlist)
    console.log('\n6️⃣ Tercera inscripción (debería ir a waitlist)...');
    const student3Token = generateJWT(users[2]);
    const response3 = await axios.post(`${baseURL}/api/enrollment/enrollments`, {
      courseId: courses[0].id
    }, {
      headers: { Authorization: `Bearer ${student3Token}` }
    });
    
    console.log('📝 Respuesta tercera inscripción:', response3.data);

    // 7. Verificar capacidad final y waitlist
    console.log('\n7️⃣ Estado final del curso...');
    const finalCapacityCheck = await axios.get(`${baseURL}/api/enrollment/capacity/${courses[0].id}`);
    console.log('📊 Estado final:', {
      currentEnrollments: finalCapacityCheck.data.data.currentEnrollments,
      maxCapacity: finalCapacityCheck.data.data.maxCapacity,
      availableSpots: finalCapacityCheck.data.data.availableSpots,
      isFull: finalCapacityCheck.data.data.isFull,
      waitlistCount: finalCapacityCheck.data.data.waitlistCount
    });

    // 8. Verificar waitlist
    console.log('\n8️⃣ Verificando waitlist...');
    const adminToken = generateJWT(users[4]);
    const waitlistCheck = await axios.get(`${baseURL}/api/enrollment/waitlist/${courses[0].id}/list`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('📋 Waitlist:', waitlistCheck.data);

    console.log('\n🎉 Pruebas de capacidad completadas!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
  } finally {
    await connection.end();
  }
}

testCapacityTracking();
