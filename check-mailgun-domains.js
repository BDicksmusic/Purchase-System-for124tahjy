require('dotenv').config();
const axios = require('axios');

async function checkMailgunDomains() {
  console.log('🔍 Checking Mailgun domains...\n');

  try {
    // Get all domains
    const response = await axios.get(
      'https://api.mailgun.net/v3/domains',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
        }
      }
    );

    console.log('✅ Mailgun API connection successful!');
    console.log(`Found ${response.data.items.length} domain(s):\n`);

    response.data.items.forEach((domain, index) => {
      console.log(`${index + 1}. Domain: ${domain.name}`);
      console.log(`   - State: ${domain.state}`);
      console.log(`   - Type: ${domain.domain_type}`);
      console.log(`   - Created: ${domain.created_at}`);
      console.log(`   - Web scheme: ${domain.web_scheme}`);
      console.log(`   - Spam action: ${domain.spam_action}`);
      console.log('');
    });

    // Check if your configured domain exists
    const configuredDomain = response.data.items.find(d => d.name === process.env.MAILGUN_DOMAIN);
    
    if (configuredDomain) {
      console.log('✅ Your configured domain is found!');
      console.log(`   - Domain: ${configuredDomain.name}`);
      console.log(`   - State: ${configuredDomain.state}`);
      
      if (configuredDomain.state === 'active') {
        console.log('   - Status: Ready to send emails!');
      } else {
        console.log('   - Status: Domain not active yet');
        console.log('   - You may need to verify your domain in Mailgun dashboard');
      }
    } else {
      console.log('❌ Your configured domain is not found!');
      console.log(`   - Configured: ${process.env.MAILGUN_DOMAIN}`);
      console.log('   - Available domains are listed above');
      console.log('   - Please check your domain configuration');
    }

  } catch (error) {
    console.log('❌ Failed to get Mailgun domains:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
      
      if (error.response.status === 401) {
        console.log('   - This usually means your API key is incorrect');
      } else if (error.response.status === 403) {
        console.log('   - This usually means your API key lacks permissions');
      }
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

// Run the check
checkMailgunDomains().catch(console.error); 