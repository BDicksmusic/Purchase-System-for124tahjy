const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');
const purchaseService = require('../services/purchaseService');
const notionService = require('../services/notionService');
const notionOrdersService = require('../services/notionOrdersService');

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripeService.verifyWebhookSignature(req.body, sig);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    // Log the event type for debugging
    console.log(`📨 Processing webhook event: ${event.type}`);
    console.log(`📋 Event data preview:`, JSON.stringify(event.data.object, null, 2).substring(0, 500) + '...');
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log(`💰 Payment intent succeeded - processing...`);
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        console.log(`❌ Payment intent failed - processing...`);
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'checkout.session.completed':
        console.log(`🛒 Checkout session completed - processing...`);
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'charge.succeeded':
        console.log(`💳 Charge succeeded - skipping (handled by checkout.session.completed)`);
        // Skip charge.succeeded to avoid duplicate processing
        break;
      
      case 'invoice.payment_succeeded':
        console.log(`📄 Invoice payment succeeded - processing...`);
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
        console.log(`📋 Full event data:`, JSON.stringify(event, null, 2));
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Handle OAuth-related errors specifically
    if (error.code === 'resource_missing' && error.message.includes('oauthTokenSet')) {
      console.log('⚠️ OAuth token error - this may be from an old webhook event');
      return res.json({ received: true }); // Acknowledge to prevent retries
    }
    
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
    console.log(`📋 Payment intent metadata:`, JSON.stringify(paymentIntent.metadata, null, 2));
    console.log(`📋 Payment intent description:`, paymentIntent.description);
    console.log(`📋 Payment intent receipt_email:`, paymentIntent.receipt_email);
    
    // Additional verification - ensure payment is actually successful
    if (paymentIntent.status !== 'succeeded') {
      console.log(`⚠️ Payment intent status is ${paymentIntent.status}, not 'succeeded'`);
      return;
    }

    const {
      compositionId,
      compositionTitle,
      customerEmail,
      orderId,
      slug,
      Slug
    } = paymentIntent.metadata;
    
    // Handle both lowercase and uppercase slug
    const finalSlug = slug || Slug;

    // Try to get customer email from receipt_email if not in metadata
    const finalCustomerEmail = customerEmail || paymentIntent.receipt_email;
    
    // If we have a slug, look up the composition from Notion
    let composition = null;
    let finalCompositionTitle = compositionTitle;
    let finalCompositionId = compositionId;
    
    if (finalSlug) {
      try {
        console.log(`🔍 Looking up composition by slug: ${finalSlug}`);
        composition = await notionService.getCompositionBySlug(finalSlug);
        
        if (composition) {
          finalCompositionTitle = composition.title;
          finalCompositionId = composition.id;
          console.log(`✅ Found composition: ${finalCompositionTitle} (ID: ${finalCompositionId})`);
        } else {
          console.log(`⚠️ No composition found for slug: ${finalSlug}`);
        }
      } catch (error) {
        console.log(`❌ Error looking up composition by slug: ${error.message}`);
      }
    }
    
    // Fallback to description if no composition found
    if (!finalCompositionTitle) {
      finalCompositionTitle = paymentIntent.description?.replace('Purchase: ', '') || 'Unknown Composition';
    }

    // Verify required metadata exists - only require compositionTitle and customerEmail
    if (!finalCompositionTitle || !finalCustomerEmail) {
      console.log('❌ Missing required metadata for payment success');
      console.log(`   - compositionTitle: ${finalCompositionTitle ? 'present' : 'missing'}`);
      console.log(`   - customerEmail: ${finalCustomerEmail ? 'present' : 'missing'}`);
      console.log(`   - slug: ${finalSlug || 'not provided'}`);
      console.log(`   - Original metadata:`, JSON.stringify(paymentIntent.metadata, null, 2));
      return;
    }

    // Create purchase record
    const purchaseData = {
      orderId: orderId || paymentIntent.id,
      paymentIntentId: paymentIntent.id,
      customerEmail: finalCustomerEmail,
      customerName: paymentIntent.receipt_email || finalCustomerEmail,
      compositionId: finalCompositionId || `product_${Date.now()}`, // Use Notion ID if found, otherwise fallback
      compositionTitle: finalCompositionTitle,
      amount: paymentIntent.amount / 100, // Convert from cents
      status: 'completed',
      purchaseDate: new Date().toISOString()
    };

    // Save purchase record
    await purchaseService.createPurchase(purchaseData);

    // Get PDF URL from Notion composition if available
    let pdfUrl = null;
    if (finalCompositionId && finalCompositionId !== `product_${Date.now()}`) {
      try {
        // Get the composition from Notion to get the PDF URL
        if (composition && composition.pdfUrl) {
          pdfUrl = composition.pdfUrl; // This is the "Website Download File" URL from Notion
          console.log(`✅ Got PDF URL from Notion: ${pdfUrl}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not get PDF URL from Notion:`, error.message);
      }
    }

    // Send confirmation email with PDF
    await emailService.sendPurchaseConfirmation({
      ...purchaseData,
      pdfUrl, // Pass the Notion file URL
      price: purchaseData.amount
    });

    // Send admin notification
    await emailService.sendAdminNotification(purchaseData);

    // Log order to Notion
    const orderLogResult = await notionOrdersService.createOrder({
      ...purchaseData,
      slug: finalSlug
    });
    
    if (orderLogResult.success) {
      console.log(`📝 Order logged to Notion: ${orderLogResult.notionPageId}`);
    } else {
      console.log(`⚠️ Failed to log order to Notion: ${orderLogResult.error}`);
    }

    console.log(`✅ Purchase processed successfully for ${finalCompositionTitle}`);
    
  } catch (error) {
    console.error('Error handling payment success:', error);
    // Don't throw error to avoid webhook retry loops
  }
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent) {
  try {
    console.log(`❌ Payment failed: ${paymentIntent.id}`);
    
    const {
      compositionId,
      compositionTitle,
      customerEmail,
      orderId
    } = paymentIntent.metadata;

    // Only require compositionTitle and customerEmail for failure handling
    if (!compositionTitle || !customerEmail) {
      console.log('❌ Missing required metadata for payment failure handling');
      console.log(`   - compositionTitle: ${compositionTitle ? 'present' : 'missing'}`);
      console.log(`   - customerEmail: ${customerEmail ? 'present' : 'missing'}`);
      return;
    }

    // Create failed purchase record
    const purchaseData = {
      orderId: orderId || paymentIntent.id,
      paymentIntentId: paymentIntent.id,
      customerEmail,
      customerName: paymentIntent.receipt_email || customerEmail,
      compositionId: compositionId || `product_${Date.now()}`, // Generate fallback ID if not provided
      compositionTitle,
      amount: paymentIntent.amount / 100,
      status: 'failed',
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      purchaseDate: new Date().toISOString()
    };

    // Save failed purchase record
    await purchaseService.createPurchase(purchaseData);

    // Send payment failure notification to customer
    if (customerEmail) {
      await emailService.sendPaymentFailureNotification(purchaseData);
    }

    // Send admin notification about failed payment
    await emailService.sendAdminNotification({
      ...purchaseData,
      subject: `Payment Failed - ${compositionTitle}`,
      message: `Payment failed for ${compositionTitle}. Customer: ${customerEmail}. Error: ${purchaseData.failureReason}`
    });

    console.log(`❌ Payment failure processed for ${compositionTitle} - customer notified`);
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle checkout session completion
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log(`🛒 Checkout session completed: ${session.id}`);
    console.log(`📋 Session metadata:`, JSON.stringify(session.metadata, null, 2));
    console.log(`👤 Customer details:`, JSON.stringify(session.customer_details, null, 2));
    console.log(`🛍️ Line items:`, JSON.stringify(session.line_items, null, 2));
    
    // If line_items is undefined, retrieve the full session from Stripe
    let fullSession = session;
    if (!session.line_items) {
      console.log(`🔄 Line items missing, retrieving full session from Stripe...`);
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items']
      });
      console.log(`📦 Retrieved full session with line items:`, JSON.stringify(fullSession.line_items, null, 2));
    }
    
    // Get product name from line items (this is the composition title)
    const productName = fullSession.line_items?.data?.[0]?.description || 
                       fullSession.line_items?.data?.[0]?.price_data?.product_data?.name ||
                       fullSession.line_items?.data?.[0]?.price?.product?.name;
    
    // Try to get compositionId and slug from metadata
    const compositionId = session.metadata?.compositionId;
    const slug = session.metadata?.slug;
    const Slug = session.metadata?.Slug;
    let compositionTitle = session.metadata?.compositionTitle || productName;
    let finalCompositionId = compositionId;
    
    // Handle both lowercase and uppercase slug
    const finalSlug = slug || Slug;
    
    const customerEmail = session.customer_details?.email;
    const orderId = session.metadata?.orderId || session.id;

    // If we have a slug, look up the composition from Notion
    if (finalSlug) {
      try {
        console.log(`🔍 Looking up composition by slug: ${finalSlug}`);
        const composition = await notionService.getCompositionBySlug(finalSlug);
        
        if (composition) {
          compositionTitle = composition.title;
          finalCompositionId = composition.id;
          console.log(`✅ Found composition: ${compositionTitle} (ID: ${finalCompositionId})`);
        } else {
          console.log(`⚠️ No composition found for slug: ${finalSlug}`);
        }
      } catch (error) {
        console.log(`❌ Error looking up composition by slug: ${error.message}`);
      }
    }

    console.log(`🔍 Extracted data:`);
    console.log(`   - productName: ${productName}`);
    console.log(`   - slug: ${finalSlug || 'not provided'}`);
    console.log(`   - compositionId: ${finalCompositionId || 'not provided'}`);
    console.log(`   - compositionTitle: ${compositionTitle}`);
    console.log(`   - customerEmail: ${customerEmail}`);
    console.log(`   - orderId: ${orderId}`);

    if (customerEmail && compositionTitle) {
      console.log(`✅ Required data present, sending confirmation email...`);
      
      const purchaseData = {
        orderId,
        paymentIntentId: session.payment_intent,
        customerEmail,
        customerName: session.customer_details?.name || customerEmail,
        compositionId: finalCompositionId || `product_${Date.now()}`, // Use Notion ID if found, otherwise fallback
        compositionTitle,
        amount: session.amount_total / 100,
        status: 'completed',
        purchaseDate: new Date().toISOString()
      };

      await purchaseService.createPurchase(purchaseData);

      // Get PDF URL from Notion composition if available
      let pdfUrl = null;
      if (finalCompositionId && finalCompositionId !== `product_${Date.now()}`) {
        try {
          // Get the composition from Notion to get the PDF URL
          const composition = await notionService.getCompositionBySlug(finalSlug);
          if (composition && composition.pdfUrl) {
            pdfUrl = composition.pdfUrl; // This is the "Website Download File" URL from Notion
            console.log(`✅ Got PDF URL from Notion: ${pdfUrl}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not get PDF URL from Notion:`, error.message);
        }
      }

      await emailService.sendPurchaseConfirmation({
        ...purchaseData,
        pdfUrl, // Pass the Notion file URL
        price: purchaseData.amount
      });

      await emailService.sendAdminNotification(purchaseData);
      
      // Log order to Notion
      const orderLogResult = await notionOrdersService.createOrder({
        ...purchaseData,
        slug: finalSlug
      });
      
      if (orderLogResult.success) {
        console.log(`📝 Order logged to Notion: ${orderLogResult.notionPageId}`);
      } else {
        console.log(`⚠️ Failed to log order to Notion: ${orderLogResult.error}`);
      }
      
      console.log(`✅ Confirmation email sent to ${customerEmail}`);
    } else {
      console.log(`❌ Missing required data for email confirmation:`);
      console.log(`   - customerEmail: ${customerEmail ? 'present' : 'missing'}`);
      console.log(`   - compositionTitle: ${compositionTitle ? 'present' : 'missing'}`);
    }
    
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

// Handle charge success
async function handleChargeSucceeded(charge) {
  try {
    console.log(`💳 Charge succeeded: ${charge.id}`);
    console.log(`📋 Charge metadata:`, JSON.stringify(charge.metadata, null, 2));
    console.log(`📋 Charge description:`, charge.description);
    console.log(`📋 Charge receipt_email:`, charge.receipt_email);
    
    // Get the payment intent to access its metadata
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
    
    console.log(`📋 Payment intent metadata:`, JSON.stringify(paymentIntent.metadata, null, 2));
    
    const {
      compositionId,
      compositionTitle,
      customerEmail,
      orderId,
      slug,
      Slug
    } = paymentIntent.metadata;
    
    // Handle both lowercase and uppercase slug
    const finalSlug = slug || Slug;
    
    // Try to get customer email from receipt_email if not in metadata
    const finalCustomerEmail = customerEmail || charge.receipt_email;
    
    // If we have a slug, look up the composition from Notion
    let composition = null;
    let finalCompositionTitle = compositionTitle;
    let finalCompositionId = compositionId;
    
    if (finalSlug) {
      try {
        console.log(`🔍 Looking up composition by slug: ${finalSlug}`);
        composition = await notionService.getCompositionBySlug(finalSlug);
        
        if (composition) {
          finalCompositionTitle = composition.title;
          finalCompositionId = composition.id;
          console.log(`✅ Found composition: ${finalCompositionTitle} (ID: ${finalCompositionId})`);
        } else {
          console.log(`⚠️ No composition found for slug: ${finalSlug}`);
        }
      } catch (error) {
        console.log(`❌ Error looking up composition by slug: ${error.message}`);
      }
    }
    
    // Fallback to description if no composition found
    if (!finalCompositionTitle) {
      finalCompositionTitle = charge.description?.replace('Purchase: ', '') || 'Unknown Composition';
    }

    // Verify required metadata exists - only require compositionTitle and customerEmail
    if (!finalCompositionTitle || !finalCustomerEmail) {
      console.log('❌ Missing required metadata for charge success');
      console.log(`   - compositionTitle: ${finalCompositionTitle ? 'present' : 'missing'}`);
      console.log(`   - customerEmail: ${finalCustomerEmail ? 'present' : 'missing'}`);
      console.log(`   - slug: ${finalSlug || 'not provided'}`);
      console.log(`   - Original metadata:`, JSON.stringify(paymentIntent.metadata, null, 2));
      return;
    }

    // Create purchase record
    const purchaseData = {
      orderId: orderId || charge.id,
      paymentIntentId: charge.payment_intent,
      customerEmail: finalCustomerEmail,
      customerName: charge.receipt_email || finalCustomerEmail,
      compositionId: finalCompositionId || `product_${Date.now()}`, // Use Notion ID if found, otherwise fallback
      compositionTitle: finalCompositionTitle,
      amount: charge.amount / 100, // Convert from cents
      status: 'completed',
      purchaseDate: new Date().toISOString()
    };

    // Save purchase record
    await purchaseService.createPurchase(purchaseData);

    // Get PDF URL from Notion composition if available
    let pdfUrl = null;
    if (finalCompositionId && finalCompositionId !== `product_${Date.now()}`) {
      try {
        // Get the composition from Notion to get the PDF URL
        if (composition && composition.pdfUrl) {
          pdfUrl = composition.pdfUrl; // This is the "Website Download File" URL from Notion
          console.log(`✅ Got PDF URL from Notion: ${pdfUrl}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not get PDF URL from Notion:`, error.message);
      }
    }

    // Send confirmation email with PDF
    await emailService.sendPurchaseConfirmation({
      ...purchaseData,
      pdfUrl, // Pass the Notion file URL
      price: purchaseData.amount
    });

    // Send admin notification
    await emailService.sendAdminNotification(purchaseData);

    console.log(`✅ Charge processed successfully for ${finalCompositionTitle}`);
    
  } catch (error) {
    console.error('Error handling charge success:', error);
    // Don't throw error to avoid webhook retry loops
  }
}

// Handle invoice payment success
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log(`📄 Invoice payment succeeded: ${invoice.id}`);
    
    // Handle subscription or recurring payments if needed
    // This is for future subscription features
    
  } catch (error) {
    console.error('Error handling invoice payment:', error);
  }
}

