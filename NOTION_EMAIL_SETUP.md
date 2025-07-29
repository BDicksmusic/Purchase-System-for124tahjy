# Notion Email Template Setup Guide

## Overview

This system allows you to create beautiful email campaigns using professional HTML templates and simple text fields in Notion. You just fill in the content in Notion, and the system handles all the HTML formatting automatically!

## How It Works

1. **Use pre-built HTML templates** with professional styling
2. **Fill in simple text fields in Notion** - no HTML knowledge required
3. **Send personalized emails** through your configured email service
4. **Track campaign results** with built-in analytics

## Setting Up Email Templates in Notion

### 1. Create a New Page for Your Email Campaign

Create a new page in Notion with these **simple text properties**:

| Property Name | Property Type | Required | Description | Example |
|--------------|---------------|----------|-------------|---------|
| **Subject** | Title | Yes | Email subject line | "🎵 Special Offer: 25% off Amazing Grace" |
| **Template_File** | Text | No | Template to use | "promotional-template.html" (default) |
| **From_Name** | Text | Yes | Your name/business | "Brandon's Music" |
| **Reply_To** | Email | No | Reply email | "support@yourdomain.com" |

### 2. Content Fields (Just Plain Text!)

| Property Name | Property Type | Description | Example |
|--------------|---------------|-------------|---------|
| **Header_Title** | Text | Main header | "Limited Time Offer!" |
| **Main_Message** | Text | Your main message | "We're excited to offer you an exclusive discount on our beautiful sheet music arrangements." |
| **Highlight_Title** | Text | Optional highlight box title | "Featured Composition" |
| **Highlight_Content** | Text | Optional highlight box content | "This arrangement of Amazing Grace features beautiful harmonies perfect for church services." |

### 3. Pricing Fields (Optional)

| Property Name | Property Type | Description | Example |
|--------------|---------------|-------------|---------|
| **Show_Pricing** | Checkbox | Show price section | ✅ |
| **Price** | Number | Regular price | 15.99 |
| **Original_Price** | Number | Original price (for sales) | 19.99 |
| **Sale_Price** | Number | Sale price | 14.99 |
| **Discount_Percentage** | Number | Discount % | 25 |

### 4. Call to Action Fields

| Property Name | Property Type | Description | Example |
|--------------|---------------|-------------|---------|
| **CTA_Text** | Text | Button text | "Get Your Sheet Music Now" |
| **CTA_Link** | URL | Button link | "https://yourstore.com/purchase/amazing-grace" |

### 5. Additional Fields

| Property Name | Property Type | Description | Example |
|--------------|---------------|-------------|---------|
| **Additional_Content** | Text | Extra message | "This arrangement includes both melody and harmony parts." |
| **Expiry_Date** | Date | Offer expiry | December 31, 2024 |
| **Website_URL** | URL | Your website | "https://yourwebsite.com" |

## Example Notion Setup

Here's what your Notion page might look like:

```
📄 Christmas Sale Campaign

Subject: 🎄 Christmas Special: 30% off all Holiday Music
Template_File: promotional-template.html
From_Name: Brandon's Music
Reply_To: brandon@brandonmusic.com

Header_Title: Christmas Special Sale
Main_Message: Celebrate the season with our beautiful holiday arrangements! Perfect for church services, concerts, and family gatherings.

Highlight_Title: Featured: Silent Night Arrangement
Highlight_Content: Our most popular Christmas arrangement featuring rich harmonies and optional instrumental parts.

Show_Pricing: ✅
Original_Price: 24.99
Sale_Price: 17.49
Discount_Percentage: 30

CTA_Text: Shop Christmas Music
CTA_Link: https://brandonmusic.com/christmas-sale

Expiry_Date: December 25, 2024
Website_URL: https://brandonmusic.com
```

## What You Get Automatically

The system automatically creates a **beautiful, professional email** with:

✅ **Responsive design** that looks great on all devices
✅ **Professional styling** with gradients and modern fonts
✅ **Automatic pricing display** with strikethrough and sale prices
✅ **Call-to-action buttons** with hover effects
✅ **Mobile-friendly** layout
✅ **Email client compatibility** (Gmail, Outlook, etc.)

## Using the System

### 1. Access the Interface
Navigate to: `http://localhost:3000/mass-email.html`

### 2. Send Your Campaign
1. **Enter Template ID**: Copy the Notion page ID
2. **Choose Recipients**: Notion database, CSV file, or test mode
3. **Preview**: See exactly how your email will look
4. **Send**: Launch your campaign!

### 3. Get Your Notion Page ID
1. Open your campaign page in Notion
2. Click "Share" → "Copy link"
3. The ID is the 32-character string in the URL:
   `https://notion.so/Christmas-Sale-**1234567890abcdef1234567890abcdef**`

## Creating Multiple Templates

You can create different HTML templates for different types of campaigns:

- `promotional-template.html` - Sales and promotions (default)
- `newsletter-template.html` - Regular updates
- `announcement-template.html` - New releases
- `simple-template.html` - Basic messages

Just specify the template file name in the `Template_File` property!

## Benefits of This Approach

✅ **No HTML knowledge required** - just fill in text fields
✅ **Professional results** - beautiful, responsive emails
✅ **Consistent branding** - templates ensure uniform look
✅ **Quick setup** - create campaigns in minutes
✅ **Easy updates** - change content without touching code
✅ **Mobile responsive** - looks great everywhere
✅ **Cost effective** - $0 per month vs $200-500 for commercial services

## Sample Email Output

With the simple Notion fields above, you'll get a beautiful email with:

- **Professional header** with gradient background
- **Personalized greeting** using recipient's name
- **Your main message** in readable typography
- **Highlighted content box** with special styling
- **Pricing section** with discount badges and strikethrough
- **Call-to-action button** with hover effects
- **Professional footer** with your branding

## Next Steps

1. **Create your first campaign page** in Notion
2. **Fill in the text fields** - no HTML needed!
3. **Test with your own email** first
4. **Send to your audience** and track results

This approach gives you **professional email marketing** without the complexity or cost of traditional services! 