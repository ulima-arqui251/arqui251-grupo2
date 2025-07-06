const axios = require('axios');
const jwt = require('jsonwebtoken');

const directURL = 'http://localhost:3003';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this';

const user = { id: '6dd14afa-1c0b-4906-93ab-4fd1033cd774', email: 'student1@studymate.com', role: 'student' };
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

async function testDirectVsGateway() {
  console.log('🔍 Comparando acceso directo vs Gateway...\n');
  
  const token = generateJWT(user);
  
  // 1. Probar directo al Enrollment Service
  console.log('1️⃣ Probando DIRECTO al Enrollment Service...');
  try {
    const directResponse = await axios.post(`${directURL}/api/enrollment/enrollments`, {
      courseId: courseId
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Respuesta DIRECTA exitosa:', directResponse.data);
    
  } catch (error) {
    console.error('❌ Error DIRECTO:', error.code || error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 2. Probar vía Gateway
  console.log('2️⃣ Probando VÍA GATEWAY...');
  try {
    const gatewayResponse = await axios.post(`http://localhost:3001/api/enrollment/enrollments`, {
      courseId: courseId
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Respuesta VÍA GATEWAY exitosa:', gatewayResponse.data);
    
  } catch (error) {
    console.error('❌ Error VÍA GATEWAY:', error.code || error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
}

testDirectVsGateway();
