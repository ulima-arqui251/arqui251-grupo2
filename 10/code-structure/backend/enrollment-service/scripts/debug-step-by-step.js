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

// Datos de prueba
const users = [
  { id: '6dd14afa-1c0b-4906-93ab-4fd1033cd774', email: 'student1@example.com', role: 'student' },
  { id: 'b67e5429-82b1-4b45-bb4b-22bb90d8fee1', email: 'student2@example.com', role: 'student' }
];

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

async function debugStepByStep() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 Debugging enrollment creation step by step\n');
    
    // 1. Verificar usuarios en la base de datos
    console.log('1️⃣ Verificando usuarios...');
    const [userRows] = await connection.execute('SELECT id, email FROM users WHERE id IN (?, ?)', [users[0].id, users[1].id]);
    console.log('✅ Usuarios encontrados:', userRows);
    
    // 2. Verificar curso
    console.log('\n2️⃣ Verificando curso...');
    const [courseRows] = await connection.execute('SELECT id, title FROM courses WHERE id = ?', [courseId]);
    console.log('✅ Curso encontrado:', courseRows);
    
    // 3. Verificar capacidad del curso
    console.log('\n3️⃣ Verificando capacidad del curso...');
    const [capacityRows] = await connection.execute('SELECT * FROM course_capacities WHERE courseId = ?', [courseId]);
    console.log('✅ Capacidad encontrada:', capacityRows);
    
    // 4. Verificar inscripciones existentes
    console.log('\n4️⃣ Verificando inscripciones existentes...');
    const [enrollmentRows] = await connection.execute('SELECT * FROM enrollments WHERE courseId = ?', [courseId]);
    console.log('✅ Inscripciones existentes:', enrollmentRows);
    
    // 5. Intentar primera inscripción
    console.log('\n5️⃣ Intentando primera inscripción...');
    const token1 = generateJWT(users[0]);
    
    try {
      const response1 = await axios.post(`${baseURL}/api/enrollment/enrollments`, {
        courseId: courseId
      }, {
        headers: { Authorization: `Bearer ${token1}` }
      });
      console.log('✅ Primera inscripción exitosa:', response1.data);
    } catch (error) {
      console.error('❌ Error en primera inscripción:', error.response?.data || error.message);
    }
    
    // 6. Verificar estado después de primera inscripción
    console.log('\n6️⃣ Estado después de primera inscripción...');
    const [enrollmentRows2] = await connection.execute('SELECT * FROM enrollments WHERE courseId = ?', [courseId]);
    console.log('✅ Inscripciones después de primera:', enrollmentRows2);
    
    const [capacityRows2] = await connection.execute('SELECT * FROM course_capacities WHERE courseId = ?', [courseId]);
    console.log('✅ Capacidad después de primera:', capacityRows2);
    
    // 7. Intentar segunda inscripción
    console.log('\n7️⃣ Intentando segunda inscripción...');
    const token2 = generateJWT(users[1]);
    
    try {
      const response2 = await axios.post(`${baseURL}/api/enrollment/enrollments`, {
        courseId: courseId
      }, {
        headers: { Authorization: `Bearer ${token2}` }
      });
      console.log('✅ Segunda inscripción exitosa:', response2.data);
    } catch (error) {
      console.error('❌ Error en segunda inscripción:', error.response?.data || error.message);
      
      // Verificar si hay problemas con el usuario 2
      console.log('\n🔍 Verificando detalles del usuario 2...');
      const [user2Check] = await connection.execute('SELECT * FROM users WHERE id = ?', [users[1].id]);
      console.log('User 2 details:', user2Check);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await connection.end();
  }
}

debugStepByStep();
