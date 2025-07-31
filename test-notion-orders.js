require('dotenv').config();
const notionOrdersService = require('./src/services/notionOrdersService');

async function testNotionOrders() {
  console.log('🔍 Testing Notion Orders service...\n');
  
  try {
    // Test connection
    console.log('📡 Testing connection...');
    const connectionResult = await notionOrdersService.testConnection();
    
    if (!connectionResult) {
      console.log('❌ Connection failed - check your NOTION_ORDERS_DATABASE_ID');
      return;
    }
    
    // Test creating an order
    console.log('\n📝 Testing order creation...');
    const testOrderData = {
      orderId: 'test-order-' + Date.now(),
      paymentIntentId: 'pi_test_' + Date.now(),
      customerEmail: 'bdicksmusic@gmail.com',
      customerName: 'Brandon Dicks',
      compositionId: 'test-composition-123',
      compositionTitle: 'Coming Home',
      amount: 9.99,
      price: 9.99,
      status: 'completed',
      purchaseDate: new Date().toISOString(),
      slug: 'coming-home'
    };
    
    console.log(`📋 Test order data:`, JSON.stringify(testOrderData, null, 2));
    
    const createResult = await notionOrdersService.createOrder(testOrderData);
    
    if (createResult.success) {
      console.log(`✅ Order created successfully in Notion: ${createResult.notionPageId}`);
      
      // Test retrieving the order
      console.log('\n🔍 Testing order retrieval...');
      const retrievedOrder = await notionOrdersService.getOrder(testOrderData.orderId);
      
      if (retrievedOrder) {
        console.log(`✅ Order retrieved successfully:`, JSON.stringify(retrievedOrder, null, 2));
      } else {
        console.log(`❌ Failed to retrieve order`);
      }
      
      // Test updating order status
      console.log('\n📝 Testing order status update...');
      const updateResult = await notionOrdersService.updateOrderStatus(testOrderData.orderId, 'completed');
      
      if (updateResult.success) {
        console.log(`✅ Order status updated successfully`);
      } else {
        console.log(`❌ Failed to update order status: ${updateResult.error}`);
      }
      
    } else {
      console.log(`❌ Failed to create order: ${createResult.error}`);
    }
    
  } catch (error) {
    console.log('❌ Notion Orders test failed:');
    console.log(`   - Error: ${error.message}`);
  }
}

testNotionOrders().catch(console.error); 