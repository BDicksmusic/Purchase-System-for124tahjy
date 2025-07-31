require('dotenv').config();
const axios = require('axios');

async function checkMailgunAddresses() {
  console.log('🔍 Checking Mailgun email addresses...\n');

  try {
    // Get all routes (which can show us email addresses)
    const routesResponse = await axios.get(
      'https://api.mailgun.net/v3/routes',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
        }
      }
    );

    console.log('✅ Mailgun routes found:');
    console.log(`Found ${routesResponse.data.items.length} route(s):\n`);

    routesResponse.data.items.forEach((route, index) => {
      console.log(`${index + 1}. Route: ${route.expression}`);
      console.log(`   - Description: ${route.description || 'No description'}`);
      console.log(`   - Actions: ${route.action.join(', ')}`);
      console.log('');
    });

    // Check domain info
    console.log('📧 Domain Information:');
    console.log(`   - Domain: ${process.env.MAILGUN_DOMAIN}`);
    console.log(`   - Current EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    console.log(`   - Current EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME}\n`);

    // Test different email formats
    console.log('💡 Professional Email Address Suggestions:');
    console.log('   - orders@bdicksmusic.com');
    console.log('   - sales@bdicksmusic.com');
    console.log('   - info@bdicksmusic.com');
    console.log('   - support@bdicksmusic.com');
    console.log('   - customerservice@bdicksmusic.com');
    console.log('   - hello@bdicksmusic.com');
    console.log('   - contact@bdicksmusic.com\n');

    console.log('🎯 Recommended Setup:');
    console.log('   - Use: orders@bdicksmusic.com');
    console.log('   - Display Name: "BDicks Music"');
    console.log('   - This removes "on behalf of" and looks professional');

  } catch (error) {
    console.log('❌ Failed to get Mailgun routes:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

checkMailgunAddresses().catch(console.error); 