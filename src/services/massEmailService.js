const emailService = require('./emailService');
const notionService = require('./notionService');
const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');

class MassEmailService {
  constructor() {
    this.batchSize = 50; // Send in batches to avoid overload
    this.delayBetweenBatches = 2000; // 2 seconds between batches
  }

  // Fetch email template from Notion
  async getEmailTemplateFromNotion(templateId) {
    try {
      // Get the Notion page data
      const response = await notionService.notion.pages.retrieve({
        page_id: templateId
      });

      // Extract template data from Notion page properties
      const templateData = {
        // Basic template info
        templateFile: this.extractProperty(response, 'Template_File') || 'promotional-template.html',
        subject: this.extractProperty(response, 'Subject'),
        fromName: this.extractProperty(response, 'From_Name'),
        replyTo: this.extractProperty(response, 'Reply_To'),
        
        // Content fields that will be inserted into the template
        header_title: this.extractProperty(response, 'Header_Title'),
        main_message: this.extractProperty(response, 'Main_Message'),
        highlight_title: this.extractProperty(response, 'Highlight_Title'),
        highlight_content: this.extractProperty(response, 'Highlight_Content'),
        
        // Pricing fields
        show_pricing: this.extractProperty(response, 'Show_Pricing') || false,
        price: this.extractProperty(response, 'Price'),
        original_price: this.extractProperty(response, 'Original_Price'),
        sale_price: this.extractProperty(response, 'Sale_Price'),
        discount_percentage: this.extractProperty(response, 'Discount_Percentage'),
        
        // Call to action
        cta_text: this.extractProperty(response, 'CTA_Text'),
        cta_link: this.extractProperty(response, 'CTA_Link'),
        
        // Additional content
        additional_content: this.extractProperty(response, 'Additional_Content'),
        expiry_date: this.extractProperty(response, 'Expiry_Date'),
        
        // Footer links
        website_url: this.extractProperty(response, 'Website_URL'),
        unsubscribe_link: this.extractProperty(response, 'Unsubscribe_Link'),
        preferences_link: this.extractProperty(response, 'Preferences_Link')
      };

      // Load the HTML template file and compile it
      const templatePath = path.join(__dirname, '../templates/emails', templateData.templateFile);
      
      if (await fs.pathExists(templatePath)) {
        const templateContent = await fs.readFile(templatePath, 'utf8');
        templateData.htmlContent = templateContent;
        
        // Generate text version from the template data
        templateData.textContent = this.generateTextVersion(templateData);
      } else {
        throw new Error(`Template file not found: ${templateData.templateFile}`);
      }

      return templateData;
    } catch (error) {
      console.error('Error fetching template from Notion:', error);
      throw error;
    }
  }

  // Generate a text version of the email from template data
  generateTextVersion(templateData) {
    let text = '';
    
    if (templateData.header_title) {
      text += `${templateData.header_title}\n`;
      text += '='.repeat(templateData.header_title.length) + '\n\n';
    }
    
    text += `Hello {{name}}!\n\n`;
    
    if (templateData.main_message) {
      text += `${templateData.main_message}\n\n`;
    }
    
    if (templateData.highlight_title && templateData.highlight_content) {
      text += `${templateData.highlight_title}\n`;
      text += `${templateData.highlight_content}\n\n`;
    }
    
    if (templateData.show_pricing) {
      if (templateData.discount_percentage) {
        text += `Special Offer: ${templateData.discount_percentage}% OFF!\n`;
      }
      
      if (templateData.original_price && templateData.sale_price) {
        text += `Was: $${templateData.original_price} | Now: $${templateData.sale_price}\n\n`;
      } else if (templateData.price) {
        text += `Price: $${templateData.price}\n\n`;
      }
    }
    
    if (templateData.cta_text && templateData.cta_link) {
      text += `${templateData.cta_text}: ${templateData.cta_link}\n\n`;
    }
    
    if (templateData.additional_content) {
      text += `${templateData.additional_content}\n\n`;
    }
    
    if (templateData.expiry_date) {
      text += `⏰ Limited Time: This offer expires on ${templateData.expiry_date}\n\n`;
    }
    
    text += `Best regards,\n${templateData.fromName || '{{from_name}}'}\n\n`;
    
    if (templateData.website_url) {
      text += `Visit our website: ${templateData.website_url}\n`;
    }
    
    if (templateData.unsubscribe_link) {
      text += `Unsubscribe: ${templateData.unsubscribe_link}\n`;
    }
    
    return text;
  }

