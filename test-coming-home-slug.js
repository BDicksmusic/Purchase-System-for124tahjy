require('dotenv').config();
const notionService = require('./src/services/notionService');

async function testComingHomeSlug() {
  console.log('🔍 Testing "coming-home" slug lookup...\n');
  
  try {
    const testSlug = 'coming-home';
    
    console.log(`📋 Testing with slug: ${testSlug}`);
    
    const composition = await notionService.getCompositionBySlug(testSlug);
    
    if (composition) {
      console.log('✅ Slug lookup successful:');
      console.log(`   - Title: ${composition.title}`);
      console.log(`   - ID: ${composition.id}`);
      console.log(`   - Price: $${composition.price}`);
      console.log(`   - Status: ${composition.status}`);
      console.log(`   - Slug: ${composition.slug}`);
      console.log(`   - PDF URL: ${composition.pdfUrl || 'Not available'}`);
      
      console.log('\n🎵 This composition should now work with your webhook!');
    } else {
      console.log('❌ No composition found with slug: coming-home');
      console.log('\n💡 Check your Notion database for:');
      console.log('   - A composition with slug "coming-home"');
      console.log('   - The "Slug" property is populated');
      console.log('   - The composition has "Published" status');
    }
    
  } catch (error) {
    console.log('❌ Slug lookup test failed:');
    console.log(`   - Error: ${error.message}`);
  }
}

testComingHomeSlug().catch(console.error); 