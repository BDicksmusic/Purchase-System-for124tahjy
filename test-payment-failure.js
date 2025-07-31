require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testPaymentFailureEmail() {
  console.log('🧪 Testing Payment Failure Email System...\n');

  try {
    // Simulate a failed payment
    const failedPaymentData = {
      customerEmail: 'bdicksmusic@gmail.com',
      customerName: 'Test Customer',
      compositionTitle: 'Moonlight Sonata',
      orderId: 'FAILED-2025-001',
      failureReason: 'Your card was declined. Please check your payment method and try again.',
      price: 12.99,
      purchaseDate: new Date().toISOString()
    };

    console.log('📧 Sending payment failure notification...');
    console.log(`   - Customer: ${failedPaymentData.customerName}`);
    console.log(`   - Composition: ${failedPaymentData.compositionTitle}`);
    console.log(`   - Order ID: ${failedPaymentData.orderId}`);
    console.log(`   - Failure Reason: ${failedPaymentData.failureReason}\n`);

    const result = await emailService.sendPaymentFailureNotification(failedPaymentData);

    console.log('✅ Payment failure email sent successfully!');
    console.log(`   - Message ID: ${result.messageId}`);
    console.log(`   - To: ${failedPaymentData.customerEmail}`);
    console.log('\n📬 Check your Gmail inbox for the payment failure notification.');
    console.log('   This simulates what customers receive when their payment fails.');

  } catch (error) {
    console.log('❌ Payment failure email test failed:');
    console.log(`   - Error: ${error.message}`);
  }
}

// Run the test
testPaymentFailureEmail().catch(console.error); 