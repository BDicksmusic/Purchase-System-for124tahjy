const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const notionService = require('./src/services/notionService');

// Add this route to your Express app
app.get('/api/order-confirmation', async (req, res) => {
    const { session_id } = req.query;
    
    if (!session_id) {
        return res.status(400).json({
            success: false,
            error: 'Session ID is required'
        });
    }
    
    try {
        console.log(`🔍 Fetching session data for: ${session_id}`);
        
        // Get session data immediately (no webhook needed)
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items', 'customer']
        });
        
        console.log(`📋 Session data:`, JSON.stringify(session, null, 2));
        
        // Extract metadata
        const {
            compositionTitle,
            compositionId,
            customerEmail,
            orderId,
            slug,
            Slug
        } = session.metadata || {};
        
        // Handle both lowercase and uppercase slug
        const finalSlug = slug || Slug;
        
        // Try to get composition details from Notion if slug is available
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
        
        // Fallback to session metadata or line items
        if (!finalCompositionTitle) {
            // Try to get from line items
            if (session.line_items?.data?.[0]?.price?.product?.name) {
                finalCompositionTitle = session.line_items.data[0].price.product.name;
            } else if (session.metadata?.compositionTitle) {
                finalCompositionTitle = session.metadata.compositionTitle;
            } else {
                finalCompositionTitle = 'Unknown Composition';
            }
        }
        
        // Get customer email from session
        const finalCustomerEmail = customerEmail || 
                                 session.customer_details?.email || 
                                 session.customer?.email;
        
        const orderDetails = {
            orderId: orderId || session.id,
            compositionTitle: finalCompositionTitle,
            compositionId: finalCompositionId,
            amount: (session.amount_total / 100).toFixed(2),
            purchaseDate: new Date(session.created * 1000).toISOString(),
            customerEmail: finalCustomerEmail,
            customerName: session.customer_details?.name || 'Valued Customer',
            slug: finalSlug,
            paymentStatus: session.payment_status,
            pdfUrl: composition?.pdfUrl || null
        };
        
        console.log(`✅ Order details prepared:`, JSON.stringify(orderDetails, null, 2));
        
        res.json({
            success: true,
            order: orderDetails
        });
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order details',
            message: error.message
        });
    }
});

// Optional: Add a health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
}); 