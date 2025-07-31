const axios = require('axios');

class NotionOrdersService {
  constructor() {
    this.apiKey = process.env.NOTION_API_KEY;
    this.ordersDatabaseId = process.env.NOTION_ORDERS_DATABASE_ID;
    this.baseURL = 'https://api.notion.com/v1';
    
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
  }

  // Validate configuration
  validateConfig() {
    if (!this.apiKey) {
      throw new Error('NOTION_API_KEY is required');
    }
    if (!this.ordersDatabaseId) {
      throw new Error('NOTION_ORDERS_DATABASE_ID is required');
    }
    return true;
  }

  // Create a new order entry in Notion
  async createOrder(purchaseData) {
    try {
      this.validateConfig();
      
      console.log(`📝 Creating order entry in Notion for: ${purchaseData.orderId}`);
      
      const {
        orderId,
        paymentIntentId,
        customerEmail,
        customerName,
        compositionId,
        compositionTitle,
        amount,
        price,
        status,
        purchaseDate,
        slug
      } = purchaseData;

      // Prepare the order data for Notion
      const orderData = {
        parent: {
          database_id: this.ordersDatabaseId
        },
        properties: {
          // Order ID
          'Order ID': {
            title: [
              {
                text: {
                  content: orderId
                }
              }
            ]
          },
          // Customer Email
          'Customer Email': {
            email: customerEmail
          },
          // Customer Name
          'Customer Name': {
            rich_text: [
              {
                text: {
                  content: customerName || 'Unknown'
                }
              }
            ]
          },
          // Composition Title
          'Composition': {
            rich_text: [
              {
                text: {
                  content: compositionTitle || 'Unknown'
                }
              }
            ]
          },
          // Amount
          'Amount': {
            number: parseFloat(amount || price || 0)
          },
          // Status
          'Status': {
            select: {
              name: status || 'completed'
            }
          },
          // Purchase Date
          'Purchase Date': {
            date: {
              start: purchaseDate || new Date().toISOString()
            }
          },
          // Payment Intent ID
          'Payment Intent ID': {
            rich_text: [
              {
                text: {
                  content: paymentIntentId || 'N/A'
                }
              }
            ]
          },
          // Composition ID (for linking to compositions database)
          'Composition ID': {
            rich_text: [
              {
                text: {
                  content: compositionId || 'N/A'
                }
              }
            ]
          },
          // Slug (for reference)
          'Slug': {
            rich_text: [
              {
                text: {
                  content: slug || 'N/A'
                }
              }
            ]
          }
        }
      };

      // Create the order in Notion
      const response = await axios.post(
        `${this.baseURL}/pages`,
        orderData,
        { headers: this.headers }
      );

      console.log(`✅ Order logged to Notion: ${response.data.id}`);
      
      return {
        success: true,
        notionPageId: response.data.id,
        orderId: orderId
      };

    } catch (error) {
      console.error('Error creating order in Notion:', error);
      
      // Don't throw error to avoid breaking the purchase flow
      return {
        success: false,
        error: error.message,
        orderId: purchaseData.orderId
      };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      this.validateConfig();
      
      console.log(`📝 Updating order status in Notion: ${orderId} -> ${status}`);
      
      // First, find the order by Order ID
      const searchResponse = await axios.post(
        `${this.baseURL}/databases/${this.ordersDatabaseId}/query`,
        {
          filter: {
            property: 'Order ID',
            title: {
              equals: orderId
            }
          }
        },
        { headers: this.headers }
      );

      if (searchResponse.data.results.length === 0) {
        console.log(`⚠️ Order not found in Notion: ${orderId}`);
        return { success: false, error: 'Order not found' };
      }

      const pageId = searchResponse.data.results[0].id;

      // Update the status
      const updateResponse = await axios.patch(
        `${this.baseURL}/pages/${pageId}`,
        {
          properties: {
            'Status': {
              select: {
                name: status
              }
            }
          }
        },
        { headers: this.headers }
      );

      console.log(`✅ Order status updated in Notion: ${orderId} -> ${status}`);
      
      return {
        success: true,
        notionPageId: pageId,
        orderId: orderId
      };

    } catch (error) {
      console.error('Error updating order status in Notion:', error);
      return {
        success: false,
        error: error.message,
        orderId: orderId
      };
    }
  }

  // Get order by ID
  async getOrder(orderId) {
    try {
      this.validateConfig();
      
      const response = await axios.post(
        `${this.baseURL}/databases/${this.ordersDatabaseId}/query`,
        {
          filter: {
            property: 'Order ID',
            title: {
              equals: orderId
            }
          }
        },
        { headers: this.headers }
      );

      if (response.data.results.length === 0) {
        return null;
      }

      return this.parseOrderPage(response.data.results[0]);

    } catch (error) {
      console.error('Error getting order from Notion:', error);
      return null;
    }
  }

  // Parse Notion page data
  parseOrderPage(page) {
    const properties = page.properties;
    
    return {
      id: page.id,
      orderId: this.getPropertyValue(properties, 'Order ID', 'title'),
      customerEmail: this.getPropertyValue(properties, 'Customer Email', 'email'),
      customerName: this.getPropertyValue(properties, 'Customer Name', 'rich_text'),
      composition: this.getPropertyValue(properties, 'Composition', 'rich_text'),
      amount: this.getPropertyValue(properties, 'Amount', 'number'),
      status: this.getPropertyValue(properties, 'Status', 'select'),
      purchaseDate: this.getPropertyValue(properties, 'Purchase Date', 'date'),
      paymentIntentId: this.getPropertyValue(properties, 'Payment Intent ID', 'rich_text'),
      compositionId: this.getPropertyValue(properties, 'Composition ID', 'rich_text'),
      slug: this.getPropertyValue(properties, 'Slug', 'rich_text')
    };
  }

  // Helper method to extract property values
  getPropertyValue(properties, propertyName, propertyType) {
    const property = properties[propertyName];
    if (!property) return null;

    switch (propertyType) {
      case 'title':
        return property.title?.[0]?.text?.content || null;
      case 'rich_text':
        return property.rich_text?.[0]?.text?.content || null;
      case 'email':
        return property.email || null;
      case 'number':
        return property.number || null;
      case 'select':
        return property.select?.name || null;
      case 'date':
        return property.date?.start || null;
      default:
        return null;
    }
  }

  // Test the service
  async testConnection() {
    try {
      this.validateConfig();
      
      console.log('🔍 Testing Notion Orders service connection...');
      
      // Try to query the database
      const response = await axios.post(
        `${this.baseURL}/databases/${this.ordersDatabaseId}/query`,
        { page_size: 1 },
        { headers: this.headers }
      );

      console.log('✅ Notion Orders service connection successful');
      console.log(`📊 Database contains ${response.data.results.length} orders`);
      
      return true;

    } catch (error) {
      console.error('❌ Notion Orders service connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new NotionOrdersService(); 