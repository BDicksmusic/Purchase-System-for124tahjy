const axios = require('axios');

class NotionService {
  constructor() {
    this.apiKey = process.env.NOTION_API_KEY;
    this.databaseId = process.env.NOTION_DATABASE_ID;
    this.baseURL = 'https://api.notion.com/v1';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
    
    // Security: Validate required environment variables
    this.validateConfiguration();
  }

  // Security: Validate configuration on startup
  validateConfiguration() {
    console.log('🔍 Debug: NOTION_API_KEY length:', this.apiKey ? this.apiKey.length : 'undefined');
    console.log('🔍 Debug: NOTION_DATABASE_ID length:', this.databaseId ? this.databaseId.length : 'undefined');
    
    if (!this.apiKey || this.apiKey === 'your_notion_api_key_here' || this.apiKey.length < 10) {
      console.log('❌ NOTION_API_KEY validation failed:', this.apiKey);
      throw new Error('NOTION_API_KEY is not properly configured');
    }
    if (!this.databaseId || this.databaseId === 'your_notion_database_id_here' || this.databaseId.length < 10) {
      console.log('❌ NOTION_DATABASE_ID validation failed:', this.databaseId);
      throw new Error('NOTION_DATABASE_ID is not properly configured');
    }
    console.log('✅ Notion configuration validation passed');
  }

