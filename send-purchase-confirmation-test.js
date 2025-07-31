require('dotenv').config();
const axios = require('axios');

async function sendPurchaseConfirmationTest() {
  console.log('🧾 Sending purchase confirmation test to bdicksmusic@gmail.com...\n');

  const customerEmail = 'bdicksmusic@gmail.com';
  const customerName = 'Brandon';
  const compositionTitle = 'Moonlight Sonata (Test Edition)';
  const orderId = `TEST-${Math.floor(Math.random() * 100000)}`;
  const purchaseDate = new Date().toLocaleDateString();
  const price = '$9.99';

  // Prepare template variables (even if template not used, nice to include)
  const templateVariables = {
    'customer_name': customerName,
    'composition_title': compositionTitle,
    'order_id': orderId,
    'purchase_date': purchaseDate,
    'price': price,
    'download_link': `${process.env.WEBSITE_URL || 'https://example.com'}/download/${orderId}`,
    'support_email': process.env.EMAIL_FROM
  };

  try {
    const formData = new URLSearchParams();
    formData.append('from', `${process.env.EMAIL_FROM_NAME || 'BDicks Music'} <${process.env.EMAIL_FROM}>`);
    formData.append('to', customerEmail);
    formData.append('subject', `Your Sheet Music: ${compositionTitle}`);

    // If MAILGUN_PURCHASE_TEMPLATE_NAME is set, use that template; otherwise build HTML manually
    if (process.env.MAILGUN_PURCHASE_TEMPLATE_NAME) {
      formData.append('template', process.env.MAILGUN_PURCHASE_TEMPLATE_NAME);
      Object.entries(templateVariables).forEach(([key, value]) => {
        formData.append(`v:${key}`, value);
      });
    } else {
      // Build a simple HTML confirmation
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Purchase Confirmation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f8f9fa; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
              .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You for Your Purchase!</h1>
              </div>
              <div class="content">
                <p>Dear ${customerName},</p>
                <p>Thank you for purchasing <strong>${compositionTitle}</strong>!</p>
                <p>Your order details:</p>
                <ul>
                  <li><strong>Order ID:</strong> ${orderId}</li>
                  <li><strong>Composition:</strong> ${compositionTitle}</li>
                  <li><strong>Price:</strong> ${price}</li>
                  <li><strong>Date:</strong> ${purchaseDate}</li>
                </ul>
                <p>You can download your sheet music using the link below:</p>
                <p><a class="button" href="${templateVariables.download_link}">Download Now</a></p>
              </div>
              <div class="footer">
                <p>If you have any questions, reply to this email or contact us at ${process.env.EMAIL_FROM}.</p>
                <p>Happy Playing!</p>
              </div>
            </div>
          </body>
        </html>
      `;
      formData.append('html', html);
      formData.append('text', `Thank you for purchasing ${compositionTitle}!\n\nOrder ID: ${orderId}\nPrice: ${price}\nDate: ${purchaseDate}\n\nDownload: ${templateVariables.download_link}`);
    }

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

    console.log('✅ Purchase confirmation test email sent!');
    console.log(`   - Message ID: ${response.data.id}`);
    console.log(`   - To: ${customerEmail}`);
  } catch (error) {
    console.log('❌ Failed to send purchase confirmation test:');
    if (error.response) {
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
    } else {
      console.log(`   - Error: ${error.message}`);
    }
  }
}

sendPurchaseConfirmationTest().catch(console.error);