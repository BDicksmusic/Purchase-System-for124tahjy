const axios = require('axios');

async function testServiceHealth() {
    console.log('🔍 Testing Railway service health...\n');
    
    try {
        // Test the root endpoint
        const response = await axios.get('https://purchase-system-for124tahjy-production.up.railway.app/');
        console.log('✅ Service is responding:');
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
        console.log('❌ Service test:');
        console.log(`   - Status: ${error.response?.status || 'No response'}`);
        console.log(`   - Error: ${error.message}`);
        
        if (error.response?.data) {
            console.log(`   - Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
    
    console.log('\n🔍 Testing health endpoint...');
    try {
        const healthResponse = await axios.get('https://purchase-system-for124tahjy-production.up.railway.app/health');
        console.log('✅ Health endpoint is responding:');
        console.log(`   - Status: ${healthResponse.status}`);
        console.log(`   - Data: ${JSON.stringify(healthResponse.data, null, 2)}`);
    } catch (error) {
        console.log('❌ Health endpoint test:');
        console.log(`   - Status: ${error.response?.status || 'No response'}`);
        console.log(`   - Error: ${error.message}`);
    }
}

testServiceHealth().catch(console.error); 