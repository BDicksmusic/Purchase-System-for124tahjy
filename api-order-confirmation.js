// API endpoint for order confirmation
// Add this to your live website's server

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const notionService = require('./src/services/notionService'); // You'll need to add this

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

        // Extract metadata
        const { slug, Slug } = session.metadata || {};
        const finalSlug = slug || Slug;
        
        let composition = null;
        let downloadUrl = null;
        
        // If we have a slug, look up the composition from Notion
        if (finalSlug) {
            try {
                console.log(`🔍 Looking up composition by slug: ${finalSlug}`);
                composition = await notionService.getCompositionBySlug(finalSlug);
                
                if (composition) {
                    downloadUrl = composition.pdfUrl; // This is the "Website Download File" URL
                    console.log(`✅ Found composition: ${composition.title} with download URL`);
                } else {
                    console.log(`⚠️ No composition found for slug: ${finalSlug}`);
                }
            } catch (error) {
                console.log(`❌ Error looking up composition by slug: ${error.message}`);
            }
        }

        // Extract order details from session metadata
        const orderData = {
            orderId: session.id,
            compositionTitle: composition?.title || session.metadata?.compositionTitle || session.line_items?.data?.[0]?.description || 'Your purchase',
            amount: (session.amount_total / 100).toFixed(2), // Convert from cents
            purchaseDate: new Date(session.created * 1000).toISOString(),
            customerEmail: session.customer_details?.email || session.customer?.email || 'your email',
            downloadUrl: downloadUrl, // This is the Notion file URL
            paymentStatus: session.payment_status,
            slug: finalSlug
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

// Alternative: If you want to store orders locally, you can use this version:
/*
const fs = require('fs').promises;
const path = require('path');

app.get('/api/order-confirmation', async (req, res) => {
    try {
        const { session_id } = req.query;
        
        if (!session_id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Session ID is required' 
            });
        }

        // Read from local storage (if you're storing orders locally)
        const ordersPath = path.join(__dirname, 'data', 'purchases.json');
        const ordersData = await fs.readFile(ordersPath, 'utf8');
        const orders = JSON.parse(ordersData);
        
        // Find the order by session ID
        const order = orders.find(o => o.sessionId === session_id);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                error: 'Order not found' 
            });
        }

        const orderData = {
            orderId: order.sessionId,
            compositionTitle: order.compositionTitle || 'Your purchase',
            amount: order.amount,
            purchaseDate: order.purchaseDate,
            customerEmail: order.customerEmail,
            downloadUrl: order.downloadUrl || null
        };

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
*/ 