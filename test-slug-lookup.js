require('dotenv').config();
const notionService = require('./src/services/notionService');

async function testSlugLookup() {
  console.log('🔍 Testing slug-based composition lookup...\n');
  
  try {
    // Test with a sample slug (replace with a real slug from your Notion database)
    const testSlug = 'test-composition-slug'; // Replace with a real slug
    
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
    } else {
      console.log('❌ No composition found with that slug');
      console.log('\n💡 Try with a real slug from your Notion database');
    }
    
  } catch (error) {
    console.log('❌ Slug lookup test failed:');
    console.log(`   - Error: ${error.message}`);
  }
}

async function testNotionConnection() {
  console.log('\n🔍 Testing Notion connection...\n');
  
  try {
    const compositions = await notionService.getCompositions();
    
    console.log(`✅ Notion connection successful`);
    console.log(`📊 Found ${compositions.length} compositions`);
    
    if (compositions.length > 0) {
      console.log('\n📋 Sample compositions:');
      compositions.slice(0, 3).forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.title} (Slug: ${comp.slug || 'No slug'})`);
      });
    }
    
  } catch (error) {
    console.log('❌ Notion connection test failed:');
    console.log(`   - Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing slug-based composition lookup...\n');
  
  await testNotionConnection();
  await testSlugLookup();
  
  console.log('\n✨ Tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Replace the test slug with a real slug from your Notion database');
  console.log('2. Make sure your Stripe checkout includes the slug in metadata');
  console.log('3. Test a real purchase to verify the webhook works');
}

runTests().catch(console.error); 