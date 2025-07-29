require('dotenv').config();
const axios = require('axios');

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking Notion database structure...\n');
    
    const response = await axios.get(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    const database = response.data;
    console.log('📋 Database Title:', database.title[0]?.plain_text || 'Untitled');
    console.log('🆔 Database ID:', database.id);
    console.log('\n📊 Available Properties:');
    
    Object.keys(database.properties).forEach(propName => {
      const prop = database.properties[propName];
      console.log(`  • ${propName} (${prop.type})`);
    });
    
    console.log('\n💡 To fix the filtering issue:');
    console.log('1. Check if you have a "Status" property in your database');
    console.log('2. If not, either:');
    console.log('   - Add a "Status" property to your database, or');
    console.log('   - Update the code to use a different property for filtering');
    
  } catch (error) {
    console.log('❌ Error checking database structure:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
  }
}

checkDatabaseStructure(); 