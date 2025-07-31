require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testActualEmailURL() {
  console.log('🔍 Testing actual email URL construction...\n');
  
  // Simulate the purchase data that would be passed to the email service
  const purchaseData = {
    customerEmail: 'test@example.com',
    customerName: 'Test Customer',
    compositionTitle: 'Coming Home',
    orderId: 'test-order-123',
    purchaseDate: new Date().toISOString(),
    price: 9.99,
    pdfUrl: 'https://prod-files-secure.s3.us-west-2.amazonaws.com/...',
    slug: 'coming-home'
  };
  
  console.log('📋 Environment Variables:');
  console.log(`   WEBSITE_URL: ${process.env.WEBSITE_URL || 'not set'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
  
  // Test the template data construction (this is what happens in the email service)
  const templateData = {
    customerName: purchaseData.customerName || 'Valued Customer',
    compositionTitle: purchaseData.compositionTitle,
    orderId: purchaseData.orderId,
    purchaseDate: purchaseData.purchaseDate || new Date().toLocaleDateString(),
    price: `$${purchaseData.price.toFixed(2)}`,
    downloadLink: purchaseData.pdfUrl ? 
      `${process.env.WEBSITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/api/notion/compositions/slug/${purchaseData.slug}/file` : 
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/download/${purchaseData.orderId}`,
    supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM
  };
  
  console.log('\n📧 Email Template Data:');
  console.log(`   Composition: ${templateData.compositionTitle}`);
  console.log(`   Download Link: ${templateData.downloadLink}`);
  
  console.log('\n🔗 Full Download URL:');
  console.log(`   ${templateData.downloadLink}`);
  
  // Test if the URL looks correct
  if (templateData.downloadLink.includes('/api/notion/compositions/slug/') && templateData.downloadLink.includes('/file')) {
    console.log('\n✅ URL construction looks correct!');
  } else {
    console.log('\n❌ URL construction might be incorrect');
    console.log('   This could be because WEBSITE_URL is not set in your environment');
  }
  
  // Check if we're using the right base URL
  const baseUrl = process.env.WEBSITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  console.log(`\n🌐 Base URL being used: ${baseUrl}`);
  
  if (baseUrl === 'http://localhost:3000') {
    console.log('⚠️  Warning: Using localhost URL - this won\'t work in production!');
    console.log('   Set WEBSITE_URL in your Railway environment variables');
  }
}

testActualEmailURL().catch(console.error); 