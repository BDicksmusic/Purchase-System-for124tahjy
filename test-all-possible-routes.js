const axios = require('axios');

async function testAllPossibleRoutes() {
    console.log('🔍 Testing all possible webhook routes...\n');
    
    const routes = [
        '/api/webhook/stripe',
        '/api/webhooks/stripe', 
        '/webhook/stripe',
        '/webhooks/stripe',
        '/stripe/webhook',
        '/stripe/webhooks',
        '/api/stripe/webhook',
        '/api/stripe/webhooks'
    ];
    
    for (const route of routes) {
        try {
            const response = await axios.get(`https://purchase-system-for124tahjy-production.up.railway.app${route}`);
            console.log(`✅ ${route}: ${response.status}`);
        } catch (error) {
            console.log(`❌ ${route}: ${error.response?.status || 'No response'}`);
        }
    }
    
    console.log('\n🔍 Testing POST requests (webhooks are usually POST)...');
    for (const route of routes) {
        try {
            const response = await axios.post(`https://purchase-system-for124tahjy-production.up.railway.app${route}`, {
                test: 'data'
            });
            console.log(`✅ POST ${route}: ${response.status}`);
        } catch (error) {
            console.log(`❌ POST ${route}: ${error.response?.status || 'No response'}`);
        }
    }
}

testAllPossibleRoutes().catch(console.error); 