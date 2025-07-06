const axios = require('axios');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const baseURL = 'http://localhost:3003';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'studymate_dev',
};

const user3 = { id: '6f01354b-bedb-45ff-8853-060ec478d8c3', email: 'student3@studymate.com', role: 'student' };
const courseId = '6c559227-c56f-47aa-bff4-9d4856197285';

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

async function testThirdEnrollment() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 Testing third enrollment (should go to waitlist)\n');
    
    // Verificar estado actual
    console.log('1️⃣ Estado actual del curso...');
    const [enrollments] = await connection.execute('SELECT * FROM enrollments WHERE courseId = ?', [courseId]);
    console.log(`📊 Inscripciones actuales: ${enrollments.length}`);
    
    const [capacity] = await connection.execute('SELECT * FROM course_capacities WHERE courseId = ?', [courseId]);
    console.log(`📊 Capacidad: ${capacity[0].currentEnrollments}/${capacity[0].maxCapacity}`);
    
    // Verificar si el usuario 3 existe
    console.log('\n2️⃣ Verificando usuario 3...');
    const [user3Check] = await connection.execute('SELECT * FROM users WHERE id = ?', [user3.id]);
    console.log(`👤 Usuario 3: ${user3Check.length > 0 ? 'Encontrado' : 'No encontrado'}`);
    
    if (user3Check.length > 0) {
      console.log(`   Email: ${user3Check[0].email}`);
      console.log(`   Role: ${user3Check[0].role}`);
    }
    
    // Intentar tercera inscripción
    console.log('\n3️⃣ Intentando tercera inscripción...');
    const token = generateJWT(user3);
    
    try {
      const response = await axios.post(`${baseURL}/api/enrollment/enrollments`, {
        courseId: courseId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Respuesta:', response.data);
      
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      if (error.response?.status === 500) {
        console.log('\n🔍 Error interno del servidor detectado');
        console.log('Verificando si hay problemas con foreign keys...');
        
        // Verificar que no hay inscripciones duplicadas
        const [duplicateCheck] = await connection.execute(
          'SELECT * FROM enrollments WHERE userId = ? AND courseId = ?', 
          [user3.id, courseId]
        );
        console.log(`🔍 Inscripciones duplicadas: ${duplicateCheck.length}`);
        
        // Verificar que no hay waitlist duplicadas
        const [waitlistCheck] = await connection.execute(
          'SELECT * FROM waitlists WHERE userId = ? AND courseId = ?', 
          [user3.id, courseId]
        );
        console.log(`🔍 Waitlist duplicadas: ${waitlistCheck.length}`);
      }
    }
    
    // Verificar estado final
    console.log('\n4️⃣ Estado final...');
    const [finalEnrollments] = await connection.execute('SELECT * FROM enrollments WHERE courseId = ?', [courseId]);
    console.log(`📊 Inscripciones finales: ${finalEnrollments.length}`);
    
    const [finalWaitlist] = await connection.execute('SELECT * FROM waitlists WHERE courseId = ?', [courseId]);
    console.log(`📊 Waitlist final: ${finalWaitlist.length}`);
    
    const [finalCapacity] = await connection.execute('SELECT * FROM course_capacities WHERE courseId = ?', [courseId]);
    console.log(`📊 Capacidad final: ${finalCapacity[0].currentEnrollments}/${finalCapacity[0].maxCapacity}, Waitlist: ${finalCapacity[0].waitlistCount}`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await connection.end();
  }
}

testThirdEnrollment();
