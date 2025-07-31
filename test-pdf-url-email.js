require('dotenv').config();
const notionService = require('./src/services/notionService');
const emailService = require('./src/services/emailService');

async function testPdfUrlEmail() {
  console.log('🔍 Testing PDF URL in email template...\n');
  
  try {
    // Get the composition from Notion
    const composition = await notionService.getCompositionBySlug('coming-home');
    
    if (composition) {
      console.log(`✅ Found composition: ${composition.title}`);
      console.log(`📎 PDF URL: ${composition.pdfUrl ? composition.pdfUrl.substring(0, 100) + '...' : 'Not available'}`);
      
      // Simulate purchase data with PDF URL
      const purchaseData = {
        orderId: 'test-order-123',
        paymentIntentId: 'pi_test_123',
        customerEmail: 'bdicksmusic@gmail.com',
        customerName: 'Brandon Dicks',
        compositionId: composition.id,
        compositionTitle: composition.title,
        amount: composition.price,
        price: composition.price, // Add price field
        status: 'completed',
        purchaseDate: new Date().toISOString(),
        pdfUrl: composition.pdfUrl // Use the actual PDF URL from Notion
      };
      
      console.log(`📋 Purchase data with PDF URL:`, JSON.stringify(purchaseData, null, 2));
      
      // Test email sending with PDF URL
      console.log(`📧 Testing email sending with PDF URL...`);
      const emailResult = await emailService.sendPurchaseConfirmation(purchaseData);
      
      console.log(`✅ Email sent successfully!`);
      console.log(`📧 Email result:`, emailResult);
      
      // Check if the PDF URL was used in the template
      if (composition.pdfUrl) {
        console.log(`\n✅ PDF URL from Notion is being used in the email template!`);
        console.log(`📎 The download link in the email should point to: ${composition.pdfUrl.substring(0, 100)}...`);
      } else {
        console.log(`\n⚠️ No PDF URL found in Notion composition`);
      }
      
    } else {
      console.log('❌ No composition found with slug: coming-home');
    }
    
  } catch (error) {
    console.log('❌ PDF URL email test failed:');
    console.log(`   - Error: ${error.message}`);
  }
}

testPdfUrlEmail().catch(console.error); 