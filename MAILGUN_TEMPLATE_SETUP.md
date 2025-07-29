# Mailgun Template Setup Guide

Mailgun offers excellent template capabilities that can handle dynamic content and PDF attachments. Here's how to set it up:

## Mailgun vs SendGrid Templates

| Feature | Mailgun | SendGrid |
|---------|---------|----------|
| **Template Creation** | Web interface or API | Web interface |
| **Variable Syntax** | `%variable%` | `{{variable}}` |
| **PDF Attachments** | ✅ Supported | ✅ Supported |
| **Template Management** | API-based | Web dashboard |
| **Cost** | Very competitive | Competitive |

## Step 1: Create a Template in Mailgun

### Option A: Using Mailgun Web Interface
1. **Log into Mailgun Dashboard**
   - Go to https://app.mailgun.com
   - Navigate to **Sending** → **Templates**

2. **Create New Template**
   - Click **"Create Template"**
   - Name it: `purchase-confirmation-template`
   - Choose **HTML** format

### Option B: Using Mailgun API
You can create templates programmatically using Mailgun's API.

## Step 2: Template Design Example

Here's a professional template you can use with Mailgun:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Confirmation</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
        }
        .header { 
            background: #2c3e50; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .content { 
            padding: 30px 20px; 
            background: #f9f9f9; 
        }
        .order-details { 
            background: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-left: 4px solid #3498db; 
            border-radius: 5px;
        }
        .button { 
            display: inline-block; 
            padding: 15px 30px; 
            background: #3498db; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold;
        }
        .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f5f5f5;
        }
        .highlight {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Thank You for Your Purchase!</h1>
            <p>Your music is ready for download</p>
        </div>
        
        <div class="content">
            <p>Hello %customer_name%,</p>
            
            <p>Thank you for purchasing from our music catalog! Your order has been processed successfully and your composition is ready for download.</p>
            
            <div class="order-details">
                <h3>📋 Order Details:</h3>
                <p><strong>Composition:</strong> %composition_title%</p>
                <p><strong>Order ID:</strong> %order_id%</p>
                <p><strong>Purchase Date:</strong> %purchase_date%</p>
                <p><strong>Price:</strong> %price%</p>
            </div>
            
            <div class="highlight">
                <p><strong>📎 PDF Attachment:</strong> Your composition PDF is attached to this email.</p>
                <p><strong>🔗 Download Link:</strong> You can also download it anytime using the button below:</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="%download_link%" class="button">Download Composition</a>
            </p>
            
            <p>If you have any questions or need support, please contact us at <strong>%support_email%</strong>.</p>
            
            <p>Happy playing! 🎼</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Your Music Store. All rights reserved.</p>
            <p>This email was sent to %customer_email%</p>
        </div>
    </div>
</body>
</html>
```

## Step 3: Mailgun Template Variables

Your template can use these variables that will be automatically filled:

| Variable | Description | Example |
|----------|-------------|---------|
| `%customer_name%` | Customer's name | "John Doe" |
| `%composition_title%` | Title of purchased composition | "Amazing Grace" |
| `%order_id%` | Unique order identifier | "ord_123456" |
| `%purchase_date%` | Date of purchase | "January 15, 2024" |
| `%price%` | Price paid | "$12.99" |
| `%download_link%` | Direct download link | "https://yourdomain.com/download/ord_123456" |
| `%support_email%` | Support email address | "support@yourdomain.com" |
| `%customer_email%` | Customer's email | "john@example.com" |

## Step 4: Create Template via API

You can create the template programmatically using Mailgun's API:

```bash
curl -X POST \
  https://api.mailgun.net/v3/your-domain.com/templates \
  -u "api:your-mailgun-api-key" \
  -F name="purchase-confirmation-template" \
  -F description="Purchase confirmation email template" \
  -F template="[Your HTML template content]"
```

## Step 5: Configure Your Environment

Add these to your `.env` file:

```env
# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_domain_here
MAILGUN_PURCHASE_TEMPLATE_NAME=purchase-confirmation-template
EMAIL_FROM=your_verified_email@yourdomain.com
EMAIL_FROM_NAME=Your Music Store
WEBSITE_URL=https://yourdomain.com
```

## Step 6: Template Priority System

Your system will automatically choose the best available template:

1. **SendGrid Template** (if `SENDGRID_PURCHASE_TEMPLATE_ID` is set)
2. **Mailgun Template** (if `MAILGUN_PURCHASE_TEMPLATE_NAME` is set)
3. **Local Handlebars Template** (fallback)

## Step 7: Test Your Template

Your system will automatically:
1. **Use the Mailgun template** when `MAILGUN_PURCHASE_TEMPLATE_NAME` is set
2. **Fill in dynamic data** from the purchase
3. **Attach the PDF** automatically
4. **Send the email** with professional formatting

## Benefits of Mailgun Templates

✅ **Cost-Effective**: Very competitive pricing
✅ **Reliable Delivery**: Excellent deliverability rates
✅ **PDF Attachments**: Automatic PDF attachment support
✅ **Dynamic Content**: Order details automatically filled in
✅ **Professional Design**: Beautiful, responsive email templates
✅ **API Integration**: Easy to manage programmatically
✅ **Analytics**: Track opens, clicks, and engagement

## Mailgun vs SendGrid Comparison

| Feature | Mailgun | SendGrid |
|---------|---------|----------|
| **Template Creation** | Web interface or API | Web interface |
| **Variable Syntax** | `%variable%` | `{{variable}}` |
| **PDF Attachments** | ✅ Supported | ✅ Supported |
| **API Documentation** | Excellent | Excellent |
| **Pricing** | Very competitive | Competitive |
| **Web Interface** | Functional | More polished |
| **Template Management** | API-based | Web dashboard |

## Template Customization Tips

- **Add your logo** to the header
- **Include social media links** in the footer
- **Add a "View in Browser" link** for better compatibility
- **Use your brand colors** in the styling
- **Include an unsubscribe link** for compliance
- **Add a "Download Again" button** for convenience
- **Test on different email clients** for compatibility

Your purchase confirmation emails will now look professional and include all the order details automatically! 🎵