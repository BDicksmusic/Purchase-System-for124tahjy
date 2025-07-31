const axios = require('axios');

async function testActualEndpoint() {
    console.log('🔍 Testing your actual webhook endpoint...\n');
    
    try {
        const response = await axios.get('https://purchase-system-for124tahjy-production.up.railway.app/api/webhook/stripe');
        console.log('✅ Your webhook endpoint is responding:');
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
        console.log('❌ Your webhook endpoint is not responding:');
        console.log(`   - Status: ${error.response?.status || 'No response'}`);
        console.log(`   - Error: ${error.message}`);
        console.log(`   - Data: ${JSON.stringify(error.response?.data, null, 2)}`);
    }
}

testActualEndpoint().catch(console.error); 