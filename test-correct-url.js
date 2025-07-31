require('dotenv').config();

function testCorrectURL() {
  console.log('🔍 Testing correct URL format...\n');
  
  // Simulate the purchase data
  const purchaseData = {
    pdfUrl: 'https://prod-files-secure.s3.us-west-2.amazonaws.com/...',
    slug: 'coming-home',
    compositionTitle: 'Coming Home'
  };
  
  // Test the URL construction logic with the correct URL
  const websiteUrl = 'https://purchase-system-for124tahjy-production.up.railway.app';
  const downloadLink = purchaseData.pdfUrl ? 
    `${websiteUrl}/api/notion/compositions/slug/${purchaseData.slug}/file` : 
    `${websiteUrl}/download/fallback`;
  
  console.log('📋 Correct Environment Variable:');
  console.log(`   WEBSITE_URL=https://purchase-system-for124tahjy-production.up.railway.app`);
  
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
  
  console.log('\n📝 Instructions:');
  console.log('   Update your .env file to use:');
  console.log('   WEBSITE_URL=https://purchase-system-for124tahjy-production.up.railway.app');
}

testCorrectURL(); 