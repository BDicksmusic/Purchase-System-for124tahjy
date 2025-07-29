require('dotenv').config();
const axios = require('axios');

async function checkMailgunStatus() {
  console.log('🔍 Checking Mailgun Domain Status...\n');
  
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  
  console.log('📧 Domain:', domain);
  console.log('🔑 API Key:', apiKey ? 'SET' : 'NOT SET');
  
  if (!apiKey) {
    console.log('❌ MAILGUN_API_KEY not configured');
    return;
  }
  
  try {
    // Check domain status via Mailgun API
    const response = await axios.get(
      `https://api.mailgun.net/v3/domains/${domain}`,
      {
        auth: {
          username: 'api',
          password: apiKey
        }
      }
    );
    
    const domainInfo = response.data;
    console.log('\n✅ Domain Status:');
    console.log('   Name:', domainInfo.domain.name);
    console.log('   State:', domainInfo.domain.state);
    console.log('   Created:', domainInfo.domain.created_at);
    console.log('   Sending:', domainInfo.domain.sending_dns_records ? '✅ Configured' : '❌ Not configured');
    console.log('   Receiving:', domainInfo.domain.receiving_dns_records ? '✅ Configured' : '❌ Not configured');
    
    if (domainInfo.domain.state === 'active') {
      console.log('\n🎉 Domain is verified and ready to send emails!');
    } else {
      console.log('\n⏳ Domain is still being verified. This can take 24-48 hours.');
      console.log('💡 You can use the sandbox domain for testing: sandbox01e9518970cd466595939988c9cd3a11.mailgun.org');
    }
    
  } catch (error) {
    console.log('\n❌ Error checking domain status:', error.response?.data?.message || error.message);
    console.log('\n💡 Try using the sandbox domain for immediate testing:');
    console.log('   MAILGUN_DOMAIN=sandbox01e9518970cd466595939988c9cd3a11.mailgun.org');
  }
}

checkMailgunStatus(); 