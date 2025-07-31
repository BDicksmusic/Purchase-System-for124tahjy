require('dotenv').config();
const axios = require('axios');

class NotionOrdersSetup {
  constructor() {
    this.apiKey = process.env.NOTION_API_KEY;
    this.baseURL = 'https://api.notion.com/v1';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
  }

  async createOrdersDatabase() {
    console.log('🔧 Setting up Notion Orders Database...\n');

    try {
      const databaseProperties = {
        // Basic Order Information
        'Order ID': {
          type: 'title',
          title: {}
        },
        'Customer Name': {
          type: 'rich_text',
          rich_text: {}
        },
        'Customer Email': {
          type: 'email',
          email: {}
        },
        'Purchase Date': {
          type: 'date',
          date: {}
        },
        'Order Status': {
          type: 'select',
          select: {
            options: [
              { name: 'Pending', color: 'yellow' },
              { name: 'Completed', color: 'green' },
              { name: 'Failed', color: 'red' },
              { name: 'Refunded', color: 'gray' }
            ]
          }
        },

        // Product Information
        'Composition Title': {
          type: 'rich_text',
          rich_text: {}
        },
        'Composition ID': {
          type: 'rich_text',
          rich_text: {}
        },
        'Price': {
          type: 'number',
          number: {
            format: 'dollar'
          }
        },
        'Currency': {
          type: 'select',
          select: {
            options: [
              { name: 'USD', color: 'blue' },
              { name: 'EUR', color: 'green' },
              { name: 'GBP', color: 'purple' }
            ]
          }
        },

        // Payment Details
        'Stripe Payment ID': {
          type: 'rich_text',
          rich_text: {}
        },
        'Payment Method': {
          type: 'select',
          select: {
            options: [
              { name: 'Credit Card', color: 'blue' },
              { name: 'PayPal', color: 'orange' },
              { name: 'Apple Pay', color: 'gray' },
              { name: 'Google Pay', color: 'green' }
            ]
          }
        },
        'Payment Status': {
          type: 'select',
          select: {
            options: [
              { name: 'Succeeded', color: 'green' },
              { name: 'Failed', color: 'red' },
              { name: 'Pending', color: 'yellow' },
              { name: 'Refunded', color: 'gray' }
            ]
          }
        },

        // Email Tracking
        'Email Sent': {
          type: 'checkbox',
          checkbox: {}
        },
        'Email Sent Date': {
          type: 'date',
          date: {}
        },
        'Email Status': {
          type: 'select',
          select: {
            options: [
              { name: 'Sent', color: 'green' },
              { name: 'Failed', color: 'red' },
              { name: 'Pending', color: 'yellow' }
            ]
          }
        },

        // File Management
        'PDF Attached': {
          type: 'checkbox',
          checkbox: {}
        },
        'Download Link': {
          type: 'url',
          url: {}
        },
        'File Size (KB)': {
          type: 'number',
          number: {}
        },

        // Business Intelligence
        'Revenue Category': {
          type: 'select',
          select: {
            options: [
              { name: 'Sheet Music', color: 'blue' },
              { name: 'Courses', color: 'green' },
              { name: 'Subscriptions', color: 'purple' },
              { name: 'Other', color: 'gray' }
            ]
          }
        },
        'Customer Type': {
          type: 'select',
          select: {
            options: [
              { name: 'New', color: 'blue' },
              { name: 'Returning', color: 'green' },
              { name: 'VIP', color: 'purple' }
            ]
          }
        },
        'Source': {
          type: 'select',
          select: {
            options: [
              { name: 'Website', color: 'blue' },
              { name: 'Social Media', color: 'pink' },
              { name: 'Direct', color: 'green' },
              { name: 'Referral', color: 'orange' }
            ]
          }
        },

        // Follow-up
        'Follow-up Sent': {
          type: 'checkbox',
          checkbox: {}
        },
        'Customer Feedback': {
          type: 'rich_text',
          rich_text: {}
        },
        'Notes': {
          type: 'rich_text',
          rich_text: {}
        }
      };

      const response = await axios.post(
        `${this.baseURL}/databases`,
        {
          parent: {
            type: 'page_id',
            page_id: process.env.NOTION_DATABASE_ID.split('-').join('') // Convert to page ID format
          },
          title: [
            {
              type: 'text',
              text: {
                content: 'BDicks Music Orders'
              }
            }
          ],
          properties: databaseProperties,
          description: [
            {
              type: 'text',
              text: {
                content: 'Track all customer orders and purchases'
              }
            }
          ]
        },
        { headers: this.headers }
      );

      console.log('✅ Orders database created successfully!');
      console.log(`   - Database ID: ${response.data.id}`);
      console.log(`   - Name: ${response.data.title[0].plain_text}`);
      console.log(`   - Properties: ${Object.keys(databaseProperties).length} fields`);

      // Save the database ID to .env
      console.log('\n📝 Add this to your .env file:');
      console.log(`NOTION_ORDERS_DATABASE_ID=${response.data.id}`);

      return response.data;

    } catch (error) {
      console.log('❌ Failed to create orders database:');
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Error: ${error.response.data.message || 'Unknown error'}`);
      } else {
        console.log(`   - Error: ${error.message}`);
      }
      throw error;
    }
  }

  async testDatabaseConnection() {
    console.log('🔍 Testing Notion connection...\n');

    try {
      const response = await axios.get(
        `${this.baseURL}/databases/${process.env.NOTION_DATABASE_ID}`,
        { headers: this.headers }
      );

      console.log('✅ Notion connection successful!');
      console.log(`   - Database: ${response.data.title[0].plain_text}`);
      console.log(`   - ID: ${response.data.id}`);

      return true;
    } catch (error) {
      console.log('❌ Notion connection failed:');
      console.log(`   - Error: ${error.message}`);
      return false;
    }
  }
}

// Run the setup
async function main() {
  const setup = new NotionOrdersSetup();
  
  console.log('🎵 BDicks Music - Notion Orders Setup\n');
  
  // Test connection first
  const connected = await setup.testDatabaseConnection();
  if (!connected) {
    console.log('Please check your Notion API key and database ID.');
    return;
  }

  // Create orders database
  await setup.createOrdersDatabase();
  
  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Add NOTION_ORDERS_DATABASE_ID to your .env file');
  console.log('2. Update your purchase service to log orders');
  console.log('3. Test with a sample order');
}

main().catch(console.error); 