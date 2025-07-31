require('dotenv').config();

function testEmailURL() {
  console.log('🔍 Testing email URL construction...\n');
  
  // Simulate the purchase data
  const purchaseData = {
    pdfUrl: 'https://prod-files-secure.s3.us-west-2.amazonaws.com/...',
    slug: 'coming-home',
    compositionTitle: 'Coming Home'
  };
  
  // Test the URL construction logic
  const websiteUrl = process.env.WEBSITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const downloadLink = purchaseData.pdfUrl ? 
    `${websiteUrl}/api/notion/compositions/slug/${purchaseData.slug}/file` : 
    `${websiteUrl}/download/fallback`;
  
  console.log('📋 Environment Variables:');
  console.log(`   WEBSITE_URL: ${process.env.WEBSITE_URL || 'not set'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
  console.log(`   Using URL: ${websiteUrl}`);
  
  console.log('\n📧 Email Template Data:');
  console.log(`   Composition: ${purchaseData.compositionTitle}`);
  console.log(`   Slug: ${purchaseData.slug}`);
  console.log(`   PDF URL: ${purchaseData.pdfUrl ? 'present' : 'not present'}`);
  console.log(`   Download Link: ${downloadLink}`);
  
  console.log('\n🔗 Full Download URL:');
  console.log(`   ${downloadLink}`);
  
  // Test if the URL looks correct
  if (downloadLink.includes('/api/notion/compositions/slug/') && downloadLink.includes('/file')) {
    console.log('\n✅ URL construction looks correct!');
  } else {
    console.log('\n❌ URL construction might be incorrect');
  }
}

testEmailURL(); 