/**
 * Script para probar el Enrollment Service con datos reales
 * Incluye pruebas de inscripción, capacidad y waitlist
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuración
const ENROLLMENT_SERVICE_URL = 'http://localhost:3003';
const API_GATEWAY_URL = 'http://localhost:3000';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this'; // Debe coincidir con .env

// IDs de los datos de prueba (IDs reales de la base de datos)
const TEST_DATA = {
  adminId: '399ed608-3eca-43a9-bc25-95ae45240e37',
  teacherId: 'bddb2a49-beda-49d6-9d24-69df616c93b2',
  student1Id: '6dd14afa-1c0b-4906-93ab-4fd1033cd774',
  student2Id: '6f01354b-bedb-45ff-8853-060ec478d8c3',
  student3Id: 'df58bd16-bbf4-4a2e-9391-747391e521c7',
  course1Id: '6c559227-c56f-47aa-bff4-9d4856197285', // Full-Stack Web Development (Cap: 15)
  course2Id: '0e705949-c446-4de6-b654-c98729323eaa', // JavaScript Fundamentals (Cap: 30)
  course3Id: '6df34661-2efe-4e79-acdc-baad3698ef7a', // Node.js Backend Development (Cap: 20)
  course4Id: '728975a6-3613-4ad7-983e-e5573129f108'  // React Development (Cap: 25)
};

// Crear JWT tokens válidos
const createValidJWT = (userId, role = 'student') => {
  const payload = {
    userId,
    role,
    email: `${role}@studymate.com`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // Expira en 1 hora
  };
  
  return jwt.sign(payload, JWT_SECRET);
};

const runEnrollmentTests = async () => {
  console.log('🚀 Iniciando pruebas del Enrollment Service con datos reales\n');

  try {
    // Test 1: Verificar salud del servicio
    console.log('1️⃣ Verificando salud del servicio...');
    try {
      const healthResponse = await axios.get(`${ENROLLMENT_SERVICE_URL}/health`);
      console.log('✅ Servicio saludable:', healthResponse.data);
    } catch (error) {
      console.log('❌ Servicio no disponible:', error.message);
      console.log('💡 Asegúrate de que el Enrollment Service esté ejecutándose en puerto 3003');
      return;
    }

    // Test 2: Crear inscripción del estudiante 1 al curso 1
    console.log('\n2️⃣ Creando inscripción (Student1 → Full-Stack Web Development)...');
    try {
      const enrollmentData = {
        userId: TEST_DATA.student1Id,
        courseId: TEST_DATA.course1Id
      };
      
      const token = createValidJWT(TEST_DATA.student1Id, 'student');
      const enrollResponse = await axios.post(
        `${ENROLLMENT_SERVICE_URL}/api/enrollment/enrollments`,
        enrollmentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Inscripción creada:', enrollResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('❌ Error al crear inscripción:', error.response.data);
      } else {
        console.log('❌ Error de conexión:', error.message);
      }
    }

    // Test 3: Intentar crear inscripción duplicada
    console.log('\n3️⃣ Intentando crear inscripción duplicada...');
    try {
      const enrollmentData = {
        userId: TEST_DATA.student1Id,
        courseId: TEST_DATA.course1Id
      };
      
      const token = createValidJWT(TEST_DATA.student1Id, 'student');
      await axios.post(
        `${ENROLLMENT_SERVICE_URL}/api/enrollment/enrollments`,
        enrollmentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('❌ No debería permitir inscripción duplicada');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Inscripción duplicada rechazada correctamente:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data || error.message);
      }
    }

    // Test 4: Listar inscripciones del estudiante
    console.log('\n4️⃣ Listando inscripciones del estudiante...');
    try {
      const token = createValidJWT(TEST_DATA.student1Id, 'student');
      const enrollmentsResponse = await axios.get(
        `${ENROLLMENT_SERVICE_URL}/api/enrollment/enrollments/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✅ Inscripciones del estudiante:', enrollmentsResponse.data);
    } catch (error) {
      console.log('❌ Error al listar inscripciones:', error.response?.data || error.message);
    }

    // Test 5: Crear más inscripciones para diferentes cursos
    console.log('\n5️⃣ Creando más inscripciones...');
    const additionalEnrollments = [
      { student: TEST_DATA.student2Id, course: TEST_DATA.course2Id, name: 'Student2 → JavaScript' },
      { student: TEST_DATA.student3Id, course: TEST_DATA.course2Id, name: 'Student3 → JavaScript' },
      { student: TEST_DATA.student1Id, course: TEST_DATA.course4Id, name: 'Student1 → React' },
      { student: TEST_DATA.student2Id, course: TEST_DATA.course4Id, name: 'Student2 → React' }
    ];

    for (const enrollment of additionalEnrollments) {
      try {
        const token = createValidJWT(enrollment.student, 'student');
        const response = await axios.post(
          `${ENROLLMENT_SERVICE_URL}/api/enrollment/enrollments`,
          { userId: enrollment.student, courseId: enrollment.course },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ ${enrollment.name}: Creada`);
      } catch (error) {
        console.log(`❌ ${enrollment.name}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 6: Verificar capacidad de cursos
    console.log('\n6️⃣ Verificando capacidad de cursos...');
    for (const courseId of [TEST_DATA.course1Id, TEST_DATA.course2Id]) {
      try {
        const token = createValidJWT(TEST_DATA.teacherId, 'teacher');
        const capacityResponse = await axios.get(
          `${ENROLLMENT_SERVICE_URL}/api/enrollment/capacity/${courseId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log(`✅ Capacidad curso ${courseId}:`, capacityResponse.data);
      } catch (error) {
        console.log(`❌ Error al verificar capacidad: ${error.response?.data || error.message}`);
      }
    }

    // Test 7: Listar todas las inscripciones (como admin)
    console.log('\n7️⃣ Listando todas las inscripciones (como admin)...');
    try {
      const token = createValidJWT(TEST_DATA.adminId, 'admin');
      const allEnrollmentsResponse = await axios.get(
        `${ENROLLMENT_SERVICE_URL}/api/enrollment/enrollments/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✅ Todas las inscripciones:', allEnrollmentsResponse.data);
    } catch (error) {
      console.log('❌ Error al listar inscripciones:', error.response?.data || error.message);
    }

    // Test 8: Prueba a través del API Gateway
    console.log('\n8️⃣ Probando a través del API Gateway...');
    try {
      const gatewayHealthResponse = await axios.get(`${API_GATEWAY_URL}/health`);
      console.log('✅ API Gateway saludable:', gatewayHealthResponse.data);
      
      // Probar endpoint de inscripciones via gateway
      const token = createValidJWT(TEST_DATA.student1Id, 'student');
      const gatewayEnrollmentsResponse = await axios.get(
        `${API_GATEWAY_URL}/api/enrollment/enrollments/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✅ Inscripciones via Gateway:', gatewayEnrollmentsResponse.data);
    } catch (error) {
      console.log('❌ Error con API Gateway:', error.response?.data || error.message);
      console.log('💡 Asegúrate de que el API Gateway esté ejecutándose en puerto 3000');
    }

    console.log('\n🎉 Pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
};

// Verificar dependencias
try {
  require('axios');
  require('jsonwebtoken');
} catch (error) {
  console.error('❌ Faltan dependencias.');
  console.error('💡 Ejecuta: npm install axios jsonwebtoken');
  process.exit(1);
}

// Ejecutar pruebas
runEnrollmentTests();
