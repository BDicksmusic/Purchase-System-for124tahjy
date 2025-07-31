require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testRealPurchaseEmail() {
    console.log('🎵 Testing real purchase email simulation...\n');
    
    // Simulate a real purchase with correct field names
    const purchaseData = {
        orderId: 'TEST-ORD-2025-001',
        customerEmail: 'bdicksmusic@gmail.com',
        customerName: 'Brandon Dicks',
        compositionTitle: 'Moonlight Sonata',
        compositionId: 'comp_test_001',
        price: 12.99, // Changed from 'amount' to 'price'
        purchaseDate: new Date().toISOString(),
        downloadUrl: 'https://bdicksmusic.com/download/TEST-ORD-2025-001'
    };

    try {
        console.log('📧 Sending real purchase confirmation email...');
        const result = await emailService.sendPurchaseConfirmation(purchaseData);
        
        console.log('✅ Real purchase email sent successfully!');
        console.log(`   - Message ID: ${result.messageId}`);
        console.log(`   - To: ${purchaseData.customerEmail}`);
        console.log(`   - Order ID: ${purchaseData.orderId}`);
        console.log(`   - Composition: ${purchaseData.compositionTitle}`);
        console.log(`   - Price: $${purchaseData.price}`);
        
        console.log('\n📬 Check your Gmail inbox for the confirmation email!');
        
    } catch (error) {
        console.error('❌ Failed to send real purchase email:', error.message);
    }
}

testRealPurchaseEmail().catch(console.error); 