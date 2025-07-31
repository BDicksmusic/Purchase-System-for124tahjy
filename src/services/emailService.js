const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const fileService = require('./pdfService'); // Updated to use FileService

class EmailService {
  constructor() {
    this.transporter = this.createTransport();
    this.templates = this.loadTemplates();
  }

  // Create email transporter based on configuration
  createTransport() {
    const config = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    // Alternative configurations for different email services
    if (process.env.SENDGRID_API_KEY) {
      // SendGrid configuration
      config.service = 'SendGrid';
      config.auth = {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      };
    }

    if (process.env.MAILGUN_API_KEY) {
      // Mailgun configuration
      config.host = `smtp.mailgun.org`;
      config.auth = {
        user: process.env.MAILGUN_API_KEY,
        pass: process.env.MAILGUN_API_KEY,
      };
    }

    // Amazon SES configuration
    if (process.env.AWS_SES_REGION) {
      config.host = `email-smtp.${process.env.AWS_SES_REGION}.amazonaws.com`;
      config.port = 587;
      config.secure = false;
      config.auth = {
        user: process.env.AWS_SES_ACCESS_KEY,
        pass: process.env.AWS_SES_SECRET_KEY,
      };
    }

    return nodemailer.createTransport(config);
  }

  // Load email templates
  loadTemplates() {
    const templates = {};
    const templatesDir = path.join(__dirname, '../templates/emails');
    
    try {
      if (fs.existsSync(templatesDir)) {
        const templateFiles = fs.readdirSync(templatesDir);
        templateFiles.forEach(file => {
          if (file.endsWith('.hbs')) {
            const templateName = path.basename(file, '.hbs');
            const templateContent = fs.readFileSync(
              path.join(templatesDir, file), 
              'utf8'
            );
            templates[templateName] = handlebars.compile(templateContent);
          }
        });
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    }

    return templates;
  }

  // Send purchase confirmation using SendGrid Dynamic Template
  async sendPurchaseConfirmationWithSendGridTemplate(purchaseData) {
    try {
      const {
        customerEmail,
        customerName,
        compositionTitle,
        pdfPath,
        orderId,
        purchaseDate,
        price
      } = purchaseData;

      // SendGrid Dynamic Template ID (you'll set this in your .env)
      const templateId = process.env.SENDGRID_PURCHASE_TEMPLATE_ID;
      
      if (!templateId) {
        throw new Error('SENDGRID_PURCHASE_TEMPLATE_ID not configured');
      }

      // Prepare dynamic template data
      const dynamicTemplateData = {
        customer_name: customerName || 'Valued Customer',
        composition_title: compositionTitle,
        order_id: orderId,
        purchase_date: purchaseDate,
        price: price ? `$${price}` : 'N/A',
        download_link: `${process.env.WEBSITE_URL}/download/${orderId}`,
        support_email: process.env.EMAIL_FROM
      };

      // Prepare email payload for SendGrid API
      const emailPayload = {
        personalizations: [
          {
            to: [{ email: customerEmail, name: customerName }],
            dynamic_template_data: dynamicTemplateData
          }
        ],
        from: {
          email: process.env.EMAIL_FROM,
          name: process.env.EMAIL_FROM_NAME || 'Your Music Store'
        },
        template_id: templateId,
        attachments: []
      };

      // Add PDF attachment if available
      if (pdfPath && await fs.pathExists(pdfPath)) {
        const pdfBuffer = await fs.readFile(pdfPath);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        emailPayload.attachments.push({
          content: pdfBase64,
          filename: `${compositionTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        });
      }

      // Send email via SendGrid API
      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        emailPayload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Purchase confirmation sent via SendGrid template:', response.status);
      return { success: true, messageId: response.headers['x-message-id'] };

    } catch (error) {
      console.error('Error sending purchase confirmation via SendGrid template:', error);
      throw error;
    }
  }

  // Send purchase confirmation using Mailgun Template
  async sendPurchaseConfirmationWithMailgunTemplate(purchaseData) {
    try {
      const {
        customerEmail,
        customerName,
        compositionTitle,
        pdfPath,
        orderId,
        purchaseDate,
        price
      } = purchaseData;

      // Mailgun Template Name (you'll set this in your .env)
      const templateName = process.env.MAILGUN_PURCHASE_TEMPLATE_NAME;
      
      if (!templateName) {
        throw new Error('MAILGUN_PURCHASE_TEMPLATE_NAME not configured');
      }

      // Prepare template variables for Mailgun
      const templateVariables = {
        'customer_name': customerName || 'Valued Customer',
        'composition_title': compositionTitle,
        'order_id': orderId,
        'purchase_date': purchaseDate,
        'price': price ? `$${price}` : 'N/A',
        'download_link': `${process.env.WEBSITE_URL}/download/${orderId}`,
        'support_email': process.env.EMAIL_FROM
      };

      // Prepare form data for Mailgun API
      const formData = new URLSearchParams();
      formData.append('from', `${process.env.EMAIL_FROM_NAME || 'Your Music Store'} <${process.env.EMAIL_FROM}>`);
      formData.append('to', customerEmail);
      formData.append('subject', `Thank you for your purchase - ${compositionTitle}`);
      formData.append('template', templateName);
      
      // Add template variables
      Object.entries(templateVariables).forEach(([key, value]) => {
        formData.append(`v:${key}`, value);
      });

      // Add PDF attachment if available
      if (pdfPath && await fs.pathExists(pdfPath)) {
        const pdfBuffer = await fs.readFile(pdfPath);
        formData.append('attachment', pdfBuffer, {
          filename: `${compositionTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          contentType: 'application/pdf'
        });
      }

      // Send email via Mailgun API
      const response = await axios.post(
        `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
        formData,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('Purchase confirmation sent via Mailgun template:', response.status);
      return { success: true, messageId: response.data.id };

    } catch (error) {
      console.error('Error sending purchase confirmation via Mailgun template:', error);
      throw error;
    }
  }

  // Send purchase confirmation email with PDF attachment
  async sendPurchaseConfirmation(purchaseData) {
    try {
      const {
        customerEmail,
        customerName,
        compositionTitle,
        compositionId,
        orderId,
        purchaseDate,
        price
      } = purchaseData;

      // Check if SendGrid template is configured
      if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_PURCHASE_TEMPLATE_ID) {
        return await this.sendPurchaseConfirmationWithSendGridTemplate(purchaseData);
      }

      // Check if Mailgun template is configured
      if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_PURCHASE_TEMPLATE_NAME) {
        return await this.sendPurchaseConfirmationWithMailgunTemplate(purchaseData);
      }

      // Prepare email template data
      const templateData = {
        customerName: customerName || 'Valued Customer',
        compositionTitle,
        orderId,
        purchaseDate: purchaseDate || new Date().toLocaleDateString(),
        price: `$${price.toFixed(2)}`,
        downloadLink: purchaseData.pdfUrl || purchaseData.pdfPath || `${process.env.FRONTEND_URL}/download/${orderId}`,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM
      };

      // Generate email content using template
      const emailContent = this.generateEmailContent('purchase-confirmation', templateData);

      // Prepare email options
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: customerEmail,
        subject: `Your Sheet Music: ${compositionTitle}`,
        html: emailContent.html,
        text: emailContent.text,
        attachments: []
      };

      // Only try to get file package if we don't have a PDF URL
      if (compositionId && !purchaseData.pdfUrl) {
        try {
          const file = await fileService.getCompositionFile(compositionId);
          if (file && file.buffer) {
            mailOptions.attachments.push({
              filename: `${compositionTitle.replace(/[^a-zA-Z0-9]/g, '_')}.zip`,
              content: file.buffer,
              contentType: 'application/zip'
            });
            console.log(`📎 File package attached to email: ${compositionTitle} (${file.size} bytes)`);
          } else {
            console.log(`📎 No file package found for composition: ${compositionId} (using PDF URL instead)`);
          }
        } catch (error) {
          console.error('Error getting file package for email:', error);
        }
      } else if (purchaseData.pdfUrl) {
        console.log(`📎 Using PDF URL for download: ${compositionTitle}`);
      }

      // Send email using Mailgun API if configured, otherwise use SMTP
      if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
        // Use Mailgun API directly
        const formData = new URLSearchParams();
        formData.append('from', `${process.env.EMAIL_FROM_NAME || 'BDicksmusic'} <${process.env.EMAIL_FROM}>`);
        formData.append('to', customerEmail);
        formData.append('subject', `Your Sheet Music: ${compositionTitle}`);
        formData.append('html', emailContent.html);
        formData.append('text', emailContent.text);
        
        const response = await axios.post(
          `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
          formData,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        console.log(`✅ Purchase confirmation email sent via Mailgun to ${customerEmail} for ${compositionTitle}`);
        
        return {
          success: true,
          messageId: response.data.id,
          email: customerEmail
        };
      } else {
        // Fallback to SMTP
        const result = await this.transporter.sendMail(mailOptions);
        
        console.log(`✅ Purchase confirmation email sent via SMTP to ${customerEmail} for ${compositionTitle}`);
        
        return {
          success: true,
          messageId: result.messageId,
          email: customerEmail
        };
      }

    } catch (error) {
      console.error('Error sending purchase confirmation email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // Send admin notification email
  async sendAdminNotification(purchaseData) {
    try {
      const {
        customerEmail,
        customerName,
        compositionTitle,
        orderId,
        price
      } = purchaseData;

      const templateData = {
        customerEmail,
        customerName: customerName || 'Unknown',
        compositionTitle,
        orderId,
        price: price ? `$${price.toFixed(2)}` : 'N/A',
        purchaseDate: new Date().toLocaleDateString(),
        adminDashboard: `${process.env.ADMIN_URL}/orders/${orderId}`
      };

      const emailContent = this.generateEmailContent('admin-notification', templateData);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
        subject: `New Purchase: ${compositionTitle}`,
        html: emailContent.html,
        text: emailContent.text
      };

      // Send admin notification using Mailgun API if configured, otherwise use SMTP
      if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
        // Use Mailgun API directly
        const formData = new URLSearchParams();
        formData.append('from', `${process.env.EMAIL_FROM_NAME || 'BDicksmusic'} <${process.env.EMAIL_FROM}>`);
        formData.append('to', process.env.ADMIN_EMAIL || process.env.EMAIL_FROM);
        formData.append('subject', `New Purchase: ${compositionTitle}`);
        formData.append('html', emailContent.html);
        formData.append('text', emailContent.text);
        
        const response = await axios.post(
          `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
          formData,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        console.log(`✅ Admin notification sent via Mailgun for purchase ${orderId}`);
        
        return {
          success: true,
          messageId: response.data.id
        };
      } else {
        // Fallback to SMTP
        const result = await this.transporter.sendMail(mailOptions);
        
        console.log(`✅ Admin notification sent via SMTP for purchase ${orderId}`);
        
        return {
          success: true,
          messageId: result.messageId
        };
      }

    } catch (error) {
      console.error('Error sending admin notification:', error);
      // Don't throw error for admin notifications to avoid breaking purchase flow
      return { success: false, error: error.message };
    }
  }

  // Send payment failure notification email
  async sendPaymentFailureNotification(purchaseData) {
    try {
      const {
        customerEmail,
        customerName,
        compositionTitle,
        orderId,
        failureReason,
        price
      } = purchaseData;

      const emailContent = this.generatePaymentFailureEmail({
        customerName: customerName || 'Valued Customer',
        compositionTitle,
        orderId,
        failureReason: failureReason || 'Payment processing failed',
        price: `$${price.toFixed(2)}`,
        supportEmail: process.env.EMAIL_FROM,
        retryLink: `${process.env.WEBSITE_URL || 'https://bdicksmusic.com'}/purchase/${orderId}`
      });

      // Use Mailgun API for sending
      const axios = require('axios');
      const formData = new URLSearchParams();
      formData.append('from', `${process.env.EMAIL_FROM_NAME || 'BDicksmusic'} <${process.env.EMAIL_FROM}>`);
      formData.append('to', customerEmail);
      formData.append('subject', `Payment Failed - ${compositionTitle}`);
      formData.append('html', emailContent.html);
      formData.append('text', emailContent.text);

      const response = await axios.post(
        `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
        formData,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log(`❌ Payment failure notification sent to ${customerEmail} for ${compositionTitle}`);
      
      return {
        success: true,
        messageId: response.data.id
      };

    } catch (error) {
      console.error('Error sending payment failure notification:', error);
      throw new Error(`Payment failure email sending failed: ${error.message}`);
    }
  }

  // Generate payment failure email content
  generatePaymentFailureEmail(data) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Failed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; padding: 20px; text-align: center; color: white; }
          .content { padding: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Payment Failed</h1>
            <p>We couldn't process your payment</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>We're sorry, but we couldn't process your payment for <strong>${data.compositionTitle}</strong>.</p>
            
            <div class="warning">
              <h3>What happened?</h3>
              <p><strong>Error:</strong> ${data.failureReason}</p>
              <p><strong>Order ID:</strong> ${data.orderId}</p>
              <p><strong>Amount:</strong> ${data.price}</p>
            </div>
            
            <h3>What you can do:</h3>
            <ul>
              <li><strong>Try again:</strong> Click the button below to retry your purchase</li>
              <li><strong>Check your payment method:</strong> Ensure your card has sufficient funds</li>
              <li><strong>Contact support:</strong> If the problem persists, we're here to help</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.retryLink}" class="button">Try Payment Again</a>
            </div>
            
            <p><strong>Need help?</strong> Contact us at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
          </div>
          <div class="footer">
            <p>© 2025 BDicks Music. All rights reserved.</p>
            <p>This email was sent because a payment attempt failed for your order.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Payment Failed - ${data.compositionTitle}

Dear ${data.customerName},

We're sorry, but we couldn't process your payment for ${data.compositionTitle}.

What happened?
- Error: ${data.failureReason}
- Order ID: ${data.orderId}
- Amount: ${data.price}

What you can do:
1. Try again: Visit ${data.retryLink}
2. Check your payment method: Ensure your card has sufficient funds
3. Contact support: Email ${data.supportEmail}

Need help? Contact us at ${data.supportEmail}

© 2025 BDicks Music. All rights reserved.
    `;

    return { html, text };
  }

  // Generate email content from template
  generateEmailContent(templateName, data) {
    const template = this.templates[templateName];
    
    if (!template) {
      // Fallback to default template
      return this.generateDefaultTemplate(data);
    }

    const html = template(data);
    const text = this.htmlToText(html);

    return { html, text };
  }

  // Generate default email template if custom template doesn't exist
  generateDefaultTemplate(data) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Purchase Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Purchase!</h1>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Thank you for purchasing <strong>${data.compositionTitle}</strong>!</p>
            <p>Your order details:</p>
            <ul>
              <li><strong>Order ID:</strong> ${data.orderId}</li>
              <li><strong>Composition:</strong> ${data.compositionTitle}</li>
              <li><strong>Price:</strong> ${data.price}</li>
              <li><strong>Date:</strong> ${data.purchaseDate}</li>
            </ul>
            <p>Your PDF is attached to this email. If you have any questions, please contact us.</p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Thank You for Your Purchase!
      
      Dear ${data.customerName},
      
      Thank you for purchasing ${data.compositionTitle}!
      
      Your order details:
      - Order ID: ${data.orderId}
      - Composition: ${data.compositionTitle}
      - Price: ${data.price}
      - Date: ${data.purchaseDate}
      
      Your PDF is attached to this email. If you have any questions, please contact us.
      
      Thank you for your business!
    `;

    return { html, text };
  }

  // Convert HTML to plain text
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService(); 