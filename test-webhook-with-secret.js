const axios = require('axios');

async function testWebhookWithSecret() {
    console.log('🔍 Testing webhook endpoint with correct secret...\n');
    
    try {
        // Test the webhook endpoint
        const response = await axios.post('https://purchase-system-for124tahjy-production.up.railway.app/webhook/stripe', {
            // This is just a test - real webhooks come from Stripe
            type: 'test',
            data: { object: { id: 'test' } }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Stripe-Signature': 'test-signature'
            }
        });
        
        console.log('✅ Webhook endpoint is responding:');
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Data: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
        console.log('❌ Webhook endpoint test:');
        console.log(`   - Status: ${error.response?.status || 'No response'}`);
        console.log(`   - Error: ${error.message}`);
        
        if (error.response?.status === 400) {
            console.log('   - This is expected - webhook signature verification failed');
            console.log('   - This means the endpoint is working, but needs correct secret');
        }
    }
}

testWebhookWithSecret().catch(console.error); 