# 🎵 BDicks Music - Slug-Based Composition Lookup

## ✅ **New Approach: Slug-Based Lookup**

Instead of relying on product names or line items, we now use the **slug** from your Notion database to look up composition details. This is much more reliable and accurate.

## 🔧 **How It Works:**

### **1. Stripe Checkout Setup:**
When creating Stripe Checkout sessions, include the slug in metadata:
```javascript
const session = await stripe.checkout.sessions.create({
  // ... other options ...
  metadata: {
    slug: 'your-composition-slug', // This should match your Notion database
    customerEmail: 'customer@example.com'
  }
});
```

### **2. Webhook Processing:**
The webhook handler now:
1. **Extracts the slug** from payment intent metadata
2. **Looks up the composition** in your Notion database using the slug
3. **Gets accurate details** (title, ID, price, PDF URL, etc.)
4. **Sends confirmation email** with the correct information

### **3. Notion Database Requirements:**
Your Notion database must have:
- ✅ **"Slug" property** (rich_text) - Contains the unique identifier
- ✅ **"Title" property** (title) - Composition name
- ✅ **"Price" property** (number) - Cost
- ✅ **"Status" property** (status) - Published/Draft
- ✅ **"Website Download File" property** (files) - PDF attachment

## 🚀 **Updated Webhook Handler Features:**

### **Enhanced Composition Lookup:**
- **Slug-based search**: Uses `notionService.getCompositionBySlug(slug)`
- **Accurate data**: Gets real composition details from Notion
- **PDF integration**: Automatically finds PDF files for downloads
- **Fallback support**: Still works if slug is missing

### **Improved Logging:**
```
🔍 Looking up composition by slug: your-composition-slug
✅ Found composition: Your Composition Title (ID: abc123)
📋 Payment intent metadata: {"slug": "your-composition-slug"}
✅ Required data present, sending confirmation email...
```

### **Multiple Event Support:**
- **`payment_intent.succeeded`**: Primary event with slug lookup
- **`checkout.session.completed`**: Backup event with slug lookup
- **Fallback**: Uses description if slug lookup fails

## 📋 **Implementation Steps:**

### **1. Update Your Stripe Checkout:**
Make sure your checkout creation includes the slug:
```javascript
metadata: {
  slug: composition.slug, // From your Notion database
  customerEmail: customerEmail
}
```

### **2. Test the Slug Lookup:**
Run the test script to verify it works:
```bash
node test-slug-lookup.js
```

### **3. Verify Notion Database:**
Ensure your compositions have:
- ✅ Unique slugs in the "Slug" property
- ✅ Published status
- ✅ Correct titles and prices

### **4. Test a Real Purchase:**
Make a test purchase and check the webhook logs for:
- `🔍 Looking up composition by slug: [your-slug]`
- `✅ Found composition: [title] (ID: [id])`
- `✅ Confirmation email sent to [email]`

## 🎯 **Benefits of Slug-Based Approach:**

### **✅ Accuracy:**
- **Exact matches**: Slug ensures correct composition lookup
- **No typos**: No reliance on product names or descriptions
- **Consistent data**: Always gets the latest info from Notion

### **✅ Reliability:**
- **Works with any product name**: Stripe product name can be different
- **Handles updates**: Changes in Notion are reflected automatically
- **PDF integration**: Automatically finds the correct PDF file

### **✅ Flexibility:**
- **Multiple events**: Works with both webhook event types
- **Fallback support**: Still works if slug is missing
- **Easy debugging**: Clear logs show exactly what's happening

## 📊 **Expected Webhook Flow:**

```
📨 Processing webhook event: payment_intent.succeeded
💰 Payment intent succeeded - processing...
📋 Payment intent metadata: {"slug": "your-composition-slug"}
🔍 Looking up composition by slug: your-composition-slug
✅ Found composition: Your Composition Title (ID: abc123)
✅ Required data present, sending confirmation email...
✅ Confirmation email sent to customer@example.com
```

## ⚠️ **Important Notes:**

1. **Slug must be unique** in your Notion database
2. **Slug must be included** in Stripe checkout metadata
3. **Composition must be published** in Notion
4. **Test with real slugs** from your database

## 🔍 **Troubleshooting:**

### **If slug lookup fails:**
- Check that the slug exists in your Notion database
- Verify the "Slug" property is populated
- Ensure the composition has "Published" status

### **If webhook doesn't fire:**
- Check Stripe webhook configuration
- Verify the webhook URL is correct
- Ensure all required events are selected

### **If email doesn't send:**
- Check Railway logs for detailed error messages
- Verify Mailgun configuration
- Test email service separately

---

**🎵 Your webhook handler now uses reliable slug-based lookup for accurate composition details!** 🎵 