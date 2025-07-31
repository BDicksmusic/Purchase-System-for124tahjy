require('dotenv').config();
const axios = require('axios');

async function sendProfessionalTestEmail() {
  console.log('📧 Sending test email with professional configuration...\n');

  try {
    const formData = new URLSearchParams();
    formData.append('from', `${process.env.EMAIL_FROM_NAME || 'BDicks Music'} <${process.env.EMAIL_FROM}>`);
    formData.append('to', 'bdicksmusic@gmail.com');
    formData.append('subject', 'Professional Email Test - BDicks Music');
    formData.append('html', `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px;">
              <h1 style="color: #007bff;">🎵 Professional Email Test</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hello!</p>
              <p>This is a test email to verify the new professional email configuration.</p>
              
              <h3>Email Configuration:</h3>
              <ul>
                <li><strong>From Address:</strong> ${process.env.EMAIL_FROM}</li>
                <li><strong>Display Name:</strong> ${process.env.EMAIL_FROM_NAME}</li>
                <li><strong>Domain:</strong> ${process.env.MAILGUN_DOMAIN}</li>
                <li><strong>Status:</strong> ✅ Should appear as "BDicks Music" without "on behalf of"</li>
              </ul>
              
              <p>This email should now appear as coming directly from "BDicks Music" without any "on behalf of" text.</p>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="color: #28a745; margin-top: 0;">✅ Success!</h4>
                <p>If you see this email as coming from "BDicks Music" without "on behalf of", then the configuration is working perfectly!</p>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px;">
              <p>© 2025 BDicks Music. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    formData.append('text', `
Professional Email Test - BDicks Music

Hello!

This is a test email to verify the new professional email configuration.

Email Configuration:
- From Address: ${process.env.EMAIL_FROM}
- Display Name: ${process.env.EMAIL_FROM_NAME}
- Domain: ${process.env.MAILGUN_DOMAIN}
- Status: Should appear as "BDicks Music" without "on behalf of"

This email should now appear as coming directly from "BDicks Music" without any "on behalf of" text.

Success! If you see this email as coming from "BDicks Music" without "on behalf of", then the configuration is working perfectly!

© 2025 BDicks Music. All rights reserved.
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
    
    console.log('✅ Professional test email sent successfully!');
    console.log(`   - Message ID: ${response.data.id}`);
    console.log(`   - From: ${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`);
    console.log(`   - To: bdicksmusic@gmail.com`);
    console.log('\n📬 Check your Gmail inbox for the test email.');
    console.log('   This should now appear as "BDicks Music" without "on behalf of"!');

  } catch (error) {
    console.log('❌ Professional test email failed:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

// Run the test
sendProfessionalTestEmail().catch(console.error); 