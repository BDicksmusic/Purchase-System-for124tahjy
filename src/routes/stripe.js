const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const notionService = require('../services/notionService');

// Create payment intent for a composition
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { compositionId, customerEmail } = req.body;

    if (!compositionId || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Composition ID and customer email are required'
      });
    }

    // Get composition data from Notion
    const composition = await notionService.getComposition(compositionId);
    if (!composition) {
      return res.status(404).json({
        success: false,
        error: 'Composition not found'
      });
    }

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent(composition, customerEmail);

    res.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      orderId: paymentIntent.orderId
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create payment link for a composition
router.post('/create-payment-link', async (req, res) => {
  try {
    const { compositionId } = req.body;

    if (!compositionId) {
      return res.status(400).json({
        success: false,
        error: 'Composition ID is required'
      });
    }

    // Get composition data from Notion
    const composition = await notionService.getComposition(compositionId);
    if (!composition) {
      return res.status(404).json({
        success: false,
        error: 'Composition not found'
      });
    }

    // Create payment link
    const paymentLink = await stripeService.createPaymentLink(composition);

    res.json({
      success: true,
      paymentLink: paymentLink.url,
      paymentLinkId: paymentLink.id
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get payment intent status
router.get('/payment-intent/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);
    
    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      }
    });

  } catch (error) {
    console.error('Error getting payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync composition with Stripe
router.post('/sync-composition', async (req, res) => {
  try {
    const { compositionId } = req.body;

    if (!compositionId) {
      return res.status(400).json({
        success: false,
        error: 'Composition ID is required'
      });
    }

    // Get composition data from Notion
    const composition = await notionService.getComposition(compositionId);
    if (!composition) {
      return res.status(404).json({
        success: false,
        error: 'Composition not found'
      });
    }

    // Sync with Stripe
    const result = await notionService.syncCompositionWithStripe(composition, stripeService);

    res.json({
      success: true,
      message: 'Composition synced with Stripe successfully',
      result
    });

  } catch (error) {
    console.error('Error syncing composition:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk sync all compositions with Stripe
router.post('/bulk-sync', async (req, res) => {
  try {
    const result = await notionService.bulkSyncWithStripe(stripeService);

    res.json({
      success: true,
      message: 'Bulk sync completed',
      result
    });

  } catch (error) {
    console.error('Error in bulk sync:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all Stripe products
router.get('/products', async (req, res) => {
  try {
    const products = await stripeService.getAllProducts();
    
    res.json({
      success: true,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        metadata: product.metadata,
        defaultPrice: product.default_price
      }))
    });

  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a Stripe product
router.delete('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    await stripeService.deleteProduct(productId);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Stripe connection
router.get('/test', async (req, res) => {
  try {
    // Test by trying to list products
    const products = await stripeService.getAllProducts();
    
    res.json({
      success: true,
      message: 'Stripe connection successful',
      productCount: products.length
    });

  } catch (error) {
    console.error('Stripe connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 