// Test webhook endpoint
router.post('/test', async (req, res) => {
  try {
    const testData = {
      customerEmail: 'test@example.com',
      customerName: 'Test Customer',
      compositionTitle: 'Test Composition',
      orderId: 'test-order-123',
      purchaseDate: new Date().toISOString(),
      price: 9.99
    };

    // Test email sending
    const emailResult = await emailService.sendPurchaseConfirmation(testData);
    
    res.json({
      success: true,
      message: 'Test webhook processed successfully',
      emailResult
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    webhooks: {
      stripe: 'active',
      email: 'active'
    }
  });
});

// Order confirmation endpoint for dynamic confirmation page
router.get('/order-confirmation', async (req, res) => {
  const { session_id } = req.query;
  
  if (!session_id) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required'
    });
  }
  
  try {
    console.log(`🔍 Fetching order details for session: ${session_id}`);
    
    // Get session from Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    console.log(`📋 Session data:`, JSON.stringify(session, null, 2));
    
    // Extract composition details from session
    const compositionTitle = session.line_items?.data?.[0]?.description || 
                           session.line_items?.data?.[0]?.price_data?.product_data?.name ||
                           'Unknown Composition';
    
    const compositionId = session.metadata?.compositionId;
    
    // Try to get PDF path if compositionId is available
    let downloadUrl = null;
    if (compositionId) {
      try {
        const pdfPath = await purchaseService.getCompositionPdfPath(compositionId);
        if (pdfPath) {
          // Generate a download URL (you might need to adjust this based on your file serving setup)
          downloadUrl = `/api/download/${compositionId}`;
        }
      } catch (error) {
        console.log(`⚠️ Could not get PDF path for compositionId ${compositionId}:`, error.message);
      }
    }
    
    const orderDetails = {
      orderId: session.id,
      compositionTitle,
      compositionId: compositionId || 'unknown',
      amount: (session.amount_total / 100).toFixed(2),
      purchaseDate: new Date(session.created * 1000).toISOString(),
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      downloadUrl
    };
    
    console.log(`✅ Order details prepared:`, JSON.stringify(orderDetails, null, 2));
    
    res.json({
      success: true,
      order: orderDetails
    });
    
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details',
      message: error.message
    });
  }
});

// Download endpoint for PDF files
router.get('/download/:compositionId', async (req, res) => {
  const { compositionId } = req.params;
  
  if (!compositionId) {
    return res.status(400).json({
      success: false,
      error: 'Composition ID is required'
    });
  }
  
  try {
    console.log(`📥 Download request for composition: ${compositionId}`);
    
    // Get PDF path from purchase service
    const pdfPath = await purchaseService.getCompositionPdfPath(compositionId);
    
    if (!pdfPath) {
      return res.status(404).json({
        success: false,
        error: 'PDF file not found'
      });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${compositionId}.pdf"`);
    
    // Send the file
    res.sendFile(pdfPath, (err) => {
      if (err) {
        console.error('❌ Error sending PDF file:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to send PDF file'
        });
      } else {
        console.log(`✅ PDF file sent successfully: ${compositionId}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing download request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process download request',
      message: error.message
    });
  }
});

module.exports = router; 