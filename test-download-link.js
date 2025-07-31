require('dotenv').config();
const notionService = require('./src/services/notionService');

async function testDownloadLink() {
  console.log('🔍 Testing download link functionality...\n');
  
  try {
    // Test getting composition by slug
    console.log('📝 Testing composition lookup by slug...');
    const composition = await notionService.getCompositionBySlug('coming-home');
    
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
        } catch (error) {
          console.log('⚠️ PDF URL might not be accessible:', error.message);
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

testDownloadLink().catch(console.error); 