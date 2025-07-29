# SendGrid Dynamic Template Setup Guide

This guide will help you set up a professional email template in SendGrid that automatically includes order information and PDF attachments.

## Step 1: Create a Dynamic Template in SendGrid

1. **Log into SendGrid Dashboard**
   - Go to https://app.sendgrid.com
   - Navigate to **Email API** → **Dynamic Templates**

2. **Create New Template**
   - Click **"Create Template"**
   - Name it: "Purchase Confirmation"
   - Click **"Create Template"**

3. **Design Your Email Template**
   - Click on your new template
   - Use the **Design Editor** or **Code Editor**
   - Use **Handlebars syntax** for dynamic content

## Step 2: Template Design Example

Here's a professional template you can use:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3498db; }
        .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Thank You for Your Purchase!</h1>
        </div>
        
        <div class="content">
            <p>Hello {{customer_name}},</p>
            
            <p>Thank you for purchasing from our music catalog! Your order has been processed successfully.</p>
            
            <div class="order-details">
                <h3>Order Details:</h3>
                <p><strong>Composition:</strong> {{composition_title}}</p>
                <p><strong>Order ID:</strong> {{order_id}}</p>
                <p><strong>Purchase Date:</strong> {{purchase_date}}</p>
                <p><strong>Price:</strong> {{price}}</p>
            </div>
            
            <p>Your PDF composition is attached to this email. You can also download it anytime using the link below:</p>
            
            <p style="text-align: center;">
                <a href="{{download_link}}" class="button">Download Composition</a>
            </p>
            
            <p>If you have any questions or need support, please contact us at {{support_email}}.</p>
            
            <p>Happy playing!</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Your Music Store. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

## Step 3: Dynamic Template Variables

Your template can use these variables that will be automatically filled:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{customer_name}}` | Customer's name | "John Doe" |
| `{{composition_title}}` | Title of purchased composition | "Amazing Grace" |
| `{{order_id}}` | Unique order identifier | "ord_123456" |
| `{{purchase_date}}` | Date of purchase | "January 15, 2024" |
| `{{price}}` | Price paid | "$12.99" |
| `{{download_link}}` | Direct download link | "https://yourdomain.com/download/ord_123456" |
| `{{support_email}}` | Support email address | "support@yourdomain.com" |

## Step 4: Get Your Template ID

1. **Save your template** in SendGrid
2. **Copy the Template ID** (starts with `d-`)
3. **Add it to your `.env` file:**
   ```env
   SENDGRID_PURCHASE_TEMPLATE_ID=d-your_template_id_here
   ```

## Step 5: Configure Your Environment

Add these to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_PURCHASE_TEMPLATE_ID=d-your_template_id_here
EMAIL_FROM=your_verified_email@yourdomain.com
EMAIL_FROM_NAME=Your Music Store
WEBSITE_URL=https://yourdomain.com
```

## Step 6: Test Your Template

Your system will automatically:
1. **Use the SendGrid template** when `SENDGRID_PURCHASE_TEMPLATE_ID` is set
2. **Fill in dynamic data** from the purchase
3. **Attach the PDF** automatically
4. **Send the email** with professional formatting

## Benefits of SendGrid Dynamic Templates

✅ **Professional Design**: Beautiful, responsive email templates
✅ **Dynamic Content**: Order details automatically filled in
✅ **PDF Attachments**: Automatically attached to each email
✅ **Consistent Branding**: Same template for all purchases
✅ **Easy Maintenance**: Update template once, affects all emails
✅ **Analytics**: Track opens, clicks, and engagement

## Fallback Option

If you don't set up a SendGrid template, the system will automatically fall back to the local Handlebars template (`purchase-confirmation.hbs`).

## Template Customization Tips

- **Add your logo** to the header
- **Include social media links** in the footer
- **Add a "View in Browser" link** for better compatibility
- **Use your brand colors** in the styling
- **Include an unsubscribe link** for compliance
- **Add a "Download Again" button** for convenience

Your purchase confirmation emails will now look professional and include all the order details automatically! 🎵