require('dotenv').config();
const axios = require('axios');

async function testMailgunConfig() {
  console.log('🔍 Testing Mailgun Configuration...\n');

  // Check environment variables
  const requiredVars = ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'EMAIL_FROM'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease add these to your .env file and try again.');
    return;
  }

  console.log('✅ Environment variables found:');
  console.log(`   - MAILGUN_API_KEY: ${process.env.MAILGUN_API_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`   - MAILGUN_DOMAIN: ${process.env.MAILGUN_DOMAIN}`);
  console.log(`   - EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  console.log(`   - EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || 'Not set'}`);
  console.log(`   - MAILGUN_PURCHASE_TEMPLATE_NAME: ${process.env.MAILGUN_PURCHASE_TEMPLATE_NAME || 'Not set'}\n`);

  // Test Mailgun API connection
  try {
    console.log('🔗 Testing Mailgun API connection...');
    
    const response = await axios.get(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`
        }
      }
    );

    console.log('✅ Mailgun API connection successful!');
    console.log(`   - Domain: ${response.data.domain.name}`);
    console.log(`   - Status: ${response.data.domain.state}`);
    console.log(`   - Created: ${response.data.domain.created_at}\n`);

  } catch (error) {
    console.log('❌ Mailgun API connection failed:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
    console.log('\nPlease check your API key and domain configuration.');
    return;
  }

  // Test sending a simple email
  try {
    console.log('📧 Testing email sending...');
    
    const testEmailData = {
      from: `${process.env.EMAIL_FROM_NAME || 'Test'} <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM, // Send to yourself for testing
      subject: 'Mailgun Test Email',
      text: 'This is a test email from your Mailgun configuration. If you receive this, your setup is working correctly!',
      html: `
        <html>
          <body>
            <h2>Mailgun Test Email</h2>
            <p>This is a test email from your Mailgun configuration.</p>
            <p>If you receive this, your setup is working correctly!</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Domain: ${process.env.MAILGUN_DOMAIN}</li>
              <li>From: ${process.env.EMAIL_FROM}</li>
              <li>Time: ${new Date().toISOString()}</li>
            </ul>
          </body>
        </html>
      `
    };

    const formData = new URLSearchParams();
    Object.entries(testEmailData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await axios.post(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      formData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Test email sent successfully!');
    console.log(`   - Message ID: ${response.data.id}`);
    console.log(`   - To: ${testEmailData.to}`);
    console.log('\n📬 Check your email inbox for the test message.\n');

  } catch (error) {
    console.log('❌ Test email sending failed:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
    console.log('\nPlease check your email configuration.');
  }

  // Test template if configured
  if (process.env.MAILGUN_PURCHASE_TEMPLATE_NAME) {
    try {
      console.log('📋 Testing template configuration...');
      
      const templateData = {
        from: `${process.env.EMAIL_FROM_NAME || 'Test'} <${process.env.EMAIL_FROM}>`,
        to: process.env.EMAIL_FROM,
        subject: 'Template Test Email',
        template: process.env.MAILGUN_PURCHASE_TEMPLATE_NAME,
        'v:customer_name': 'Test Customer',
        'v:composition_title': 'Test Composition',
        'v:order_id': 'TEST-123',
        'v:purchase_date': new Date().toLocaleDateString(),
        'v:price': '$9.99',
        'v:download_link': 'https://example.com/download/TEST-123',
        'v:support_email': process.env.EMAIL_FROM
      };

      const formData = new URLSearchParams();
      Object.entries(templateData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post(
        `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
        formData,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('✅ Template test email sent successfully!');
      console.log(`   - Template: ${process.env.MAILGUN_PURCHASE_TEMPLATE_NAME}`);
      console.log(`   - Message ID: ${response.data.id}\n`);

    } catch (error) {
      console.log('❌ Template test failed:');
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
      } else {
        console.log(`   - Error: ${error.message}`);
      }
      console.log('\nPlease check your template configuration.');
    }
  } else {
    console.log('ℹ️  No template configured. Skipping template test.');
    console.log('   To test templates, set MAILGUN_PURCHASE_TEMPLATE_NAME in your .env file.\n');
  }

  console.log('🎉 Mailgun configuration test completed!');
  console.log('\nNext steps:');
  console.log('1. Check your email inbox for test messages');
  console.log('2. If tests pass, your system is ready for production');
  console.log('3. You can now run your main application');
}

// Run the test
testMailgunConfig().catch(console.error); 