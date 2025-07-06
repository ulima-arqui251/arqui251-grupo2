const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configuración del API Gateway
const gatewayURL = 'http://localhost:3000';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this'; // Mismo que el enrollment service

// Datos de prueba reales
const users = [
  { id: '6dd14afa-1c0b-4906-93ab-4fd1033cd774', email: 'student1@studymate.com', role: 'student' },
  { id: 'df58bd16-bbf4-4a2e-9391-747391e521c7', email: 'student2@studymate.com', role: 'student' },
  { id: '399ed608-3eca-43a9-bc25-95ae45240e37', email: 'admin@studymate.com', role: 'admin' }
];

const courses = [
  { id: '6c559227-c56f-47aa-bff4-9d4856197285', title: 'Full-Stack Web Development' },
  { id: '0e705949-c446-4de6-b654-c98729323eaa', title: 'JavaScript Fundamentals' }
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

async function testGatewayIntegration() {
  console.log('🌉 Probando Integración Completa vía API Gateway');
  console.log('='.repeat(50));
  console.log(`🔗 Gateway URL: ${gatewayURL}`);
  console.log('');
  
  try {
    // 1. Health check del Gateway
    console.log('1️⃣ Health check del API Gateway...');
    try {
      const healthResponse = await axios.get(`${gatewayURL}/health`);
      console.log('✅ Gateway Health:', healthResponse.data);
    } catch (error) {
      console.error('❌ Gateway no disponible:', error.message);
      return;
    }

    // 2. Health check del Enrollment Service vía Gateway
    console.log('\n2️⃣ Health check del Enrollment Service vía Gateway...');
    try {
      const enrollmentHealthResponse = await axios.get(`${gatewayURL}/api/enrollment/health`);
      console.log('✅ Enrollment Service Health:', enrollmentHealthResponse.data);
    } catch (error) {
      console.error('❌ Enrollment Service no accesible vía Gateway:', error.response?.data || error.message);
    }

    // 3. Obtener capacidad de curso vía Gateway
    console.log('\n3️⃣ Consultando capacidad de curso vía Gateway...');
    try {
      const capacityResponse = await axios.get(`${gatewayURL}/api/enrollment/capacity/${courses[0].id}`);
      console.log('✅ Capacidad del curso:', capacityResponse.data.data);
    } catch (error) {
      console.error('❌ Error consultando capacidad:', error.response?.data || error.message);
    }

    // 4. Crear inscripción vía Gateway
    console.log('\n4️⃣ Creando inscripción vía Gateway...');
    const studentToken = generateJWT(users[0]);
    
    try {
      const enrollmentResponse = await axios.post(`${gatewayURL}/api/enrollment/enrollments`, {
        courseId: courses[0].id
      }, {
        headers: { 
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Inscripción creada:', enrollmentResponse.data);
    } catch (error) {
      console.error('❌ Error creando inscripción:', error.response?.data || error.message);
    }

    // 5. Listar inscripciones del usuario vía Gateway
    console.log('\n5️⃣ Listando inscripciones del usuario vía Gateway...');
    try {
      const userEnrollmentsResponse = await axios.get(`${gatewayURL}/api/enrollment/enrollments/me`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Inscripciones del usuario:', userEnrollmentsResponse.data);
    } catch (error) {
      console.error('❌ Error listando inscripciones:', error.response?.data || error.message);
    }

    // 6. Verificar capacidad actualizada vía Gateway
    console.log('\n6️⃣ Verificando capacidad actualizada vía Gateway...');
    try {
      const updatedCapacityResponse = await axios.get(`${gatewayURL}/api/enrollment/capacity/${courses[0].id}`);
      console.log('✅ Capacidad actualizada:', updatedCapacityResponse.data.data);
    } catch (error) {
      console.error('❌ Error verificando capacidad:', error.response?.data || error.message);
    }

    // 7. Listar todas las inscripciones como admin vía Gateway
    console.log('\n7️⃣ Listando todas las inscripciones como admin vía Gateway...');
    const adminToken = generateJWT(users[2]);
    
    try {
      const allEnrollmentsResponse = await axios.get(`${gatewayURL}/api/enrollment/enrollments/course/${courses[0].id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Todas las inscripciones:', allEnrollmentsResponse.data);
    } catch (error) {
      console.error('❌ Error listando todas las inscripciones:', error.response?.data || error.message);
    }

    console.log('\n🎉 Pruebas de integración vía Gateway completadas!');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error);
  }
}

async function testGatewayRoutes() {
  console.log('\n🔍 Probando rutas del Gateway...');
  
  // Probar rutas de documentación
  try {
    const docsResponse = await axios.get(`${gatewayURL}/api/docs`);
    console.log('✅ Documentación disponible');
  } catch (error) {
    console.error('❌ Error accediendo a documentación:', error.response?.status || error.message);
  }

  // Probar ruta no válida
  try {
    const invalidResponse = await axios.get(`${gatewayURL}/api/invalid`);
    console.log('❌ Ruta inválida no debería funcionar');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Ruta inválida correctamente rechazada');
    } else {
      console.error('❌ Error inesperado:', error.response?.status || error.message);
    }
  }
}

// Ejecutar pruebas
testGatewayIntegration()
  .then(() => testGatewayRoutes());
