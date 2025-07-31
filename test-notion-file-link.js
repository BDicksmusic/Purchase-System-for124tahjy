require('dotenv').config();
const notionService = require('./src/services/notionService');

async function testNotionFileLink() {
  console.log('🔍 Testing Notion file link functionality...\n');
  
  try {
    // Test with a known slug
    const slug = 'coming-home';
    console.log(`📝 Testing composition lookup by slug: ${slug}`);
    
    const composition = await notionService.getCompositionBySlug(slug);
    
    if (composition) {
      console.log('✅ Found composition:', {
        id: composition.id,
        title: composition.title,
        slug: composition.slug,
        pdfUrl: composition.pdfUrl,
        price: composition.price
      });
      
      if (composition.pdfUrl) {
        console.log('✅ PDF URL found:', composition.pdfUrl);
        
        // Test if the URL is accessible
        const axios = require('axios');
        try {
          const response = await axios.head(composition.pdfUrl);
          console.log('✅ PDF URL is accessible (status:', response.status, ')');
          console.log('✅ Content-Type:', response.headers['content-type']);
        } catch (error) {
          console.log('⚠️ PDF URL might not be accessible:', error.message);
          console.log('   This is expected for Notion file URLs as they may require authentication');
        }
      } else {
        console.log('❌ No PDF URL found for this composition');
      }
    } else {
      console.log('❌ No composition found with slug "coming-home"');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testNotionFileLink().catch(console.error); 