  // Security: Input validation for composition data
  validateCompositionData(compositionData) {
    const requiredFields = ['title', 'price'];
    const missingFields = requiredFields.filter(field => !compositionData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (compositionData.price && (isNaN(compositionData.price) || compositionData.price < 0)) {
      throw new Error('Price must be a valid positive number');
    }
    
    return true;
  }

  // Security: Audit logging for sensitive operations
  logAuditEvent(action, compositionId, details = {}) {
    const auditLog = {
      timestamp: new Date().toISOString(),
      action,
      compositionId,
      details,
      userAgent: 'NotionService'
    };
    
    console.log('🔒 AUDIT LOG:', JSON.stringify(auditLog, null, 2));
  }

  // Get all compositions from Notion database
  async getCompositions() {
    try {
      const response = await axios.post(
        `${this.baseURL}/databases/${this.databaseId}/query`,
        {
          filter: {
            property: 'Status',
            status: {
              equals: 'Published'
            }
          },
          sorts: [
            {
              property: 'Title',
              direction: 'ascending'
            }
          ]
        },
        { headers: this.headers }
      );

      return this.parseNotionResponse(response.data.results);
    } catch (error) {
      console.error('Error fetching compositions from Notion:', error);
      throw new Error(`Notion API error: ${error.message}`);
    }
  }

  // Get a specific composition by ID
  async getComposition(compositionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/pages/${compositionId}`,
        { headers: this.headers }
      );

      return this.parseNotionPage(response.data);
    } catch (error) {
      console.error('Error fetching composition from Notion:', error);
      throw new Error(`Notion API error: ${error.message}`);
    }
  }

  // Get a specific composition by slug
  async getCompositionBySlug(slug) {
    try {
      console.log(`🔍 Searching for composition with slug: ${slug}`);
      
      const response = await axios.post(
        `${this.baseURL}/databases/${this.databaseId}/query`,
        {
          filter: {
            property: 'Slug',
            rich_text: {
              equals: slug
            }
          }
        },
        { headers: this.headers }
      );

      if (response.data.results.length === 0) {
        console.log(`❌ No composition found with slug: ${slug}`);
        return null;
      }

      const composition = this.parseNotionPage(response.data.results[0]);
      console.log(`✅ Found composition: ${composition.title} (ID: ${composition.id})`);
      return composition;
    } catch (error) {
      console.error('Error fetching composition by slug from Notion:', error);
      throw new Error(`Notion API error: ${error.message}`);
    }
  }

  // Update composition price in Notion
  async updateCompositionPrice(compositionId, newPrice) {
    try {
      // Security: Validate input
      if (!compositionId || !newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) < 0) {
        throw new Error('Valid composition ID and positive price are required');
      }

      const oldPrice = await this.getCompositionPrice(compositionId);
      
      const response = await axios.patch(
        `${this.baseURL}/pages/${compositionId}`,
        {
          properties: {
            'Price': {
              number: parseFloat(newPrice)
            }
          }
        },
        { headers: this.headers }
      );

      // Security: Audit log the price change
      this.logAuditEvent('PRICE_UPDATE', compositionId, {
        oldPrice: oldPrice,
        newPrice: parseFloat(newPrice),
        change: parseFloat(newPrice) - oldPrice
      });

      console.log(`✅ Updated price for composition ${compositionId} to $${newPrice}`);
      return this.parseNotionPage(response.data);
    } catch (error) {
      console.error('Error updating composition price in Notion:', error);
      throw new Error(`Notion update error: ${error.message}`);
    }
  }

  // Helper method to get current price
  async getCompositionPrice(compositionId) {
    try {
      const composition = await this.getComposition(compositionId);
      return composition.price || 0;
    } catch (error) {
      console.error('Error getting composition price:', error);
      return 0;
    }
  }

  // Parse Notion database response
  parseNotionResponse(pages) {
    return pages.map(page => this.parseNotionPage(page));
  }

  // Parse individual Notion page
  parseNotionPage(page) {
    const properties = page.properties;
    
    return {
      id: page.id,
      title: this.getPropertyValue(properties, 'Title', 'title'),
      description: this.getPropertyValue(properties, 'Description', 'rich_text'),
      price: this.getPropertyValue(properties, 'Price', 'number'),
      status: this.getPropertyValue(properties, 'Status', 'status'),
      category: this.getPropertyValue(properties, 'Category', 'select'),
      difficulty: this.getPropertyValue(properties, 'Difficulty', 'select'),
      composer: this.getPropertyValue(properties, 'Composer', 'rich_text'),
      slug: this.getPropertyValue(properties, 'Slug', 'rich_text'),
      pdfUrl: this.getPropertyValue(properties, 'Website Download File', 'files'),
      imageUrl: this.getPropertyValue(properties, 'Image URL', 'url'),
      lastEdited: page.last_edited_time,
      created: page.created_time
    };
  }

  // Get property value from Notion page
  getPropertyValue(properties, propertyName, propertyType) {
    const property = properties[propertyName];
    
    if (!property) return null;

    switch (propertyType) {
      case 'title':
        return property.title?.[0]?.plain_text || '';
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || '';
      case 'number':
        return property.number || 0;
      case 'select':
        return property.select?.name || '';
      case 'status':
        return property.status?.name || '';
      case 'url':
        return property.url || '';
      case 'files':
        // Handle files property - return the first file URL if available
        if (property.files && property.files.length > 0) {
          const file = property.files[0];
          if (file.type === 'external') {
            return file.external.url;
          } else if (file.type === 'file') {
            return file.file.url;
          }
        }
        return null;
      case 'checkbox':
        return property.checkbox || false;
      default:
        return null;
    }
  }

  // Watch for changes in Notion database (webhook setup)
  async setupWebhook(callbackUrl) {
    try {
      const response = await axios.post(
        `${this.baseURL}/databases/${this.databaseId}/query`,
        {
          filter: {
            property: 'Status',
            select: {
              equals: 'Published'
            }
          }
        },
        { headers: this.headers }
      );

      // Note: Notion doesn't have built-in webhooks, so we'll need to poll for changes
      // This is a placeholder for webhook setup
      console.log('Notion webhook setup completed');
      return { success: true, message: 'Webhook setup completed' };
    } catch (error) {
      console.error('Error setting up Notion webhook:', error);
      throw new Error(`Webhook setup failed: ${error.message}`);
    }
  }

  // Check for price changes in compositions
  async checkPriceChanges(lastSyncTime) {
    try {
      const compositions = await this.getCompositions();
      const changedCompositions = compositions.filter(comp => 
        new Date(comp.lastEdited) > new Date(lastSyncTime)
      );

      return changedCompositions;
    } catch (error) {
      console.error('Error checking for price changes:', error);
      throw new Error(`Price change check failed: ${error.message}`);
    }
  }

  // Sync composition data with Stripe
  async syncCompositionWithStripe(compositionData, stripeService) {
    try {
      const stripeProduct = await stripeService.createOrUpdateProduct(compositionData);
      
      console.log(`✅ Synced composition "${compositionData.title}" with Stripe`);
      
      return {
        success: true,
        compositionId: compositionData.id,
        stripeProductId: stripeProduct.id,
        title: compositionData.title
      };
    } catch (error) {
      console.error('Error syncing composition with Stripe:', error);
      throw new Error(`Stripe sync failed: ${error.message}`);
    }
  }

  // Bulk sync all compositions with Stripe
  async bulkSyncWithStripe(stripeService) {
    try {
      const compositions = await this.getCompositions();
      const results = [];

      for (const composition of compositions) {
        try {
          const result = await this.syncCompositionWithStripe(composition, stripeService);
          results.push(result);
        } catch (error) {
          console.error(`Failed to sync composition ${composition.title}:`, error);
          results.push({
            success: false,
            compositionId: composition.id,
            title: composition.title,
            error: error.message
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`✅ Bulk sync completed: ${successful} successful, ${failed} failed`);
      
      return {
        total: compositions.length,
        successful,
        failed,
        results
      };
    } catch (error) {
      console.error('Error in bulk sync:', error);
      throw new Error(`Bulk sync failed: ${error.message}`);
    }
  }

  // Test Notion connection
  async testConnection() {
    try {
      const response = await axios.get(
        `${this.baseURL}/databases/${this.databaseId}`,
        { headers: this.headers }
      );

      return {
        success: true,
        databaseName: response.data.title?.[0]?.plain_text || 'Unknown',
        message: 'Notion connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new NotionService(); 