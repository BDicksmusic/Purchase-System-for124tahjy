require('dotenv').config();
const axios = require('axios');

async function sendTestEmailToGmail() {
  console.log('📧 Sending test email to bdicksmusic@gmail.com...\n');

  try {
    const formData = new URLSearchParams();
    formData.append('from', `${process.env.EMAIL_FROM_NAME || 'BDicks Music'} <${process.env.EMAIL_FROM}>`);
    formData.append('to', 'bdicksmusic@gmail.com');
    formData.append('subject', 'Mailgun Test Email - Your System is Ready!');
    formData.append('html', `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px;">
              <h1 style="color: #007bff;">🎉 Mailgun Test Successful!</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hello!</p>
              <p>This is a test email from your Mailgun configuration. If you receive this, your email system is working perfectly!</p>
              
              <h3>Test Details:</h3>
              <ul>
                <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
                <li><strong>Domain:</strong> ${process.env.MAILGUN_DOMAIN}</li>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Status:</strong> ✅ Ready for production</li>
              </ul>
              
              <p>Your Stripe purchasing system is now ready to send purchase confirmation emails to customers!</p>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="color: #28a745; margin-top: 0;">Next Steps:</h4>
                <ol>
                  <li>Start your main application</li>
                  <li>Test a purchase flow</li>
                  <li>Customers will receive professional confirmation emails</li>
                </ol>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; font-size: 12px;">
              <p>This email was sent via Mailgun from your BDicks Music system.</p>
            </div>
          </div>
        </body>
      </html>
    `);
    formData.append('text', `
Mailgun Test Successful!

Hello!

This is a test email from your Mailgun configuration. If you receive this, your email system is working perfectly!

Test Details:
- From: ${process.env.EMAIL_FROM}
- Domain: ${process.env.MAILGUN_DOMAIN}
- Time: ${new Date().toLocaleString()}
- Status: Ready for production

Your Stripe purchasing system is now ready to send purchase confirmation emails to customers!

Next Steps:
1. Start your main application
2. Test a purchase flow
3. Customers will receive professional confirmation emails

This email was sent via Mailgun from your BDicks Music system.
    `);

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
    console.log(`   - To: bdicksmusic@gmail.com`);
    console.log(`   - From: ${process.env.EMAIL_FROM}`);
    console.log('\n📬 Check your Gmail inbox for the test message.');
    console.log('   (Check spam folder if you don\'t see it in your inbox)');

  } catch (error) {
    console.log('❌ Test email sending failed:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

// Run the test
sendTestEmailToGmail().catch(console.error); 