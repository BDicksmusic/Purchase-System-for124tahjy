require('dotenv').config();

function testCorrectURL() {
  console.log('🔍 Testing correct Railway URL...\n');
  
  const correctURL = 'https://purchase-system-for124tahjy-production.up.railway.app';
  const currentURL = process.env.WEBSITE_URL;
  
  console.log('📋 URL Comparison:');
  console.log(`   Correct URL: ${correctURL}`);
  console.log(`   Current URL: ${currentURL || 'not set'}`);
  
  if (currentURL === correctURL) {
    console.log('\n✅ URLs match! The correct URL is being used.');
  } else {
    console.log('\n❌ URLs do not match!');
    console.log('   You need to update the WEBSITE_URL in your Railway deployment.');
  }
  
  // Test the email URL construction with the correct URL
  const purchaseData = {
    pdfUrl: 'https://prod-files-secure.s3.us-west-2.amazonaws.com/...',
    slug: 'coming-home',
    compositionTitle: 'Coming Home'
  };
  
  const downloadLink = purchaseData.pdfUrl ? 
    `${correctURL}/api/notion/compositions/slug/${purchaseData.slug}/file` : 
    `${correctURL}/download/fallback`;
  
  console.log('\n📧 Email Download Link with Correct URL:');
  console.log(`   ${downloadLink}`);
  
  // Test if the URL looks correct
  if (downloadLink.includes('/api/notion/compositions/slug/') && downloadLink.includes('/file')) {
    console.log('\n✅ URL construction looks correct!');
  } else {
    console.log('\n❌ URL construction might be incorrect');
  }
}

testCorrectURL(); 