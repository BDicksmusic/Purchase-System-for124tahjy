require('dotenv').config();
const axios = require('axios');

async function testMailgunDirect() {
    console.log('📧 Testing Mailgun API directly...\n');
    
    try {
        const formData = new URLSearchParams();
        formData.append('from', `${process.env.EMAIL_FROM_NAME || 'BDicksmusic'} <${process.env.EMAIL_FROM}>`);
        formData.append('to', 'bdicksmusic@gmail.com');
        formData.append('subject', 'Test Purchase Confirmation - Moonlight Sonata');
        formData.append('html', `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">🎵 Thank You for Your Purchase!</h2>
                <p>Dear Brandon,</p>
                <p>Thank you for purchasing <strong>Moonlight Sonata</strong>!</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3>📋 Order Details</h3>
                    <p><strong>Order ID:</strong> TEST-ORD-2025-001</p>
                    <p><strong>Composition:</strong> Moonlight Sonata</p>
                    <p><strong>Price:</strong> $12.99</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <p>Your sheet music is ready for download. You'll receive a separate email with the download link.</p>
                <p>Best regards,<br>BDicks Music</p>
            </div>
        `);
        formData.append('text', `
            Thank You for Your Purchase!
            
            Dear Brandon,
            
            Thank you for purchasing Moonlight Sonata!
            
            Order Details:
            - Order ID: TEST-ORD-2025-001
            - Composition: Moonlight Sonata
            - Price: $12.99
            - Date: ${new Date().toLocaleDateString()}
            
            Your sheet music is ready for download. You'll receive a separate email with the download link.
            
            Best regards,
            BDicks Music
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

        console.log('✅ Mailgun API test successful!');
        console.log(`   - Message ID: ${response.data.id}`);
        console.log(`   - To: bdicksmusic@gmail.com`);
        console.log(`   - Subject: Test Purchase Confirmation`);
        console.log('\n📬 Check your Gmail inbox for the test email!');
        
    } catch (error) {
        console.error('❌ Mailgun API test failed:', error.message);
        if (error.response) {
            console.error('   - Status:', error.response.status);
            console.error('   - Data:', error.response.data);
        }
    }
}

testMailgunDirect().catch(console.error); 