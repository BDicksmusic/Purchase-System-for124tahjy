const axios = require('axios');

async function testWebhookEndpoint() {
  console.log('🔍 Testing webhook endpoint...\n');
  
  try {
    const response = await axios.get('https://purchase-system-for124tahjy-production.up.railway.app/webhook/stripe');
    console.log('✅ Webhook endpoint is responding:');
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Data: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ Webhook endpoint is not responding:');
    console.log(`   - Status: ${error.response?.status || 'No response'}`);
    console.log(`   - Error: ${error.message}`);
    console.log(`   - Data: ${JSON.stringify(error.response?.data, null, 2)}`);
  }
}

testWebhookEndpoint().catch(console.error); 