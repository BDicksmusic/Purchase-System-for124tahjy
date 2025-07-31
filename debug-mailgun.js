require('dotenv').config();
const axios = require('axios');

async function debugMailgun() {
  console.log('🔍 Debugging Mailgun Configuration...\n');

  console.log('Environment Variables:');
  console.log(`MAILGUN_API_KEY: ${process.env.MAILGUN_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`MAILGUN_DOMAIN: ${process.env.MAILGUN_DOMAIN}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);

  // Test 1: List all domains (this worked before)
  try {
    console.log('Test 1: Listing all domains...');
    const domainsResponse = await axios.get(
      'https://api.mailgun.net/v3/domains',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
        }
      }
    );
    console.log('✅ Domains API works!');
    console.log(`Found ${domainsResponse.data.items.length} domains\n`);
  } catch (error) {
    console.log('❌ Domains API failed:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data?.message || error.message}\n`);
  }

  // Test 2: Get specific domain info
  try {
    console.log(`Test 2: Getting domain info for ${process.env.MAILGUN_DOMAIN}...`);
    const domainResponse = await axios.get(
      `https://api.mailgun.net/v3/domains/${process.env.MAILGUN_DOMAIN}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
        }
      }
    );
    console.log('✅ Domain info API works!');
    console.log(`Domain: ${domainResponse.data.domain.name}`);
    console.log(`State: ${domainResponse.data.domain.state}\n`);
  } catch (error) {
    console.log('❌ Domain info API failed:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data?.message || error.message}\n`);
  }

  // Test 3: Try sending a simple message
  try {
    console.log('Test 3: Sending a simple test message...');
    
    const formData = new URLSearchParams();
    formData.append('from', `${process.env.EMAIL_FROM_NAME || 'Test'} <${process.env.EMAIL_FROM}>`);
    formData.append('to', process.env.EMAIL_FROM);
    formData.append('subject', 'Debug Test Email');
    formData.append('text', 'This is a debug test email from Mailgun.');

    const messageResponse = await axios.post(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      formData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ Message sending works!');
    console.log(`Message ID: ${messageResponse.data.id}\n`);
  } catch (error) {
    console.log('❌ Message sending failed:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log('Full error response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
  }

  // Test 4: Check if we need to use a different domain format
  console.log('Test 4: Checking domain format...');
  const domainParts = process.env.MAILGUN_DOMAIN.split('.');
  if (domainParts.length > 2) {
    console.log(`Domain has ${domainParts.length} parts: ${domainParts.join('.')}`);
    console.log('This might be a subdomain. Let\'s try the base domain...');
    
    const baseDomain = domainParts.slice(-2).join('.');
    console.log(`Base domain would be: ${baseDomain}`);
    
    try {
      const baseDomainResponse = await axios.get(
        `https://api.mailgun.net/v3/domains/${baseDomain}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
          }
        }
      );
      console.log(`✅ Base domain ${baseDomain} exists!`);
      console.log(`State: ${baseDomainResponse.data.domain.state}\n`);
    } catch (error) {
      console.log(`❌ Base domain ${baseDomain} not found\n`);
    }
  }
}

debugMailgun().catch(console.error); 