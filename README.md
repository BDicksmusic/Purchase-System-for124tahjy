# Stripe Purchasing System

A comprehensive automated purchasing system for sheet music with Stripe integration, email automation, and Notion database synchronization.

## 🚀 Features

- **Stripe Payment Processing**: Secure payment handling with webhook support
- **Email Automation**: Automatic PDF delivery with professional email templates
- **Notion Integration**: Sync composition data and pricing from Notion database
- **Purchase Management**: Complete purchase tracking and customer management
- **Admin Dashboard**: Comprehensive admin interface for system management
- **PDF Storage**: Secure PDF storage and delivery system
- **Webhook Handling**: Real-time payment event processing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stripe account with API keys
- Email service (Gmail, SendGrid, or Mailgun)
- Notion API access
- PDF files for compositions

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stripe-purchasing-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here
   EMAIL_FROM=your_email@gmail.com

   # Notion Integration
   NOTION_API_KEY=your_notion_api_key_here
   NOTION_DATABASE_ID=your_notion_database_id_here

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Create necessary directories**
   ```bash
   mkdir -p storage/pdfs/compositions
   mkdir -p data
   ```

## 🚀 Quick Start

1. **Start the server**
   ```bash
   npm start
   ```

2. **Test the system**
   ```bash
   # Test email configuration
   curl http://localhost:3000/api/email/test

   # Test Stripe connection
   curl http://localhost:3000/api/stripe/test

   # Test Notion connection
   curl http://localhost:3000/api/notion/test
   ```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `EMAIL_PASS`

### SendGrid Setup
1. Create a SendGrid account
2. Get your API key
3. Add `SENDGRID_API_KEY=your_api_key` to `.env`

### Mailgun Setup
1. Create a Mailgun account
2. Get your API key and domain
3. Add to `.env`:
   ```env
   MAILGUN_API_KEY=your_api_key
   MAILGUN_DOMAIN=your_domain
   ```

## 💳 Stripe Setup

1. **Create a Stripe account**
2. **Get your API keys** from the Stripe dashboard
3. **Set up webhooks**:
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## 📝 Notion Setup

1. **Create a Notion integration**:
   - Go to https://www.notion.so/my-integrations
   - Create a new integration
   - Copy the API key to `NOTION_API_KEY`

2. **Share your database**:
   - Open your compositions database
   - Click "Share" and add your integration
   - Copy the database ID to `NOTION_DATABASE_ID`

3. **Database structure** (recommended):
   - Title (title)
   - Description (rich_text)
   - Price (number)
   - Status (select: Published, Draft)
   - Category (select)
   - Difficulty (select)
   - Composer (rich_text)
   - PDF URL (url)
   - Image URL (url)

## 📁 File Structure

```
stripe-purchasing-system/
├── src/
│   ├── services/
│   │   ├── stripeService.js      # Stripe payment processing
│   │   ├── emailService.js       # Email automation
│   │   ├── notionService.js      # Notion database integration
│   │   └── purchaseService.js    # Purchase management
│   ├── routes/
│   │   ├── stripe.js            # Stripe API endpoints
│   │   ├── email.js             # Email management
│   │   ├── notion.js            # Notion API endpoints
│   │   ├── webhooks.js          # Webhook handlers
│   │   └── admin.js             # Admin dashboard
│   ├── templates/
│   │   └── emails/
│   │       └── purchase-confirmation.hbs
│   └── index.js                 # Main server file
├── storage/
│   └── pdfs/
│       └── compositions/        # PDF storage
├── data/
│   └── purchases.json           # Purchase records
├── package.json
├── env.example
└── README.md
```

## 🔧 API Endpoints

### Stripe Routes
- `POST /api/stripe/create-payment-intent` - Create payment intent
- `POST /api/stripe/create-payment-link` - Create payment link
- `GET /api/stripe/payment-intent/:id` - Get payment status
- `POST /api/stripe/sync-composition` - Sync composition with Stripe
- `POST /api/stripe/bulk-sync` - Bulk sync all compositions

### Email Routes
- `GET /api/email/test` - Test email configuration
- `POST /api/email/test` - Send test email
- `GET /api/email/config` - Get email configuration
- `GET /api/email/templates` - List email templates

### Notion Routes
- `GET /api/notion/compositions` - Get all compositions
- `GET /api/notion/compositions/:id` - Get specific composition
- `PATCH /api/notion/compositions/:id/price` - Update composition price
- `GET /api/notion/test` - Test Notion connection

### Admin Routes
- `GET /api/admin/purchases` - Get all purchases
- `GET /api/admin/stats` - Get system statistics
- `POST /api/admin/backup` - Backup purchase data
- `GET /api/admin/test-connections` - Test all connections

### Webhook Routes
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/test` - Test webhook processing

## 📊 Purchase Flow

1. **Customer initiates purchase**
   - Frontend calls `/api/stripe/create-payment-intent`
   - Returns client secret for Stripe Elements

2. **Payment processing**
   - Customer completes payment on frontend
   - Stripe sends webhook to `/api/webhooks/stripe`

3. **Webhook processing**
   - System creates purchase record
   - Sends confirmation email with PDF
   - Sends admin notification

4. **Email delivery**
   - Professional HTML email template
   - PDF attachment included
   - Download link provided

## 🔄 Notion Sync

### Automatic Sync
- When prices change in Notion, they automatically update in Stripe
- New compositions are automatically created as Stripe products
- Bulk sync available for initial setup

### Manual Sync
```bash
# Sync all compositions
curl -X POST http://localhost:3000/api/stripe/bulk-sync

# Sync specific composition
curl -X POST http://localhost:3000/api/stripe/sync-composition \
  -H "Content-Type: application/json" \
  -d '{"compositionId": "your_composition_id"}'
```

## 📈 Admin Dashboard

Access admin features at `/api/admin/`:

- **Purchase Management**: View and manage all purchases
- **Statistics**: Revenue, customer, and composition stats
- **System Health**: Monitor all service connections
- **Backup & Cleanup**: Data management tools
- **Email Management**: Test and manage email templates

## 🔒 Security Features

- **Webhook signature verification** for Stripe events
- **Rate limiting** on API endpoints
- **Input validation** on all endpoints
- **Error handling** with detailed logging
- **Secure PDF storage** with access controls

## 🚀 Deployment

### Environment Variables
Set these in production:
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://yourdomain.com/admin
SUPPORT_EMAIL=support@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start src/index.js --name "purchasing-system"
pm2 save
pm2 startup
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check email configuration in `.env`
   - Verify SMTP settings
   - Test with `/api/email/test`

2. **Stripe webhooks not working**
   - Verify webhook URL is correct
   - Check webhook secret in `.env`
   - Test webhook signature verification

3. **Notion sync issues**
   - Verify API key and database ID
   - Check database permissions
   - Test connection with `/api/notion/test`

4. **PDF not found**
   - Ensure PDF files are in `storage/pdfs/compositions/`
   - Check file naming: `{compositionId}.pdf`
   - Verify file permissions

### Logs
Check logs for detailed error information:
```bash
# View application logs
pm2 logs purchasing-system

# View specific error logs
pm2 logs purchasing-system --err
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@yourdomain.com
- Documentation: [Link to docs]
- Issues: [GitHub issues]

---

**Note**: This system is designed to be easily moved to a separate repository. Simply copy the entire directory to your desired location and update any necessary configuration. 