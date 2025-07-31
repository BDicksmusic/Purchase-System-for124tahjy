require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testAdminNotification() {
  console.log('🔍 Testing admin notification...\n');
  
  try {
    // Test with price field
    const purchaseData = {
      orderId: 'test-order-123',
      paymentIntentId: 'pi_test_123',
      customerEmail: 'bdicksmusic@gmail.com',
      customerName: 'Brandon Dicks',
      compositionId: 'test-composition-123',
      compositionTitle: 'Coming Home',
      amount: 9.99,
      price: 9.99, // Include price field
      status: 'completed',
      purchaseDate: new Date().toISOString()
    };
    
    console.log(`📋 Purchase data (missing price):`, JSON.stringify(purchaseData, null, 2));
    
    // Test admin notification
    console.log(`📧 Testing admin notification...`);
    const emailResult = await emailService.sendAdminNotification(purchaseData);
    
    console.log(`✅ Admin notification result:`, emailResult);
    
  } catch (error) {
    console.log('❌ Admin notification test failed:');
    console.log(`   - Error: ${error.message}`);
  }
}

testAdminNotification().catch(console.error); 