  // Convert Notion blocks to HTML email template
  async convertNotionBlocksToHTML(pageId) {
    try {
      const blocks = await notionService.notion.blocks.children.list({
        block_id: pageId,
        page_size: 100
      });

      let html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      `;

      for (const block of blocks.results) {
        html += this.blockToHTML(block);
      }

      html += '</div>';
      return html;
    } catch (error) {
      console.error('Error converting Notion blocks to HTML:', error);
      return '';
    }
  }

  // Convert individual Notion block to HTML
  blockToHTML(block) {
    let html = '';
    
    switch (block.type) {
      case 'heading_1':
        html = `<h1 style="color: #2c3e50; margin: 20px 0 10px 0; font-size: 28px;">${this.richTextToHTML(block.heading_1.rich_text)}</h1>`;
        break;
        
      case 'heading_2':
        html = `<h2 style="color: #34495e; margin: 18px 0 8px 0; font-size: 24px;">${this.richTextToHTML(block.heading_2.rich_text)}</h2>`;
        break;
        
      case 'heading_3':
        html = `<h3 style="color: #34495e; margin: 16px 0 6px 0; font-size: 20px;">${this.richTextToHTML(block.heading_3.rich_text)}</h3>`;
        break;
        
      case 'paragraph':
        html = `<p style="margin: 10px 0; line-height: 1.6; color: #333;">${this.richTextToHTML(block.paragraph.rich_text)}</p>`;
        break;
        
      case 'bulleted_list_item':
        html = `<li style="margin: 5px 0; color: #555;">${this.richTextToHTML(block.bulleted_list_item.rich_text)}</li>`;
        break;
        
      case 'numbered_list_item':
        html = `<li style="margin: 5px 0; color: #555;">${this.richTextToHTML(block.numbered_list_item.rich_text)}</li>`;
        break;
        
      case 'quote':
        html = `<blockquote style="border-left: 4px solid #3498db; padding-left: 15px; margin: 15px 0; color: #666; font-style: italic;">${this.richTextToHTML(block.quote.rich_text)}</blockquote>`;
        break;
        
      case 'callout':
        const icon = block.callout.icon?.emoji || '📌';
        const bgColor = block.callout.color?.includes('background') ? '#f0f4f8' : 'transparent';
        html = `
          <div style="background: ${bgColor}; border-radius: 5px; padding: 15px; margin: 15px 0; display: flex; align-items: start;">
            <span style="font-size: 24px; margin-right: 10px;">${icon}</span>
            <div style="flex: 1; color: #555;">${this.richTextToHTML(block.callout.rich_text)}</div>
          </div>
        `;
        break;
        
      case 'divider':
        html = '<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">';
        break;
        
      case 'image':
        const imageUrl = block.image.file?.url || block.image.external?.url;
        if (imageUrl) {
          html = `<img src="${imageUrl}" alt="Email image" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 5px;">`;
        }
        break;
        
      case 'column_list':
        html = '<div style="display: table; width: 100%; margin: 15px 0;">';
        // Note: Column children would need to be processed separately
        html += '</div>';
        break;
    }
    
    // Wrap list items in appropriate list tags
    if (block.type === 'bulleted_list_item' && (!block.previous || block.previous.type !== 'bulleted_list_item')) {
      html = '<ul style="margin: 10px 0; padding-left: 20px;">' + html;
    }
    if (block.type === 'numbered_list_item' && (!block.previous || block.previous.type !== 'numbered_list_item')) {
      html = '<ol style="margin: 10px 0; padding-left: 20px;">' + html;
    }
    
