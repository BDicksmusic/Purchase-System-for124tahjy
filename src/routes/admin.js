const express = require('express');
const router = express.Router();
const purchaseService = require('../services/purchaseService');
const notionService = require('../services/notionService');
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');

// Get all purchases with pagination
router.get('/purchases', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, customerEmail } = req.query;
    
    let purchases = await purchaseService.getAllPurchases(parseInt(limit), parseInt(offset));
    
    // Apply filters
    if (status) {
      purchases = purchases.filter(p => p.status === status);
    }
    
    if (customerEmail) {
      purchases = purchases.filter(p => 
        p.customerEmail && p.customerEmail.toLowerCase().includes(customerEmail.toLowerCase())
      );
    }

    res.json({
      success: true,
      purchases,
      count: purchases.length,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error getting purchases:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get purchase by ID
router.get('/purchases/:purchaseId', async (req, res) => {
  try {
    const { purchaseId } = req.params;
    
    const purchase = await purchaseService.getPurchase(purchaseId);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      purchase
    });

  } catch (error) {
    console.error('Error getting purchase:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update purchase status
router.patch('/purchases/:purchaseId/status', async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const updatedPurchase = await purchaseService.updatePurchaseStatus(purchaseId, status, { notes });

    res.json({
      success: true,
      message: 'Purchase status updated successfully',
      purchase: updatedPurchase
    });

  } catch (error) {
    console.error('Error updating purchase status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get purchase statistics
router.get('/stats', async (req, res) => {
  try {
    const purchaseStats = await purchaseService.getPurchaseStats();
    const compositions = await notionService.getCompositions();
    
    const stats = {
      purchases: purchaseStats,
      compositions: {
        total: compositions.length,
        published: compositions.filter(c => c.status === 'Published').length,
        draft: compositions.filter(c => c.status === 'Draft').length
      },
      system: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get customer purchases
router.get('/customers/:customerEmail/purchases', async (req, res) => {
  try {
    const { customerEmail } = req.params;
    
    const purchases = await purchaseService.getPurchasesByCustomer(customerEmail);

    res.json({
      success: true,
      customerEmail,
      purchases,
      count: purchases.length
    });

  } catch (error) {
    console.error('Error getting customer purchases:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Resend purchase confirmation email
router.post('/purchases/:purchaseId/resend-email', async (req, res) => {
  try {
    const { purchaseId } = req.params;
    
    const purchase = await purchaseService.getPurchase(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }

    const pdfPath = await purchaseService.getCompositionPdfPath(purchase.compositionId);
    
    const emailResult = await emailService.sendPurchaseConfirmation({
      ...purchase,
      pdfPath,
      price: purchase.amount
    });

    res.json({
      success: true,
      message: 'Email resent successfully',
      emailResult
    });

  } catch (error) {
    console.error('Error resending email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Backup purchase data
router.post('/backup', async (req, res) => {
  try {
    const backupPath = await purchaseService.backupPurchases();

    res.json({
      success: true,
      message: 'Backup completed successfully',
      backupPath
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clean up old purchases
router.post('/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 365 } = req.body;
    
    const result = await purchaseService.cleanupOldPurchases(daysToKeep);

    res.json({
      success: true,
      message: 'Cleanup completed successfully',
      result
    });

  } catch (error) {
    console.error('Error cleaning up purchases:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test all system connections
router.get('/test-connections', async (req, res) => {
  try {
    const results = {
      email: await emailService.testConnection(),
      notion: await notionService.testConnection(),
      stripe: { success: false, error: 'Not implemented' }
    };

    // Test Stripe connection
    try {
      const products = await stripeService.getAllProducts();
      results.stripe = {
        success: true,
        message: 'Stripe connection successful',
        productCount: products.length
      };
    } catch (error) {
      results.stripe = {
        success: false,
        error: error.message
      };
    }

    const allSuccessful = Object.values(results).every(r => r.success);

    res.json({
      success: allSuccessful,
      results
    });

  } catch (error) {
    console.error('Error testing connections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        email: process.env.EMAIL_HOST ? 'Configured' : 'Not configured',
        stripe: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured',
        notion: process.env.NOTION_API_KEY ? 'Configured' : 'Not configured'
      },
      storage: {
        pdfPath: process.env.PDF_STORAGE_PATH || './storage/pdfs',
        dataPath: process.env.DATABASE_PATH || './data/purchases.json'
      }
    };

    res.json({
      success: true,
      health
    });

  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync all compositions with Stripe
router.post('/sync-all-compositions', async (req, res) => {
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

module.exports = router; 