const express = require('express');
const router = express.Router();
const massEmailService = require('../services/massEmailService');
const multer = require('multer');
const path = require('path');

// Configure multer for CSV uploads
const upload = multer({ 
  dest: path.join(__dirname, '../../storage/temp'),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Send mass email campaign using Notion template
router.post('/send-campaign', async (req, res) => {
  try {
    const {
      templateId,          // Notion page ID for email template
      recipientDatabaseId, // Notion database ID for recipients
      recipientFilter,     // Optional filter for recipients
      testMode,           // Send test emails only
      testEmails          // Array of test email addresses
    } = req.body;

    if (!templateId) {
      return res.status(400).json({ 
        error: 'Template ID is required' 
      });
    }

    if (!testMode && !recipientDatabaseId) {
      return res.status(400).json({ 
        error: 'Recipient database ID is required when not in test mode' 
      });
    }

    const results = await massEmailService.sendMassEmail({
      templateId,
      recipientDatabaseId,
      recipientFilter,
      testMode,
      testEmails
    });

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Mass email error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Send mass email from CSV file
router.post('/send-from-csv', upload.single('csvFile'), async (req, res) => {
  try {
    const { templateId } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ 
        error: 'Template ID is required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'CSV file is required' 
      });
    }

    const results = await massEmailService.sendFromCSV(
      req.file.path, 
      templateId
    );

    // Clean up uploaded file
    const fs = require('fs-extra');
    await fs.remove(req.file.path);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('CSV email error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Preview email template from Notion
router.post('/preview-template', async (req, res) => {
  try {
    const { templateId, sampleData = {} } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ 
        error: 'Template ID is required' 
      });
    }

    const template = await massEmailService.getEmailTemplateFromNotion(templateId);
    
    // Apply sample data to template
    const handlebars = require('handlebars');
    const subjectTemplate = handlebars.compile(template.subject);
    const htmlTemplate = handlebars.compile(template.htmlContent);
    const textTemplate = handlebars.compile(template.textContent);
    
    const preview = {
      subject: subjectTemplate(sampleData),
      html: htmlTemplate(sampleData),
      text: textTemplate(sampleData),
      fromName: template.fromName,
      replyTo: template.replyTo
    };

    res.json({
      success: true,
      preview,
      template
    });
  } catch (error) {
    console.error('Template preview error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Get campaign statistics
router.get('/campaign-stats/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const stats = await massEmailService.getCampaignStats(campaignId);
    
    if (!stats) {
      return res.status(404).json({ 
        error: 'Campaign not found' 
      });
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Campaign stats error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Get all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const fs = require('fs-extra');
    const campaignDir = path.join(__dirname, '../../data/campaigns');
    
    await fs.ensureDir(campaignDir);
    
    const files = await fs.readdir(campaignDir);
    const campaigns = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const campaign = await fs.readJson(path.join(campaignDir, file));
        campaigns.push({
          id: campaign.campaignId,
          timestamp: campaign.timestamp,
          sent: campaign.sent.length,
          failed: campaign.failed.length,
          total: campaign.total
        });
      }
    }
    
    // Sort by timestamp, newest first
    campaigns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      campaigns
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

module.exports = router; 