require('dotenv').config();
const axios = require('axios');

console.log('🔍 Verifying Notion API Key...\n');

// Check if API key is loaded
if (!process.env.NOTION_API_KEY) {
  console.log('❌ NOTION_API_KEY is not set in .env file');
  process.exit(1);
}

console.log('📋 Current API Key Info:');
console.log('Length:', process.env.NOTION_API_KEY.length);
console.log('Starts with:', process.env.NOTION_API_KEY.substring(0, 10));
console.log('Ends with:', process.env.NOTION_API_KEY.substring(process.env.NOTION_API_KEY.length - 4));

// Test the API key
async function testApiKey() {
  try {
    console.log('\n🧪 Testing API key...');
    
    const response = await axios.get('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    console.log('✅ API key is valid!');
    console.log('👤 User info:', response.data.name || 'Unknown');
    console.log('🆔 User ID:', response.data.id);
    
    // Test database access
    if (process.env.NOTION_DATABASE_ID) {
      console.log('\n📊 Testing database access...');
      const dbResponse = await axios.get(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28'
        }
      });
      console.log('✅ Database access successful!');
      console.log('📋 Database title:', dbResponse.data.title[0]?.plain_text || 'Untitled');
    }
    
  } catch (error) {
    console.log('❌ API key test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 To fix this:');
      console.log('1. Go to https://www.notion.so/my-integrations');
      console.log('2. Find your integration (should be named something like "DropBox-Connection")');
      console.log('3. Click on it and copy the "Internal Integration Token"');
      console.log('4. Update your .env file with the new token');
      console.log('5. Make sure the integration has access to your database');
    }
  }
}

testApiKey(); 