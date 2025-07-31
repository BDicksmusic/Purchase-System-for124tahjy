const axios = require('axios');

async function testOrderConfirmationEndpoint() {
  console.log('🔍 Testing order confirmation endpoint...\n');
  
  const baseUrl = 'https://purchase-system-for124tahjy-production.up.railway.app';
  
  try {
    // Test with a sample session ID (you'll need to replace this with a real one)
    const sessionId = 'cs_test_123'; // Replace with a real session ID from your Stripe dashboard
    
    console.log(`📋 Testing with session ID: ${sessionId}`);
    
    const response = await axios.get(`${baseUrl}/api/webhooks/order-confirmation?session_id=${sessionId}`);
    
    console.log('✅ Order confirmation endpoint test successful:');
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Data: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    console.log('❌ Order confirmation endpoint test failed:');
    console.log(`   - Status: ${error.response?.status || 'No response'}`);
    console.log(`   - Error: ${error.message}`);
    
    if (error.response?.data) {
      console.log(`   - Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

async function testDownloadEndpoint() {
  console.log('\n🔍 Testing download endpoint...\n');
  
  const baseUrl = 'https://purchase-system-for124tahjy-production.up.railway.app';
  
  try {
    // Test with a sample composition ID
    const compositionId = 'test_composition_123'; // Replace with a real composition ID
    
    console.log(`📥 Testing download for composition ID: ${compositionId}`);
    
    const response = await axios.get(`${baseUrl}/api/webhooks/download/${compositionId}`, {
      responseType: 'arraybuffer' // For binary file download
    });
    
    console.log('✅ Download endpoint test successful:');
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Content-Type: ${response.headers['content-type']}`);
    console.log(`   - Content-Length: ${response.headers['content-length']} bytes`);
    
  } catch (error) {
    console.log('❌ Download endpoint test failed:');
    console.log(`   - Status: ${error.response?.status || 'No response'}`);
    console.log(`   - Error: ${error.message}`);
    
    if (error.response?.data) {
      console.log(`   - Data: ${error.response.data.toString()}`);
    }
  }
}

async function runTests() {
  console.log('🚀 Testing new API endpoints...\n');
  
  await testOrderConfirmationEndpoint();
  await testDownloadEndpoint();
  
  console.log('\n✨ Tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Replace the session ID with a real one from your Stripe dashboard');
  console.log('2. Replace the composition ID with a real one from your database');
  console.log('3. Update your external API configuration to point to this service');
}

runTests().catch(console.error); 