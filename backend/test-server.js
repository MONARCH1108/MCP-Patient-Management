// Simple test script to check if the server is running
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testServer() {
  console.log('Testing backend server connection...\n');

  try {
    // Test health endpoint
    console.log('1. Testing /api/health...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('   ✓ Health check:', healthData);
    console.log('');

    // Test patients endpoint
    console.log('2. Testing /api/patients...');
    const patientsResponse = await fetch(`${API_BASE_URL}/patients`);
    const patientsData = await patientsResponse.json();
    console.log('   ✓ Patients endpoint:', patientsData.success ? `Found ${patientsData.count} patients` : patientsData.error);
    console.log('');

    console.log('✅ Server is running and responding correctly!');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ ERROR: Cannot connect to server on http://localhost:3001');
      console.error('   Make sure the backend server is running:');
      console.error('   - Run: cd backend && npm run bridge');
      console.error('   - Or: npm run backend:bridge');
    } else {
      console.error('❌ ERROR:', error.message);
    }
    process.exit(1);
  }
}

testServer();

