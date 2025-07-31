# 🔗 External API Slug Integration Guide

## **🎯 Overview**

This guide shows you how to update your external Stripe API to include the composition slug in the success URL, enabling immediate composition lookup on the confirmation page.

## **🔄 Current vs New Flow**

### **Current Flow:**
```
External API → Stripe Checkout → Confirmation Page → External API → Stripe Session → Notion Lookup
```

### **New Flow:**
```
External API → Stripe Checkout → Confirmation Page → Direct Notion Lookup (via slug)
```

## **📝 Code Changes Needed**

### **Step 1: Update Your External Stripe API**

In your external Stripe API, modify the checkout session creation to include the slug in the success URL:

```javascript
// In your external Stripe API
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: compositionTitle,
        description: compositionDescription,
      },
      unit_amount: priceInCents,
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${req.headers.origin}/confirmation.html?session_id={CHECKOUT_SESSION_ID}&slug=${compositionSlug}`,
  cancel_url: `${req.headers.origin}/cancel.html`,
  metadata: {
    compositionId: compositionId,
    compositionTitle: compositionTitle,
    slug: compositionSlug, // Include slug in metadata too
    Slug: compositionSlug, // Include both cases for compatibility
  },
});
```

### **Step 2: Extract Slug from Your Data**

Make sure you have the slug available when creating the checkout session:

```javascript
// Example: Getting slug from your data source
const composition = {
  id: 'notion-page-id',
  title: 'Coming Home',
  slug: 'coming-home', // This is what we need
  price: 50.00,
  description: 'A beautiful composition...'
};

const compositionSlug = composition.slug; // Extract the slug
```

## **🎯 Benefits of This Approach**

### **✅ Immediate Data Access**
- No waiting for webhook processing
- No race conditions
- Real composition data immediately available

### **✅ No Stripe Dependency**
- Confirmation page doesn't need to call Stripe API
- Works even if Stripe is temporarily unavailable
- Faster page load

### **✅ Better User Experience**
- Instant composition details
- Immediate download link
- No generic "loading" state

### **✅ Fallback Support**
- Still works with session_id only
- Graceful degradation
- Backward compatible

## **🧪 Testing the Integration**

### **Test URL Format:**
```
https://yourdomain.com/confirmation.html?session_id=cs_live_xxx&slug=coming-home
```

### **Test Steps:**
1. **Create a test purchase** with slug in success URL
2. **Verify confirmation page** shows correct composition
3. **Check download link** points to correct PDF
4. **Test fallback** by removing slug parameter

## **📊 Expected Results**

### **With Slug:**
- ✅ Immediate composition title
- ✅ Correct download link
- ✅ Real composition data
- ✅ Professional confirmation page

### **Without Slug (Fallback):**
- ✅ Generic confirmation page
- ✅ Still functional
- ✅ No errors

## **🔧 Implementation Checklist**

### **External API Updates:**
- [ ] Extract slug from composition data
- [ ] Include slug in success_url
- [ ] Add slug to metadata
- [ ] Test with real purchases

### **Confirmation Page:**
- [ ] ✅ Updated to use slug parameter
- [ ] ✅ Added composition API endpoint
- [ ] ✅ Implemented fallback logic
- [ ] ✅ Enhanced error handling

### **Testing:**
- [ ] Test with slug parameter
- [ ] Test without slug parameter
- [ ] Test composition API endpoint
- [ ] Verify download links work

## **🚀 Production Deployment**

### **Environment Variables:**
Make sure these are set in your external API:
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_compositions_database_id
```

### **URL Configuration:**
Update your success URL to include the slug:
```javascript
success_url: `${req.headers.origin}/confirmation.html?session_id={CHECKOUT_SESSION_ID}&slug=${compositionSlug}`,
```

## **🎵 Result**

Once implemented, your confirmation page will:
- ✅ Show real composition details immediately
- ✅ Provide direct download links
- ✅ Work without Stripe API calls
- ✅ Handle errors gracefully
- ✅ Provide professional user experience

**This eliminates the race condition and provides instant, accurate order details!** 🎵 