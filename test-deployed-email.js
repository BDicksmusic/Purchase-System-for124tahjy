const axios = require('axios');

async function testDeployedEmail() {
    console.log('📧 Testing email service in deployed environment...\n');
    
    try {
        // Test the email endpoint
        const response = await axios.post('https://purchase-system-for124tahjy-production.up.railway.app/api/email/test', {
            to: 'bdicksmusic@gmail.com',
            subject: 'Test Email from Deployed Service',
            message: 'This is a test email from the deployed webhook handler.'
        });
        
        console.log('✅ Email test successful:');
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Data: ${JSON.stringify(response.data, null, 2)}`);
        
    } catch (error) {
        console.log('❌ Email test failed:');
        console.log(`   - Status: ${error.response?.status || 'No response'}`);
        console.log(`   - Error: ${error.message}`);
        
        if (error.response?.data) {
            console.log(`   - Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
}

testDeployedEmail().catch(console.error); 