# Download Time Restrictions

## 🔓 **Current Status: NO Time Restrictions**

By default, the file downloads are **NOT restricted by time**. Customers can download their purchased sheet music files indefinitely.

## ⚙️ **Optional Time-Based Security**

I've added **optional** time-based restrictions that you can enable if desired:

### **How It Works:**

1. **Email contains time-limited link** with token and expiration
2. **API validates token and expiration** before serving file
3. **Expired links return 410 error** with "Download link has expired"

### **Current Settings:**
- **Expiration Time**: 24 hours from purchase
- **Token Format**: Base64 encoded `orderId-expirationTime`
- **Grace Period**: None (strict expiration)

## 📧 **Email Link Format:**

**Without restrictions:**
```
https://your-domain.com/api/notion/compositions/slug/coming-home/file
```

**With time restrictions:**
```
https://your-domain.com/api/notion/compositions/slug/coming-home/file?token=base64token&expires=1735689600000
```

## 🛡️ **Security Benefits:**

1. **Prevents link sharing** - Links expire after 24 hours
2. **Reduces unauthorized access** - Time-limited access
3. **Protects your content** - Customers can't share permanent links

## ⚠️ **Customer Experience:**

### **Pros:**
- ✅ **Security**: Prevents unauthorized access
- ✅ **Control**: You control download access
- ✅ **Protection**: Reduces piracy risk

### **Cons:**
- ❌ **Inconvenience**: Customers must download within 24 hours
- ❌ **Support requests**: More customer service needed
- ❌ **Lost sales**: Customers might miss the window

## 🔧 **Customization Options:**

### **Change Expiration Time:**
```javascript
// In emailService.js, line ~265
const downloadExpires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
// Change to:
const downloadExpires = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
```

### **Disable Time Restrictions:**
```javascript
// In emailService.js, remove the token generation:
downloadLink: purchaseData.pdfUrl ? 
  `${process.env.WEBSITE_URL}/api/notion/compositions/slug/${purchaseData.slug}/file` : 
  // ... rest of code
```

### **Add Grace Period:**
```javascript
// In notion.js, add grace period:
if (now > expirationTime + (60 * 60 * 1000)) { // 1 hour grace
  return res.status(410).json({...});
}
```

## 📊 **Recommendation:**

### **For Most Businesses:**
- **Keep time restrictions OFF** for better customer experience
- **Focus on quality content** rather than artificial restrictions
- **Use watermarking** if piracy is a concern

### **For High-Value Content:**
- **Enable 24-hour restrictions** for security
- **Add watermarking** to PDFs
- **Monitor download patterns**

## 🎵 **Current Implementation:**

The system is set up with **optional time restrictions** that are **disabled by default**. This gives you the flexibility to:

1. **Start without restrictions** for better UX
2. **Enable restrictions later** if needed
3. **Customize expiration times** as needed

**The choice is yours!** 🎵 