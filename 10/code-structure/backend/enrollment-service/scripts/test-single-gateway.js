const axios = require('axios');
const jwt = require('jsonwebtoken');

const gatewayURL = 'http://localhost:3001';
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

async function testSingleEnrollmentViaGateway() {
  console.log('🔍 Probando una sola inscripción vía Gateway...\n');
  
  try {
    const token = generateJWT(user);
    console.log('✅ Token generado para:', user.email);
    
    console.log('📤 Enviando solicitud POST...');
    console.log('URL:', `${gatewayURL}/api/enrollment/enrollments`);
    console.log('Headers:', { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });
    console.log('Body:', { courseId });
    
    const response = await axios.post(`${gatewayURL}/api/enrollment/enrollments`, {
      courseId: courseId
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 segundos de timeout
    });
    
    console.log('✅ Respuesta exitosa:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.code || error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
      console.error('❌ Headers:', error.response.headers);
    }
  }
}

testSingleEnrollmentViaGateway();
