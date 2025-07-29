require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testMailgunTemplate() {
  console.log('🧪 Testing Mailgun Template...\n');

  const testData = {
    customerEmail: 'test@example.com', // Change this to your email for testing
    customerName: 'John Doe',
    compositionTitle: 'Moonlight Sonata',
    orderId: 'ORD-12345',
    purchaseDate: new Date().toLocaleDateString(),
    price: 9.99,
    downloadLink: 'https://bdicksmusic.com/download/ORD-12345',
    supportEmail: 'support@bdicksmusic.com',
    customerEmail: 'test@example.com'
  };

  console.log('📧 Test Data:');
  console.log('   Customer:', testData.customerName);
  console.log('   Composition:', testData.compositionTitle);
  console.log('   Order ID:', testData.orderId);
  console.log('   Price:', `$${testData.price}`);
  console.log('   Email:', testData.customerEmail);

  try {
    console.log('\n📤 Sending test email...');
    const result = await emailService.sendPurchaseConfirmationWithMailgunTemplate(testData);
    
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', result.messageId);
    console.log('   Email:', result.email);
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Check your email inbox');
    console.log('   2. Verify the template looks correct');
    console.log('   3. Test the download link');
    console.log('   4. Check mobile responsiveness');
    
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check MAILGUN_API_KEY in .env file');
    console.log('   2. Verify MAILGUN_DOMAIN is correct');
    console.log('   3. Ensure template name matches Mailgun dashboard');
    console.log('   4. Check domain verification status');
  }
}

// Check configuration before testing
console.log('🔍 Configuration Check:');
console.log('   MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? 'SET' : 'NOT SET');
console.log('   MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN || 'NOT SET');
console.log('   MAILGUN_PURCHASE_TEMPLATE_NAME:', process.env.MAILGUN_PURCHASE_TEMPLATE_NAME || 'NOT SET');
console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');

if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  console.log('\n❌ Missing required configuration. Please check your .env file.');
  process.exit(1);
}

testMailgunTemplate(); 