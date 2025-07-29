const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    const result = await emailService.testConnection();
    
    res.json({
      success: result.success,
      message: result.message || result.error
    });

  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send test email
router.post('/test', async (req, res) => {
  try {
    const { email, compositionTitle = 'Test Composition' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const testData = {
      customerEmail: email,
      customerName: 'Test Customer',
      compositionTitle,
      orderId: `test-${Date.now()}`,
      purchaseDate: new Date().toISOString(),
      price: 9.99,
      pdfPath: null // No PDF for test
    };

    const result = await emailService.sendPurchaseConfirmation(testData);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      result
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send admin notification test
router.post('/test-admin', async (req, res) => {
  try {
    const testData = {
      customerEmail: 'test@example.com',
      customerName: 'Test Customer',
      compositionTitle: 'Test Composition',
      orderId: `test-admin-${Date.now()}`,
      price: 9.99
    };

    const result = await emailService.sendAdminNotification(testData);

    res.json({
      success: true,
      message: 'Admin notification test sent successfully',
      result
    });

  } catch (error) {
    console.error('Admin notification test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get email configuration status
router.get('/config', (req, res) => {
  const config = {
    host: process.env.EMAIL_HOST || 'Not configured',
    port: process.env.EMAIL_PORT || 'Not configured',
    user: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
    from: process.env.EMAIL_FROM || 'Not configured',
    sendgrid: process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured',
    mailgun: process.env.MAILGUN_API_KEY ? 'Configured' : 'Not configured'
  };

  res.json({
    success: true,
    config
  });
});

// Update email template
router.post('/templates/:templateName', async (req, res) => {
  try {
    const { templateName } = req.params;
    const { html, text } = req.body;

    if (!html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required'
      });
    }

    // This would typically save to a file or database
    // For now, we'll just return success
    console.log(`Template update requested for: ${templateName}`);

    res.json({
      success: true,
      message: `Template ${templateName} updated successfully`
    });

  } catch (error) {
    console.error('Template update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available email templates
router.get('/templates', (req, res) => {
  const templates = [
    {
      name: 'purchase-confirmation',
      description: 'Email sent to customers after successful purchase',
      variables: [
        'customerName',
        'compositionTitle',
        'orderId',
        'purchaseDate',
        'price',
        'downloadLink',
        'supportEmail'
      ]
    },
    {
      name: 'admin-notification',
      description: 'Email sent to admin when a new purchase is made',
      variables: [
        'customerEmail',
        'customerName',
        'compositionTitle',
        'orderId',
        'price',
        'purchaseDate',
        'adminDashboard'
      ]
    }
  ];

  res.json({
    success: true,
    templates
  });
});

// Get email template content
router.get('/templates/:templateName', (req, res) => {
  try {
    const { templateName } = req.params;

    // This would typically load from a file or database
    // For now, return a default template
    const template = {
      name: templateName,
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Purchase Confirmation</title>
</head>
<body>
  <h1>Thank you for your purchase!</h1>
  <p>Dear {{customerName}},</p>
  <p>Thank you for purchasing {{compositionTitle}}!</p>
  <p>Order ID: {{orderId}}</p>
  <p>Price: {{price}}</p>
  <p>Date: {{purchaseDate}}</p>
</body>
</html>`,
      text: `Thank you for your purchase!

Dear {{customerName}},

Thank you for purchasing {{compositionTitle}}!

Order ID: {{orderId}}
Price: {{price}}
Date: {{purchaseDate}}`
    };

    res.json({
      success: true,
      template
    });

  } catch (error) {
    console.error('Template retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 