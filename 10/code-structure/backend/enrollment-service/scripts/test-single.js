const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const baseURL = 'http://localhost:3003';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Datos de prueba
const user = { id: 'df58bd16-bbf4-4a2e-9391-747391e521c7', email: 'student2@studymate.com', role: 'student' };
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

async function testSingleEnrollment() {
  try {
    console.log('🔍 Testing single enrollment...');
    
    const token = generateJWT(user);
    console.log('🔍 Generated JWT for user:', user.email);
    
    const response = await axios.post(`${baseURL}/api/enrollment/enrollments`, {
      courseId: courseId
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Enrollment response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Headers:', error.response.headers);
    }
  }
}

testSingleEnrollment();
