const axios = require('axios');

const baseURL = 'http://localhost:3003';

async function testBasicRoutes() {
  try {
    console.log('🔍 Testing basic routes...\n');
    
    // 1. Health check
    console.log('1️⃣ Health check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health:', healthResponse.data);
    
    // 2. Get available endpoints
    console.log('\n2️⃣ Available endpoints...');
    const endpointsResponse = await axios.get(`${baseURL}/api/enrollment`);
    console.log('✅ Endpoints:', endpointsResponse.data);
    
  } catch (error) {
    console.error('❌ Error testing basic routes:', error.response?.data || error.message);
  }
}

testBasicRoutes();
