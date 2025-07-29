# Mailgun Template Setup Guide

## Overview
This guide will help you set up a professional order confirmation email template in Mailgun that works with your purchasing system.

## Step 1: Create Mailgun Template

### 1.1 Access Mailgun Templates
1. Go to: https://app.mailgun.com/app/templates
2. Click **"Create Template"**

### 1.2 Template Configuration
- **Template Name**: `order-confirmation`
- **Template Type**: `HTML`
- **Subject Line**: `Your Sheet Music: {{compositionTitle}}`

### 1.3 Template Variables
Add these variables to your Mailgun template:
```
{{customerName}} - Customer's name
{{compositionTitle}} - Name of the composition
{{orderId}} - Unique order ID
{{purchaseDate}} - Date of purchase
{{price}} - Total amount paid
{{downloadLink}} - Link to download PDF
{{supportEmail}} - Support email address
{{customerEmail}} - Customer's email address
```

## Step 2: Upload HTML Template

### 2.1 Copy the HTML Template
Use the HTML template from `src/templates/emails/order-confirmation.hbs` and paste it into Mailgun's template editor.

### 2.2 Template Structure
The template includes:
- **Header**: Professional gradient header with music icon
- **Order Details**: Clean table showing purchase information
- **Download Section**: Prominent download button
- **Support Info**: Contact information for help
- **Footer**: Social links and branding

## Step 3: Configure Your Application

### 3.1 Update Environment Variables
Add these to your `.env` file:
```bash
# Mailgun Template Configuration
MAILGUN_PURCHASE_TEMPLATE_NAME=order-confirmation
MAILGUN_DOMAIN=bdicksmusic.com
MAILGUN_API_KEY=your_mailgun_api_key_here

# Email Configuration
EMAIL_FROM=orders@bdicksmusic.com
EMAIL_FROM_NAME=Brandon Dicks Music
SUPPORT_EMAIL=support@bdicksmusic.com
FRONTEND_URL=https://bdicksmusic.com
```

### 3.2 Test the Template
Create a test script to verify the template works:

```javascript
// test-mailgun-template.js
require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testMailgunTemplate() {
  const testData = {
    customerEmail: 'test@example.com',
    customerName: 'John Doe',
    compositionTitle: 'Moonlight Sonata',
    orderId: 'ORD-12345',
    purchaseDate: new Date().toLocaleDateString(),
    price: 9.99,
    downloadLink: 'https://bdicksmusic.com/download/ORD-12345',
    supportEmail: 'support@bdicksmusic.com'
  };

  try {
    const result = await emailService.sendPurchaseConfirmationWithMailgunTemplate(testData);
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
}

testMailgunTemplate();
```

## Step 4: Template Customization

### 4.1 Branding
Update the template with your branding:
- **Colors**: Change the gradient colors in `.header`
- **Logo**: Add your logo to the header
- **Social Links**: Update the footer links
- **Contact Info**: Update support email and website

### 4.2 Content Customization
Modify the template content:
- **Header Text**: "Order Confirmation" → "Your Music Order"
- **Support Info**: Update response time and contact details
- **Footer**: Add your social media links

## Step 5: Testing

### 5.1 Send Test Email
```bash
node test-mailgun-template.js
```

### 5.2 Check Email Delivery
1. Check your test email inbox
2. Verify all variables are populated correctly
3. Test the download link
4. Check mobile responsiveness

## Step 6: Production Setup

### 6.1 Domain Verification
Ensure your domain is verified in Mailgun:
- Go to: https://app.mailgun.com/app/domains
- Check that `bdicksmusic.com` shows as "Active"

### 6.2 Template Variables
Make sure all template variables are properly mapped:
- `{{customerName}}` → Customer's name
- `{{compositionTitle}}` → Composition title from Notion
- `{{orderId}}` → Generated order ID
- `{{price}}` → Formatted price with currency

## Troubleshooting

### Common Issues

**1. Template Not Found**
- Verify template name in Mailgun dashboard
- Check template name in environment variables

**2. Variables Not Populated**
- Ensure all variables are passed to the email service
- Check variable names match template exactly

**3. Email Not Sending**
- Verify Mailgun API key is correct
- Check domain verification status
- Review Mailgun logs for errors

### Debug Commands
```bash
# Test Mailgun connection
node -e "require('dotenv').config(); console.log('Mailgun Domain:', process.env.MAILGUN_DOMAIN);"

# Test template variables
node test-mailgun-template.js
```

## Advanced Features

### 1. Dynamic Templates
Create multiple templates for different scenarios:
- `order-confirmation` - Standard order confirmation
- `order-confirmation-premium` - Premium customer template
- `order-confirmation-bulk` - Bulk order template

### 2. A/B Testing
Use Mailgun's A/B testing to optimize:
- Subject lines
- Call-to-action buttons
- Email layout

### 3. Analytics
Track email performance:
- Open rates
- Click rates
- Download completion rates

## Security Best Practices

### 1. Template Security
- Never include sensitive data in templates
- Use secure download links with expiration
- Validate all user inputs

### 2. Email Security
- Use SPF, DKIM, and DMARC records
- Monitor for email abuse
- Implement rate limiting

## Next Steps

1. **Test the template** with sample data
2. **Customize branding** to match your website
3. **Set up monitoring** for email delivery
4. **Create additional templates** for other email types

Your order confirmation emails will now look professional and provide a great customer experience!