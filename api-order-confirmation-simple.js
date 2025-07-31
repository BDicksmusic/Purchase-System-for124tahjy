// Simple API endpoint for order confirmation (without Notion integration)
// Add this to your live website's server

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add this route to your Express app
app.get('/api/order-confirmation', async (req, res) => {
    try {
        const { session_id } = req.query;
        
        if (!session_id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Session ID is required' 
            });
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items', 'customer']
        });
        
        if (!session) {
            return res.status(404).json({ 
                success: false, 
                error: 'Session not found' 
            });
        }

        // Extract order details from session metadata
        const orderData = {
            orderId: session.id,
            compositionTitle: session.metadata?.compositionTitle || session.line_items?.data?.[0]?.description || 'Your purchase',
            amount: (session.amount_total / 100).toFixed(2), // Convert from cents
            purchaseDate: new Date(session.created * 1000).toISOString(),
            customerEmail: session.customer_details?.email || session.customer?.email || 'your email',
            downloadUrl: session.metadata?.downloadUrl || null, // This should be passed in metadata
            paymentStatus: session.payment_status
        };

        console.log(`✅ Order details prepared:`, orderData);

        res.json({
            success: true,
            order: orderData
        });

    } catch (error) {
        console.error('Error fetching order confirmation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch order details' 
        });
    }
});

// For this to work, your external Stripe API needs to include the download URL in metadata:
/*
const session = await stripe.checkout.sessions.create({
    // ... other options
    metadata: {
        compositionId: compositionId,
        compositionTitle: compositionTitle,
        slug: compositionSlug,
        downloadUrl: composition.pdfUrl, // Add this line
    },
});
*/ 