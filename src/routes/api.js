const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');

// Get composition by slug
router.get('/composition/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    console.log(`🔍 API: Looking up composition by slug: ${slug}`);
    
    const composition = await notionService.getCompositionBySlug(slug);
    
    if (composition) {
      console.log(`✅ API: Found composition: ${composition.title}`);
      res.json({
        success: true,
        composition: {
          id: composition.id,
          title: composition.title,
          slug: composition.slug,
          scoreLink: composition.pdfUrl, // This is the "Website Download File" URL
          description: composition.description,
          price: composition.price
        }
      });
    } else {
      console.log(`❌ API: No composition found for slug: ${slug}`);
      res.status(404).json({
        success: false,
        error: 'Composition not found'
      });
    }
    
  } catch (error) {
    console.error('Error getting composition by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get composition'
    });
  }
});

// Get order confirmation details
router.get('/order-confirmation', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    console.log(`🔍 API: Getting order confirmation for session: ${session_id}`);
    
    // Get session from Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'customer']
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Extract metadata
    const { slug, Slug } = session.metadata || {};
    const finalSlug = slug || Slug;
    
    let composition = null;
    if (finalSlug) {
      try {
        composition = await notionService.getCompositionBySlug(finalSlug);
      } catch (error) {
        console.log(`⚠️ Error looking up composition by slug: ${error.message}`);
      }
    }
    
    // Prepare order details
    const orderDetails = {
      orderId: session.id,
      compositionTitle: composition?.title || session.line_items?.data?.[0]?.description || 'Unknown Composition',
      amount: (session.amount_total / 100).toFixed(2),
      purchaseDate: new Date(session.created * 1000).toISOString(),
      customerEmail: session.customer_details?.email || session.customer?.email,
      downloadUrl: composition?.pdfUrl, // This is the "Website Download File" URL
      paymentStatus: session.payment_status,
      slug: finalSlug
    };
    
    console.log(`✅ API: Order details prepared:`, orderDetails);
    
    res.json({
      success: true,
      order: orderDetails
    });
    
  } catch (error) {
    console.error('Error getting order confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get order confirmation'
    });
  }
});

module.exports = router; 