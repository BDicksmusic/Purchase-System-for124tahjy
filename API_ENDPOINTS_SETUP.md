# 🎵 BDicks Music - API Endpoints Setup Guide

## ✅ New Endpoints Added

Your webhook handler now includes two new endpoints for the dynamic confirmation page:

### 1. **Order Confirmation Endpoint**
**URL:** `GET /api/webhooks/order-confirmation`
**Purpose:** Fetches order details for the confirmation page

**Parameters:**
- `session_id` (required): Stripe Checkout session ID

**Response:**
```json
{
  "success": true,
  "order": {
    "orderId": "cs_live_...",
    "compositionTitle": "Your Composition Name",
    "compositionId": "composition_123",
    "amount": "12.99",
    "purchaseDate": "2024-01-15T10:30:00.000Z",
    "customerEmail": "customer@example.com",
    "customerName": "John Doe",
    "downloadUrl": "/api/download/composition_123"
  }
}
```

### 2. **Download Endpoint**
**URL:** `GET /api/webhooks/download/:compositionId`
**Purpose:** Serves PDF files for download

**Parameters:**
- `compositionId` (required): The composition ID

**Response:** Binary PDF file with proper headers

## 🔧 How It Works

### Order Confirmation Flow:
1. **Customer completes purchase** → Stripe redirects to your confirmation page
2. **Confirmation page loads** → JavaScript fetches order details from `/api/webhooks/order-confirmation`
3. **Order details displayed** → Customer sees their purchase information
4. **Download link provided** → Customer can download their PDF

### Data Extraction:
- **Composition Title**: Extracted from Stripe line items (product name)
- **Customer Details**: From Stripe session customer_details
- **Amount**: From session amount_total
- **PDF Path**: Retrieved from your purchase service

## 🚀 Integration Steps

### 1. Update Your External API Configuration
In your other repository, update the API URL to point to this service:

```javascript
// In your external API config
const API_BASE_URL = 'https://purchase-system-for124tahjy-production.up.railway.app/api/webhooks';
```

### 2. Test the Endpoints
Run the test script to verify everything works:

```bash
node test-order-confirmation-endpoint.js
```

### 3. Update Your Confirmation Page
Make sure your confirmation page fetches from the correct endpoint:

```javascript
// In your confirmation page JavaScript
const sessionId = new URLSearchParams(window.location.search).get('session_id');
const response = await fetch(`https://purchase-system-for124tahjy-production.up.railway.app/api/webhooks/order-confirmation?session_id=${sessionId}`);
const data = await response.json();
```

## 📋 URL Structure

Your endpoints are available at:
- **Order Confirmation**: `https://purchase-system-for124tahjy-production.up.railway.app/api/webhooks/order-confirmation?session_id=YOUR_SESSION_ID`
- **Download**: `https://purchase-system-for124tahjy-production.up.railway.app/api/webhooks/download/YOUR_COMPOSITION_ID`

## 🔍 Testing

### Test with Real Data:
1. **Get a real session ID** from your Stripe Dashboard → Payments → Checkout Sessions
2. **Update the test script** with the real session ID
3. **Run the test** to verify the endpoint works

### Expected Response:
```json
{
  "success": true,
  "order": {
    "orderId": "cs_live_actual_session_id",
    "compositionTitle": "Your Actual Composition Name",
    "compositionId": "your_actual_composition_id",
    "amount": "12.99",
    "purchaseDate": "2024-01-15T10:30:00.000Z",
    "customerEmail": "actual@customer.com",
    "customerName": "Actual Customer Name",
    "downloadUrl": "/api/download/your_actual_composition_id"
  }
}
```

## ⚠️ Important Notes

1. **Session ID Required**: The order confirmation endpoint requires a valid Stripe session ID
2. **PDF Availability**: Download links only work if the composition has a PDF file
3. **Error Handling**: Both endpoints include comprehensive error handling and logging
4. **Security**: The endpoints are part of your webhook handler, so they inherit the same security measures

## 🎯 Next Steps

1. **Test with real session ID** from your Stripe dashboard
2. **Update your external API configuration** to point to this service
3. **Deploy the updated webhook handler** to Railway
4. **Test the full flow** with a real purchase

## 📞 Support

If you encounter any issues:
1. Check the Railway logs for detailed error messages
2. Verify your Stripe session IDs are valid
3. Ensure your composition IDs match your database
4. Test the endpoints individually before integrating

---

**🎵 Your dynamic confirmation page is now ready to go!** 🎵 