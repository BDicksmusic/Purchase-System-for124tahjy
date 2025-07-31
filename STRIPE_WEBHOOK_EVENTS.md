# 🎵 BDicks Music - Stripe Webhook Events Guide

## 🔍 **The Issue You Discovered**

You're absolutely right! The `checkout.session.completed` event doesn't include line items by default. This is why the webhook couldn't extract the product name.

## ✅ **Solution: Listen for Multiple Events**

### **Events You Should Configure in Stripe Dashboard:**

1. **`checkout.session.completed`** - Triggers when checkout session is completed
2. **`payment_intent.succeeded`** - Triggers when payment actually succeeds (has more product info)
3. **`payment_intent.payment_failed`** - Triggers when payment fails

## 🚀 **How to Configure in Stripe Dashboard:**

### **Step 1: Go to Stripe Dashboard**
- Navigate to **Developers** → **Webhooks**
- Click **Add endpoint**

### **Step 2: Add Your Webhook URL**
```
https://purchase-system-for124tahjy-production.up.railway.app/api/webhooks/stripe
```

### **Step 3: Select Events**
Select these events:
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded` 
- ✅ `payment_intent.payment_failed`

### **Step 4: Save and Test**
- Click **Add endpoint**
- Copy the webhook signing secret to your Railway environment variables

## 🔧 **How It Works Now:**

### **Event Flow:**
1. **Customer completes purchase** → `checkout.session.completed` fires
2. **Payment processes** → `payment_intent.succeeded` fires (with product details)
3. **Webhook processes both events** → Sends confirmation email

### **Data Sources:**
- **`checkout.session.completed`**: Customer details, session info
- **`payment_intent.succeeded`**: Product description, metadata, receipt email

## 📋 **Updated Webhook Handler Features:**

### **Enhanced Debugging:**
- Logs all event types received
- Shows event data preview
- Detailed metadata logging

### **Fallback Data Extraction:**
- **Product Name**: From `payment_intent.description` if metadata missing
- **Customer Email**: From `payment_intent.receipt_email` if metadata missing
- **Composition Title**: Extracted from description or metadata

### **Multiple Event Support:**
- Handles both `checkout.session.completed` and `payment_intent.succeeded`
- Processes whichever event has the required data first

## 🎯 **Next Steps:**

1. **Update your Stripe webhook configuration** to listen for all three events
2. **Make a test purchase** to see both events fire
3. **Check the logs** to see which event provides the product information
4. **Verify confirmation emails** are sent successfully

## 📊 **Expected Log Output:**

```
📨 Processing webhook event: checkout.session.completed
🛒 Checkout session completed - processing...
📨 Processing webhook event: payment_intent.succeeded  
💰 Payment intent succeeded - processing...
📋 Payment intent description: Purchase: Your Composition Name
✅ Required data present, sending confirmation email...
```

## ⚠️ **Important Notes:**

- **Both events will fire** for each purchase
- **The webhook handler is idempotent** - won't send duplicate emails
- **Metadata is the preferred source** but fallbacks are available
- **Test with real purchases** to verify the flow works

---

**🎵 Your webhook handler is now ready to handle both events and extract product information reliably!** 🎵 