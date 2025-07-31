require('dotenv').config();
const notionService = require('./src/services/notionService');
const emailService = require('./src/services/emailService');

async function testWebhookProcessing() {
  console.log('🔍 Testing webhook processing simulation...\n');
  
  try {
    // Simulate the metadata from your webhook
    const metadata = {
      "Slug": "coming-home"
    };
    
    console.log(`📋 Testing with metadata:`, JSON.stringify(metadata, null, 2));
    
    // Extract slug (handle both cases)
    const slug = metadata.slug || metadata.Slug;
    
    if (slug) {
      console.log(`🔍 Looking up composition by slug: ${slug}`);
      const composition = await notionService.getCompositionBySlug(slug);
      
      if (composition) {
        console.log(`✅ Found composition: ${composition.title} (ID: ${composition.id})`);
        
        // Simulate purchase data
        const purchaseData = {
          orderId: 'test-order-123',
          paymentIntentId: 'pi_test_123',
          customerEmail: 'bdicksmusic@gmail.com',
          customerName: 'Brandon Dicks',
          compositionId: composition.id,
          compositionTitle: composition.title,
          amount: composition.price,
          status: 'completed',
          purchaseDate: new Date().toISOString()
        };
        
        console.log(`📋 Purchase data:`, JSON.stringify(purchaseData, null, 2));
        
        // Test email sending
        console.log(`📧 Testing email sending...`);
        const emailResult = await emailService.sendPurchaseConfirmation({
          ...purchaseData,
          pdfPath: composition.pdfUrl,
          price: purchaseData.amount
        });
        
        console.log(`✅ Email sent successfully!`);
        console.log(`📧 Email result:`, emailResult);
        
      } else {
        console.log(`❌ No composition found for slug: ${slug}`);
      }
    } else {
      console.log(`❌ No slug found in metadata`);
    }
    
  } catch (error) {
    console.log('❌ Webhook processing test failed:');
    console.log(`   - Error: ${error.message}`);
  }
}

testWebhookProcessing().catch(console.error); 