    return html;
  }

  // Convert Notion rich text to HTML
  richTextToHTML(richTextArray) {
    if (!richTextArray || !Array.isArray(richTextArray)) return '';
    
    return richTextArray.map(text => {
      let html = text.plain_text;
      
      // Handle Handlebars variables
      html = html.replace(/\{\{(\w+)\}\}/g, '{{$1}}');
      
      // Apply text formatting
      if (text.annotations) {
        if (text.annotations.bold) html = `<strong>${html}</strong>`;
        if (text.annotations.italic) html = `<em>${html}</em>`;
        if (text.annotations.underline) html = `<u>${html}</u>`;
        if (text.annotations.strikethrough) html = `<s>${html}</s>`;
        if (text.annotations.code) html = `<code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace;">${html}</code>`;
        if (text.annotations.color && text.annotations.color !== 'default') {
          const color = this.getColorValue(text.annotations.color);
          html = `<span style="color: ${color};">${html}</span>`;
        }
      }
      
      // Handle links
      if (text.href) {
        html = `<a href="${text.href}" style="color: #3498db; text-decoration: none;">${html}</a>`;
      }
      
      return html;
    }).join('');
  }

  // Get color value for Notion colors
  getColorValue(notionColor) {
    const colorMap = {
      'gray': '#9b9b9b',
      'brown': '#8b6f47',
      'orange': '#ff9800',
      'yellow': '#ffeb3b',
      'green': '#4caf50',
      'blue': '#2196f3',
      'purple': '#9c27b0',
      'pink': '#e91e63',
      'red': '#f44336',
      'gray_background': '#f0f0f0',
      'brown_background': '#f4e6d9',
      'orange_background': '#ffe0b2',
      'yellow_background': '#fff9c4',
      'green_background': '#c8e6c9',
      'blue_background': '#bbdefb',
      'purple_background': '#e1bee7',
      'pink_background': '#f8bbd0',
      'red_background': '#ffcdd2'
    };
    
    return colorMap[notionColor] || '#000000';
  }

  // Get recipient list from Notion database
  async getRecipientsFromNotion(databaseId, filter = {}) {
    try {
      const recipients = [];
      let hasMore = true;
      let startCursor = undefined;

      while (hasMore) {
        const response = await notionService.notion.databases.query({
          database_id: databaseId,
          filter: filter,
          start_cursor: startCursor,
          page_size: 100
        });

        for (const page of response.results) {
          const recipient = {
            email: this.extractProperty(page, 'Email'),
            name: this.extractProperty(page, 'Name'),
            customFields: this.extractAllProperties(page)
          };
          
          if (recipient.email) {
            recipients.push(recipient);
          }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor;
      }

      return recipients;
    } catch (error) {
      console.error('Error fetching recipients from Notion:', error);
      throw error;
    }
  }

  // Send mass email campaign
  async sendMassEmail(options) {
    const {
      templateId,        // Notion template page ID
      recipientDatabaseId, // Notion database ID for recipients
      recipientFilter,   // Optional filter for recipients
      testMode = false,  // Send to test emails only
      testEmails = []    // Test email addresses
    } = options;

    try {
      // Fetch template from Notion
      console.log('📋 Fetching email template from Notion...');
      const template = await this.getEmailTemplateFromNotion(templateId);

      // Fetch recipients
      console.log('👥 Fetching recipients...');
      let recipients = testMode 
        ? testEmails.map(email => ({ email, name: 'Test User' }))
        : await this.getRecipientsFromNotion(recipientDatabaseId, recipientFilter);

      console.log(`📧 Preparing to send to ${recipients.length} recipients...`);

      // Compile Handlebars templates
      const subjectTemplate = handlebars.compile(template.subject);
      const htmlTemplate = handlebars.compile(template.htmlContent);
      const textTemplate = handlebars.compile(template.textContent);

      // Send emails in batches
      const results = {
        sent: [],
        failed: [],
        total: recipients.length
      };

      for (let i = 0; i < recipients.length; i += this.batchSize) {
        const batch = recipients.slice(i, i + this.batchSize);
        console.log(`📤 Sending batch ${Math.floor(i / this.batchSize) + 1}...`);

        // Send emails in parallel within batch
        const batchPromises = batch.map(async (recipient) => {
          try {
            // Personalize content
            const context = {
              ...recipient.customFields,
              name: recipient.name,
              email: recipient.email
            };

            const personalizedEmail = {
              from: `${template.fromName} <${process.env.EMAIL_FROM}>`,
              to: recipient.email,
              replyTo: template.replyTo || process.env.EMAIL_FROM,
              subject: subjectTemplate(context),
              html: htmlTemplate(context),
              text: textTemplate(context)
            };

            // Send email
            await emailService.transporter.sendMail(personalizedEmail);
            
            results.sent.push({
              email: recipient.email,
              timestamp: new Date()
            });

            console.log(`✅ Sent to ${recipient.email}`);
          } catch (error) {
            results.failed.push({
              email: recipient.email,
              error: error.message,
              timestamp: new Date()
            });
            console.error(`❌ Failed to send to ${recipient.email}:`, error.message);
          }
        });

        await Promise.all(batchPromises);

        // Delay between batches
        if (i + this.batchSize < recipients.length) {
          console.log(`⏳ Waiting ${this.delayBetweenBatches / 1000} seconds before next batch...`);
          await this.delay(this.delayBetweenBatches);
        }
      }

      // Save campaign results
      await this.saveCampaignResults(results);

      console.log(`\n📊 Campaign Complete:`);
      console.log(`✅ Sent: ${results.sent.length}`);
      console.log(`❌ Failed: ${results.failed.length}`);

      return results;
    } catch (error) {
      console.error('Error in mass email campaign:', error);
      throw error;
    }
  }

  // Create email campaign from CSV
  async sendFromCSV(csvPath, templateId) {
    const csv = require('csv-parser');
    const recipients = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          recipients.push({
            email: row.email || row.Email,
            name: row.name || row.Name,
            customFields: row
          });
        })
        .on('end', async () => {
          try {
            const template = await this.getEmailTemplateFromNotion(templateId);
            const results = await this.sendToRecipients(recipients, template);
            resolve(results);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  // Helper: Extract property from Notion page
  extractProperty(page, propertyName) {
    const properties = page.properties || {};
    const property = properties[propertyName];
    
    if (!property) return null;

    switch (property.type) {
      case 'title':
      case 'rich_text':
        return property[property.type]?.[0]?.plain_text || '';
      case 'email':
        return property.email;
      case 'select':
        return property.select?.name || '';
      case 'multi_select':
        return property.multi_select?.map(s => s.name) || [];
      case 'number':
        return property.number;
      case 'checkbox':
        return property.checkbox;
      case 'url':
        return property.url;
      default:
        return null;
    }
  }

  // Helper: Extract rich text content
  extractRichText(page, propertyName) {
    const properties = page.properties || {};
    const property = properties[propertyName];
    
    if (!property || property.type !== 'rich_text') return '';
    
    return property.rich_text
      .map(text => text.plain_text)
      .join('');
  }

  // Helper: Extract all properties
  extractAllProperties(page) {
    const properties = {};
    
    for (const [key, value] of Object.entries(page.properties || {})) {
      properties[key] = this.extractProperty(page, key);
    }
    
    return properties;
  }

  // Helper: Delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Save campaign results
  async saveCampaignResults(results) {
    const campaignDir = path.join(__dirname, '../../data/campaigns');
    await fs.ensureDir(campaignDir);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `campaign-${timestamp}.json`;
    
    await fs.writeJson(
      path.join(campaignDir, filename),
      {
        ...results,
        timestamp: new Date(),
        campaignId: timestamp
      },
      { spaces: 2 }
    );
  }

  // Get campaign statistics
  async getCampaignStats(campaignId) {
    const campaignPath = path.join(__dirname, '../../data/campaigns', `campaign-${campaignId}.json`);
    
    if (await fs.pathExists(campaignPath)) {
      return await fs.readJson(campaignPath);
    }
    
    return null;
  }
}

module.exports = new MassEmailService(); 