const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');
const purchaseService = require('../services/purchaseService');

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
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
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
    
    // Additional verification - ensure payment is actually successful
    if (paymentIntent.status !== 'succeeded') {
      console.log(`⚠️ Payment intent status is ${paymentIntent.status}, not 'succeeded'`);
      return;
    }

    const {
      compositionId,
      compositionTitle,
      customerEmail,
      orderId
    } = paymentIntent.metadata;

    // Verify required metadata exists - only require compositionTitle and customerEmail
    if (!compositionTitle || !customerEmail) {
      console.log('❌ Missing required metadata for payment success');
      console.log(`   - compositionTitle: ${compositionTitle ? 'present' : 'missing'}`);
      console.log(`   - customerEmail: ${customerEmail ? 'present' : 'missing'}`);
      return;
    }

    // Create purchase record
    const purchaseData = {
      orderId: orderId || paymentIntent.id,
      paymentIntentId: paymentIntent.id,
      customerEmail,
      customerName: paymentIntent.receipt_email || customerEmail,
      compositionId: compositionId || `product_${Date.now()}`, // Generate fallback ID if not provided
      compositionTitle,
      amount: paymentIntent.amount / 100, // Convert from cents
      status: 'completed',
      purchaseDate: new Date().toISOString()
    };

    // Save purchase record
    await purchaseService.createPurchase(purchaseData);

    // Try to get PDF path if compositionId is available, otherwise skip
    let pdfPath = null;
    if (compositionId) {
      try {
        pdfPath = await purchaseService.getCompositionPdfPath(compositionId);
      } catch (error) {
        console.log(`⚠️ Could not get PDF path for compositionId ${compositionId}:`, error.message);
      }
    }

    // Send confirmation email with PDF
    await emailService.sendPurchaseConfirmation({
      ...purchaseData,
      pdfPath,
      price: purchaseData.amount
    });

    // Send admin notification
    await emailService.sendAdminNotification(purchaseData);

    console.log(`✅ Purchase processed successfully for ${compositionTitle}`);
    
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
    
    // Get product name from line items (this is the composition title)
    let productName = session.line_items?.data?.[0]?.description || 
                      session.line_items?.data?.[0]?.price_data?.product_data?.name;

    // If line items were not expanded, fetch them directly from Stripe
    if (!productName) {
      try {
        const fetchedLineItems = await stripeService.stripe.checkout.sessions.listLineItems(
          session.id,
          { limit: 1 }
        );
        if (fetchedLineItems?.data?.length) {
          const li = fetchedLineItems.data[0];
          productName = li.description || li.price?.product_data?.name || li.price?.product_data?.metadata?.title;
          console.log(`🛍️ Retrieved line item product name: ${productName}`);
        }
      } catch (fetchErr) {
        console.error('❌ Failed to fetch line items:', fetchErr.message);
      }
    }
    
    // Try to get compositionId from metadata, but don't require it
    const compositionId = session.metadata?.compositionId;
    const compositionTitle = session.metadata?.compositionTitle || productName;
    
    const customerEmail = session.customer_details?.email;
    const orderId = session.metadata?.orderId || session.id;

    console.log(`🔍 Extracted data:`);
    console.log(`   - productName: ${productName}`);
    console.log(`   - compositionId: ${compositionId || 'not provided'}`);
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
        compositionId: compositionId || `product_${Date.now()}`, // Generate fallback ID if not provided
        compositionTitle,
        amount: session.amount_total / 100,
        status: 'completed',
        purchaseDate: new Date().toISOString()
      };

      await purchaseService.createPurchase(purchaseData);

      // Try to get PDF path if compositionId is available, otherwise skip
      let pdfPath = null;
      if (compositionId) {
        try {
          pdfPath = await purchaseService.getCompositionPdfPath(compositionId);
        } catch (error) {
          console.log(`⚠️ Could not get PDF path for compositionId ${compositionId}:`, error.message);
        }
      }

      await emailService.sendPurchaseConfirmation({
        ...purchaseData,
        pdfPath,
        price: purchaseData.amount
      });

      await emailService.sendAdminNotification(purchaseData);
      
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

module.exports = router; 