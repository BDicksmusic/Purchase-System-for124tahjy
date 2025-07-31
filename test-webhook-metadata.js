const axios = require('axios');

async function testWebhookMetadata() {
    console.log('🔍 Testing webhook metadata...\n');
    
    try {
        // Test the webhook endpoint with sample metadata
        const response = await axios.post('https://purchase-system-for124tahjy-production.up.railway.app/api/webhooks/stripe', {
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test_123',
                    metadata: {
                        compositionId: 'test_comp_123',
                        compositionTitle: 'Test Composition',
                        orderId: 'test_order_123'
                    },
                    customer_details: {
                        email: 'bdicksmusic@gmail.com',
                        name: 'Brandon Dicks'
                    },
                    amount_total: 1299,
                    payment_intent: 'pi_test_123'
                }
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Stripe-Signature': 'test-signature'
            }
        });
        
        console.log('✅ Webhook test successful:');
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Data: ${JSON.stringify(response.data, null, 2)}`);
        
    } catch (error) {
        console.log('❌ Webhook test failed:');
        console.log(`   - Status: ${error.response?.status || 'No response'}`);
        console.log(`   - Error: ${error.message}`);
        
        if (error.response?.data) {
            console.log(`   - Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
}

testWebhookMetadata().catch(console.error); 