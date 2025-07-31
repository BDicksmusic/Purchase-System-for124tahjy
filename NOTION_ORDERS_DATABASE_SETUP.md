# 📊 Notion Orders Database Setup Guide

## **🎯 Overview**

This guide will help you set up a Notion database to log all orders from your Stripe purchasing system. This will give you a complete audit trail of all purchases.

## **📋 Database Properties**

Create a new database in Notion with the following properties:

### **Required Properties:**

1. **Order ID** (Title)
   - Type: Title
   - Description: Unique order identifier from Stripe

2. **Customer Email** (Email)
   - Type: Email
   - Description: Customer's email address

3. **Customer Name** (Text)
   - Type: Text
   - Description: Customer's name

4. **Composition** (Text)
   - Type: Text
   - Description: Name of the purchased composition

5. **Amount** (Number)
   - Type: Number
   - Format: Currency
   - Description: Purchase amount

6. **Status** (Select)
   - Type: Select
   - Options: `completed`, `failed`, `pending`, `refunded`
   - Description: Order status

7. **Purchase Date** (Date)
   - Type: Date
   - Description: Date of purchase

### **Optional Properties:**

8. **Payment Intent ID** (Text)
   - Type: Text
   - Description: Stripe payment intent ID

9. **Composition ID** (Text)
   - Type: Text
   - Description: Notion composition ID (for linking)

10. **Slug** (Text)
    - Type: Text
    - Description: Composition slug for reference

## **🔧 Setup Steps**

### **Step 1: Create the Database**

1. **Open Notion** and create a new page
2. **Type `/database`** and select "Table - Full page"
3. **Name it** "BDicks Music Orders" or similar
4. **Add the properties** listed above

### **Step 2: Configure Properties**

1. **Order ID**: Set as the primary title property
2. **Status**: Add the select options (`completed`, `failed`, `pending`, `refunded`)
3. **Amount**: Set to currency format
4. **Purchase Date**: Set to date format

### **Step 3: Get Database ID**

1. **Open the database** in Notion
2. **Copy the URL** from your browser
3. **Extract the database ID** (the part between the last `/` and `?` or `v`)
4. **Add to your `.env` file**:
   ```
   NOTION_ORDERS_DATABASE_ID=your_database_id_here
   ```

### **Step 4: Share with Integration**

1. **Click "Share"** in the top right of the database
2. **Click "Invite"** and search for your integration name
3. **Select your integration** and click "Invite"
4. **Grant access** to the database

## **📊 Database Views**

### **Recommended Views:**

1. **All Orders** (Default)
   - Shows all orders with key information

2. **Recent Orders**
   - Filter: Purchase Date is in the last 30 days
   - Sort: Purchase Date (newest first)

3. **Completed Orders**
   - Filter: Status is "completed"
   - Sort: Purchase Date (newest first)

4. **Failed Orders**
   - Filter: Status is "failed"
   - Sort: Purchase Date (newest first)

## **🔗 Integration with Compositions**

### **Linking to Compositions Database:**

If you want to link orders to your compositions database:

1. **Add a Relation property** to the orders database
2. **Name it** "Composition"
3. **Select your compositions database** as the related database
4. **Update the code** to include the relation

### **Manual Linking:**

You can manually link orders to compositions using the **Composition ID** field, which stores the Notion page ID of the composition.

## **📈 Analytics & Reporting**

### **Built-in Notion Analytics:**

1. **Total Revenue**: Sum the Amount column
2. **Orders by Status**: Group by Status
3. **Orders by Composition**: Group by Composition
4. **Revenue by Date**: Group by Purchase Date

### **Custom Reports:**

1. **Monthly Revenue**: Create a view filtered by date range
2. **Top Selling Compositions**: Group by Composition, sort by count
3. **Customer Analysis**: Group by Customer Email

## **🔧 Testing the Integration**

### **Test the Setup:**

```bash
node test-notion-orders.js
```

This will:
- ✅ Test connection to the database
- ✅ Create a test order
- ✅ Retrieve the test order
- ✅ Update the order status

### **Expected Output:**

```
🔍 Testing Notion Orders service...

📡 Testing connection...
✅ Notion Orders service connection successful
📊 Database contains 0 orders

📝 Testing order creation...
📋 Test order data: { ... }
✅ Order created successfully in Notion: abc123-def456

🔍 Testing order retrieval...
✅ Order retrieved successfully: { ... }

📝 Testing order status update...
✅ Order status updated successfully
```

## **🚀 Production Deployment**

### **Environment Variables:**

Make sure these are set in your production environment:

```bash
NOTION_API_KEY=your_notion_api_key
NOTION_ORDERS_DATABASE_ID=your_orders_database_id
```

### **Webhook Integration:**

The webhook system will automatically:
- ✅ Log successful orders to Notion
- ✅ Log failed orders to Notion
- ✅ Update order status when needed
- ✅ Include all relevant order data

## **📊 Expected Data Flow**

### **Successful Purchase:**
1. Customer completes payment
2. Stripe webhook fires
3. Order logged to Notion with status "completed"
4. Confirmation email sent
5. Admin notification sent

### **Failed Purchase:**
1. Payment fails
2. Stripe webhook fires
3. Order logged to Notion with status "failed"
4. Failure notification sent to customer
5. Admin notification sent

## **🎵 Result**

You'll have a complete audit trail of all orders in Notion, including:
- ✅ All successful purchases
- ✅ All failed payments
- ✅ Customer information
- ✅ Composition details
- ✅ Payment amounts
- ✅ Timestamps
- ✅ Status tracking

**This gives you full visibility into your music business!** 🎵 