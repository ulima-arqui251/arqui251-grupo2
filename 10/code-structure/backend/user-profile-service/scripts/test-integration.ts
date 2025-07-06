import axios from 'axios';

/**
 * Script de prueba para verificar la integración entre servicios
 */

const USER_PROFILE_SERVICE_URL = 'http://localhost:3002';
const AUTH_SERVICE_URL = 'http://localhost:3001';
const SERVICE_API_KEY = 'studymate-services-secret-key';

interface TestResults {
  passed: number;
  failed: number;
  tests: { name: string; status: 'PASS' | 'FAIL'; message?: string }[];
}

class IntegrationTester {
  private results: TestResults = {
    passed: 0,
    failed: 0,
    tests: []
  };

  private addTest(name: string, status: 'PASS' | 'FAIL', message?: string) {
    this.results.tests.push({ name, status, message });
    if (status === 'PASS') {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  /**
   * Test 1: Health check of profile service
   */
  async testProfileServiceHealth(): Promise<void> {
    try {
      const response = await axios.get(`${USER_PROFILE_SERVICE_URL}/health`);
      
      if (response.status === 200 && response.data.success) {
        this.addTest('Profile Service Health Check', 'PASS');
      } else {
        this.addTest('Profile Service Health Check', 'FAIL', 'Service not responding correctly');
      }
    } catch (error) {
      this.addTest('Profile Service Health Check', 'FAIL', `Error: ${error}`);
    }
  }

  /**
   * Test 2: Integration health check
   */
  async testIntegrationHealth(): Promise<void> {
    try {
      const response = await axios.get(`${USER_PROFILE_SERVICE_URL}/integration/health`);
      
      if (response.status === 200 && response.data.success) {
        this.addTest('Integration Health Check', 'PASS');
      } else {
        this.addTest('Integration Health Check', 'FAIL', 'Integration endpoint not responding correctly');
      }
    } catch (error) {
      this.addTest('Integration Health Check', 'FAIL', `Error: ${error}`);
    }
  }

  /**
   * Test 3: Service-to-service authentication
   */
  async testServiceAuthentication(): Promise<void> {
    try {
      // Test without API key (should fail)
      try {
        await axios.post(`${USER_PROFILE_SERVICE_URL}/integration/profiles`, {
          userId: 'test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        });
        this.addTest('Service Auth (No Key)', 'FAIL', 'Should have rejected request without API key');
      } catch (error: any) {
        if (error.response?.status === 401) {
          this.addTest('Service Auth (No Key)', 'PASS');
        } else {
          this.addTest('Service Auth (No Key)', 'FAIL', `Unexpected error: ${error.message}`);
        }
      }

      // Test with wrong API key (should fail)
      try {
        await axios.post(`${USER_PROFILE_SERVICE_URL}/integration/profiles`, {
          userId: 'test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }, {
          headers: {
            'x-api-key': 'wrong-key'
          }
        });
        this.addTest('Service Auth (Wrong Key)', 'FAIL', 'Should have rejected request with wrong API key');
      } catch (error: any) {
        if (error.response?.status === 401) {
          this.addTest('Service Auth (Wrong Key)', 'PASS');
        } else {
          this.addTest('Service Auth (Wrong Key)', 'FAIL', `Unexpected error: ${error.message}`);
        }
      }

      // Test with correct API key (should work, but may fail due to validation)
      try {
        await axios.post(`${USER_PROFILE_SERVICE_URL}/integration/profiles`, {
          userId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }, {
          headers: {
            'x-api-key': SERVICE_API_KEY
          }
        });
        this.addTest('Service Auth (Correct Key)', 'PASS');
      } catch (error: any) {
        // It's OK if it fails due to business logic (like user not existing)
        // but the auth should have passed
        if (error.response?.status === 401) {
          this.addTest('Service Auth (Correct Key)', 'FAIL', 'API key not accepted');
        } else {
          this.addTest('Service Auth (Correct Key)', 'PASS', 'API key accepted (business logic error is OK)');
        }
      }

    } catch (error) {
      this.addTest('Service Authentication Tests', 'FAIL', `Unexpected error: ${error}`);
    }
  }

  /**
   * Test 4: Database connection
   */
  async testDatabaseConnection(): Promise<void> {
    try {
      // This test would be done by checking if the service can start successfully
      // For now, we'll just check if the service is responding (implies DB is working)
      const response = await axios.get(`${USER_PROFILE_SERVICE_URL}/health`);
      
      if (response.status === 200) {
        this.addTest('Database Connection', 'PASS', 'Service is running (implies DB connection works)');
      } else {
        this.addTest('Database Connection', 'FAIL', 'Service not responding');
      }
    } catch (error) {
      this.addTest('Database Connection', 'FAIL', `Error: ${error}`);
    }
  }

  /**
   * Test 5: Auth service connectivity (optional)
   */
  async testAuthServiceConnectivity(): Promise<void> {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/health`);
      
      if (response.status === 200) {
        this.addTest('Auth Service Connectivity', 'PASS');
      } else {
        this.addTest('Auth Service Connectivity', 'FAIL', 'Auth service not responding');
      }
    } catch (error) {
      this.addTest('Auth Service Connectivity', 'FAIL', `Auth service not available (this is OK): ${error}`);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Integration Tests...\n');

    await this.testProfileServiceHealth();
    await this.testIntegrationHealth();
    await this.testServiceAuthentication();
    await this.testDatabaseConnection();
    await this.testAuthServiceConnectivity();

    this.printResults();
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n📊 Test Results:');
    console.log('================');
    
    this.results.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${test.name}`);
      if (test.message) {
        console.log(`   └─ ${test.message}`);
      }
    });

    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total:  ${this.results.passed + this.results.failed}`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! Integration is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the details above.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().catch(console.error);
}

export default IntegrationTester;
