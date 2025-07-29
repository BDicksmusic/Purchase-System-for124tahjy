# SendGrid Setup Guide for Purchasing System

## Quick Setup Steps

### 1. Create SendGrid Account
- Go to [sendgrid.com](https://sendgrid.com)
- Sign up for free account (100 emails/day)
- Verify your email address

### 2. Generate API Key
1. In SendGrid dashboard → **Settings → API Keys**
2. Click **"Create API Key"**
3. Name: `"Purchasing System - Production"`
4. Permissions: **"Restricted Access"** → **"Mail Send"**
5. Copy the API key (starts with `SG.`)

### 3. Verify Sender Email
1. Go to **Settings → Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Add your email: `your_email@yourdomain.com`
4. Check your email and click the verification link

### 4. Configure Environment Variables
1. Copy `env.example` to `.env`
2. Update these values:
```env
SENDGRID_API_KEY=SG.your_actual_api_key_here
EMAIL_FROM=your_verified_email@yourdomain.com
```

### 5. Test the Setup
1. Start the server: `npm start`
2. Visit `http://localhost:3000`
3. Click "Test Email Service"
4. Check your email for the test message

## Future Mass Promotions

### SendGrid Marketing Campaigns
- **Free tier:** 2,000 contacts
- **Paid plans:** Up to 100,000+ contacts
- **Features:** Template builder, A/B testing, analytics

### Mailgun for Promotions
- **Alternative option** for high-volume campaigns
- **Better pricing** for large lists
- **Advanced segmentation** features

## Troubleshooting

### Common Issues
1. **"Authentication failed"**
   - Check API key is correct
   - Ensure sender email is verified

2. **"Email not received"**
   - Check spam folder
   - Verify sender authentication is complete

3. **"File attachment too large"**
   - PDFs should be under 30MB
   - Consider compression for large files

### Support
- SendGrid Support: Available in dashboard
- Documentation: [sendgrid.com/docs](https://sendgrid.com/docs)
- API Reference: [sendgrid.com/docs/api-reference](https://sendgrid.com/docs/api-reference)

## Pricing (as of 2024)

### SendGrid Free Tier
- **100 emails/day**
- **Perfect for testing and small volume**

### SendGrid Paid Plans
- **Essentials:** $14.95/month (50k emails)
- **Pro:** $89.95/month (100k emails)
- **Premier:** Custom pricing

### When to Upgrade
- **Exceed 100 emails/day**
- **Need advanced analytics**
- **Want dedicated IP address**
- **Require priority support** 