const axios = require('axios');

async function testOrderConfirmationAPI() {
    console.log('🔍 Testing Order Confirmation API...\n');
    
    // Test with a sample session ID (you'll need to replace this with a real one)
    const sessionId = 'cs_live_a13AOTMQzyU0hd4okOUxkCGdesSGsbx30K2o3FNAOFiU7YcbFh2JuGM66x';
    
    try {
        const response = await axios.get(`https://bdicksmusic.com/api/order-confirmation?session_id=${sessionId}`);
        console.log('✅ Order Confirmation API is working:');
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
        console.log('❌ Order Confirmation API is not working:');
        console.log(`   - Status: ${error.response?.status || 'No response'}`);
        console.log(`   - Error: ${error.message}`);
        console.log(`   - Data: ${JSON.stringify(error.response?.data, null, 2)}`);
    }
}

testOrderConfirmationAPI().catch(console.error); 