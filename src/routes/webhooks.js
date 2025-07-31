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

    // Verify required metadata exists
    if (!compositionId || !compositionTitle || !customerEmail) {
      console.log('❌ Missing required metadata for payment success');
      return;
    }

    // Create purchase record
    const purchaseData = {
      orderId,
      paymentIntentId: paymentIntent.id,
      customerEmail,
      customerName: paymentIntent.receipt_email || customerEmail,
      compositionId,
      compositionTitle,
      amount: paymentIntent.amount / 100, // Convert from cents
      status: 'completed',
      purchaseDate: new Date().toISOString()
    };

    // Save purchase record
    await purchaseService.createPurchase(purchaseData);

    // Get PDF path for the composition
    const pdfPath = await purchaseService.getCompositionPdfPath(compositionId);

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

    // Create failed purchase record
    const purchaseData = {
      orderId,
      paymentIntentId: paymentIntent.id,
      customerEmail,
      customerName: paymentIntent.receipt_email || customerEmail,
      compositionId,
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
    
    // This handles cases where customers use Stripe Checkout
    const {
      compositionId,
      compositionTitle
    } = session.metadata;

    const customerEmail = session.customer_details?.email;
    const orderId = session.metadata?.orderId || session.id;

    if (customerEmail && compositionId) {
      const purchaseData = {
        orderId,
        paymentIntentId: session.payment_intent,
        customerEmail,
        customerName: session.customer_details?.name || customerEmail,
        compositionId,
        compositionTitle,
        amount: session.amount_total / 100,
        status: 'completed',
        purchaseDate: new Date().toISOString()
      };

      await purchaseService.createPurchase(purchaseData);

      const pdfPath = await purchaseService.getCompositionPdfPath(compositionId);

      await emailService.sendPurchaseConfirmation({
        ...purchaseData,
        pdfPath,
        price: purchaseData.amount
      });

      await emailService.sendAdminNotification(purchaseData);
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