require('dotenv').config();
const axios = require('axios');

async function checkNotionAccess() {
  console.log('🔍 Checking Notion Integration Access...\n');
  
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  console.log('📝 Database ID:', databaseId);
  console.log('🔑 API Key:', apiKey ? 'SET' : 'NOT SET');
  
  if (!apiKey) {
    console.log('❌ NOTION_API_KEY not configured');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Check if we can access the specific database
    console.log('\n🔍 Testing database access...');
    try {
      const dbResponse = await axios.get(
        `https://api.notion.com/v1/databases/${databaseId}`,
        { headers }
      );
      console.log('✅ Database access successful!');
      console.log('   Name:', dbResponse.data.title?.[0]?.plain_text || 'Unknown');
      console.log('   Object ID:', dbResponse.data.id);
    } catch (error) {
      console.log('❌ Database access failed:', error.response?.data?.message || error.message);
    }

    // Test 2: List all accessible databases
    console.log('\n📋 Listing all accessible databases...');
    try {
      const searchResponse = await axios.post(
        'https://api.notion.com/v1/search',
        {
          filter: {
            property: 'object',
            value: 'database'
          }
        },
        { headers }
      );

      const databases = searchResponse.data.results;
      console.log(`✅ Found ${databases.length} accessible databases:`);
      
      databases.forEach((db, index) => {
        const name = db.title?.[0]?.plain_text || 'Untitled';
        console.log(`   ${index + 1}. ${name} (${db.id})`);
      });

      if (databases.length === 0) {
        console.log('⚠️ No databases found. Make sure your integration has access to databases.');
      }
    } catch (error) {
      console.log('❌ Error listing databases:', error.response?.data?.message || error.message);
    }

    // Test 3: Check integration permissions
    console.log('\n🔐 Checking integration permissions...');
    try {
      const userResponse = await axios.get(
        'https://api.notion.com/v1/users/me',
        { headers }
      );
      console.log('✅ Integration is valid');
      console.log('   Bot ID:', userResponse.data.id);
      console.log('   Name:', userResponse.data.name || 'Unnamed');
    } catch (error) {
      console.log('❌ Integration check failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }

  console.log('\n💡 If database access fails:');
  console.log('   1. Go to your Notion database');
  console.log('   2. Click "Share" in the top right');
  console.log('   3. Add your integration to the database');
  console.log('   4. Make sure the integration has "Read content" permission');
}

checkNotionAccess(); 