require('dotenv').config();
const axios = require('axios');

async function testFileAPI() {
  console.log('🔍 Testing file API endpoint...\n');
  
  try {
    const baseUrl = process.env.WEBSITE_URL || 'http://localhost:3000';
    const slug = 'coming-home';
    
    console.log(`📝 Testing file download for slug: ${slug}`);
    console.log(`🌐 API URL: ${baseUrl}/api/notion/compositions/slug/${slug}/file`);
    
    // Test the file download endpoint
    const response = await axios.get(`${baseUrl}/api/notion/compositions/slug/${slug}/file`, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    
    if (response.status === 200) {
      console.log('✅ File download successful!');
      console.log(`📊 File size: ${response.data.length} bytes`);
      console.log(`📋 Content-Type: ${response.headers['content-type']}`);
      console.log(`📋 Content-Disposition: ${response.headers['content-disposition']}`);
      
      // Check if it's actually a PDF
      const buffer = Buffer.from(response.data);
      const isPDF = buffer.slice(0, 4).toString('hex') === '25504446'; // PDF magic number
      
      if (isPDF) {
        console.log('✅ File is a valid PDF!');
      } else {
        console.log('⚠️ File might not be a PDF (checking first 4 bytes)');
      }
      
    } else {
      console.log(`❌ File download failed with status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log(`📋 Response status: ${error.response.status}`);
      console.log(`📋 Response data:`, error.response.data.toString());
    }
  }
}

testFileAPI().catch(console.error); 