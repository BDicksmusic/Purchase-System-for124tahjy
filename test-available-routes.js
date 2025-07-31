const axios = require('axios');

async function testAvailableRoutes() {
    console.log('🔍 Testing available routes...\n');
    
    const routes = [
        '/api/stripe',
        '/api/email', 
        '/api/notion',
        '/api/webhooks',
        '/api/webhooks/stripe',
        '/webhook/stripe',
        '/api/admin'
    ];
    
    for (const route of routes) {
        try {
            const response = await axios.get(`https://purchase-system-for124tahjy-production.up.railway.app${route}`);
            console.log(`✅ ${route}: ${response.status}`);
        } catch (error) {
            console.log(`❌ ${route}: ${error.response?.status || 'No response'} - ${error.message}`);
        }
    }
}

testAvailableRoutes().catch(console.error); 