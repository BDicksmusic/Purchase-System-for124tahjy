require('dotenv').config();
const axios = require('axios');

async function sendTestOrderConfirmation() {
  console.log('📧 Sending test order confirmation email...\n');

  try {
    const formData = new URLSearchParams();
    formData.append('from', `${process.env.EMAIL_FROM_NAME || 'BDicks Music'} <${process.env.EMAIL_FROM}>`);
    formData.append('to', 'bdicksmusic@gmail.com');
    formData.append('subject', 'Thank you for your purchase - "Moonlight Sonata" Sheet Music');
    formData.append('html', `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎵 BDicks Music</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase!</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin-top: 0;">Order Confirmation</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #007bff;">Order Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
                    <td style="padding: 8px 0;">TEST-2025-001</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Purchase Date:</td>
                    <td style="padding: 8px 0;">${new Date().toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Composition:</td>
                    <td style="padding: 8px 0;">Moonlight Sonata - Piano Sheet Music</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Price:</td>
                    <td style="padding: 8px 0;">$12.99</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #28a745;">📎 Your Sheet Music is Attached</h3>
                <p>Your high-quality PDF sheet music for "Moonlight Sonata" is attached to this email. The file includes:</p>
                <ul>
                  <li>Complete piano score</li>
                  <li>Performance notes and fingering suggestions</li>
                  <li>Historical context and composer information</li>
                  <li>Print-ready format (A4/US Letter compatible)</li>
                </ul>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #856404;">💡 Practice Tips</h3>
                <p><strong>For Moonlight Sonata:</strong></p>
                <ul>
                  <li>Start with the first movement (Adagio sostenuto)</li>
                  <li>Focus on the gentle, flowing melody</li>
                  <li>Practice the left-hand arpeggios slowly</li>
                  <li>Pay attention to the dynamic markings</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://bdicksmusic.com" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Our Website</a>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="font-size: 14px; color: #666;">
                  <strong>Need help?</strong> Reply to this email or contact us at ${process.env.EMAIL_FROM}
                </p>
                <p style="font-size: 12px; color: #999;">
                  This is a test email from your BDicks Music purchasing system. 
                  In production, customers will receive this after completing a purchase.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>© 2025 BDicks Music. All rights reserved.</p>
              <p>Thank you for supporting independent music education!</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    formData.append('text', `
BDicks Music - Order Confirmation

Thank you for your purchase!

ORDER DETAILS:
- Order ID: TEST-2025-001
- Purchase Date: ${new Date().toLocaleDateString()}
- Composition: Moonlight Sonata - Piano Sheet Music
- Price: $12.99

YOUR SHEET MUSIC IS ATTACHED:
Your high-quality PDF sheet music for "Moonlight Sonata" is attached to this email. The file includes:
- Complete piano score
- Performance notes and fingering suggestions
- Historical context and composer information
- Print-ready format (A4/US Letter compatible)

PRACTICE TIPS FOR MOONLIGHT SONATA:
- Start with the first movement (Adagio sostenuto)
- Focus on the gentle, flowing melody
- Practice the left-hand arpeggios slowly
- Pay attention to the dynamic markings

Need help? Reply to this email or contact us at ${process.env.EMAIL_FROM}

Visit our website: https://bdicksmusic.com

© 2025 BDicks Music. All rights reserved.
Thank you for supporting independent music education!

---
This is a test email from your BDicks Music purchasing system.
In production, customers will receive this after completing a purchase.
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
    
    console.log('✅ Test order confirmation sent successfully!');
    console.log(`   - Message ID: ${response.data.id}`);
    console.log(`   - To: bdicksmusic@gmail.com`);
    console.log(`   - Subject: Thank you for your purchase - "Moonlight Sonata" Sheet Music`);
    console.log('\n📬 Check your Gmail inbox for the test order confirmation.');
    console.log('   This simulates what your customers will receive after making a purchase!');

  } catch (error) {
    console.log('❌ Test order confirmation failed:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

// Run the test
sendTestOrderConfirmation().catch(console.error); 