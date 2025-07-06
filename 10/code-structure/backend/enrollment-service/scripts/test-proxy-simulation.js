const axios = require('axios');
const jwt = require('jsonwebtoken');

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

async function testProxySimulation() {
  console.log('🔍 Simulando exactamente lo que hace el proxy...\n');
  
  const token = generateJWT(user);
  
  // Simular el rewrite del path que hace el proxy
  const originalPath = '/api/enrollment/enrollments';
  const rewrittenPath = '/api/enrollment/enrollments'; // Sin cambios según pathRewrite
  
  console.log('📍 Path original:', originalPath);
  console.log('📍 Path reescrito:', rewrittenPath);
  console.log('📍 URL final:', `http://localhost:3003${rewrittenPath}`);
  
  try {
    // Hacer exactamente la misma llamada que haría el proxy
    const response = await axios({
      method: 'POST',
      url: `http://localhost:3003${rewrittenPath}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Host': 'localhost:3003', // Simular cambio de host
        'User-Agent': 'axios/1.6.0' // User agent diferente
      },
      data: {
        courseId: courseId
      },
      timeout: 30000
    });
    
    console.log('✅ Simulación exitosa:', response.data);
    
  } catch (error) {
    console.error('❌ Error en simulación:', error.code || error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
}

async function testDifferentHeaders() {
  console.log('\n🔍 Probando con diferentes configuraciones de headers...\n');
  
  const token = generateJWT(user);
  
  const testCases = [
    {
      name: 'Headers mínimos',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Headers con proxy info',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Forwarded-For': '127.0.0.1',
        'X-Forwarded-Proto': 'http',
        'X-Forwarded-Host': 'localhost:3001'
      }
    },
    {
      name: 'Headers sin Authorization',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 Probando: ${testCase.name}`);
    try {
      const response = await axios.post(
        'http://localhost:3003/api/enrollment/enrollments',
        { courseId: courseId },
        { 
          headers: testCase.headers,
          timeout: 10000 
        }
      );
      
      console.log(`✅ ${testCase.name}: EXITOSO`);
      
    } catch (error) {
      console.error(`❌ ${testCase.name}: ${error.code || error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Message: ${error.response.data?.message || 'No message'}`);
      }
    }
  }
}

async function runDiagnostic() {
  await testProxySimulation();
  await testDifferentHeaders();
}

runDiagnostic();
