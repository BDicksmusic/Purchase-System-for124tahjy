const express = require('express');
const router = express.Router();
const notionService = require('../services/notionService');
const axios = require('axios');

// Security: Input validation middleware
const validateCompositionId = (req, res, next) => {
  const { compositionId } = req.params;
  if (!compositionId || compositionId.length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Valid composition ID is required'
    });
  }
  next();
};

const validatePriceUpdate = (req, res, next) => {
  const { price } = req.body;
  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid positive price is required'
    });
  }
  next();
};

// Security: Rate limiting (basic implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window

const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const client = requestCounts.get(clientIP);
    if (now > client.resetTime) {
      client.count = 1;
      client.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      client.count++;
    }
    
    if (client.count > RATE_LIMIT_MAX) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
    }
  }
  next();
};

// Apply rate limiting to all routes
router.use(rateLimit);

// NEW: Serve Notion file content for compositions
router.get('/compositions/:compositionId/file', validateCompositionId, async (req, res) => {
  try {
    const { compositionId } = req.params;
    
    console.log(`📁 Serving file for composition: ${compositionId}`);
    
    // Get the composition from Notion
    const composition = await notionService.getComposition(compositionId);
    
    if (!composition) {
      return res.status(404).json({
        success: false,
        error: 'Composition not found'
      });
    }

    if (!composition.pdfUrl) {
      return res.status(404).json({
        success: false,
        error: 'No file available for this composition'
      });
    }

    console.log(`📥 Downloading file from Notion: ${composition.pdfUrl}`);

    // Download the file from Notion
    const fileResponse = await axios.get(composition.pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Notion-File-Server/1.0)'
      }
    });

    if (fileResponse.status === 200 && fileResponse.data) {
      const buffer = Buffer.from(fileResponse.data);
      
      // Set appropriate headers for file download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${composition.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
        'Content-Length': buffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      console.log(`✅ Serving file: ${composition.title} (${buffer.length} bytes)`);
      
      // Send the file buffer
      res.send(buffer);
    } else {
      throw new Error(`Failed to download file from Notion (status: ${fileResponse.status})`);
    }

  } catch (error) {
    console.error('Error serving composition file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve file'
    });
  }
});

// NEW: Serve Notion file content by slug
router.get('/compositions/slug/:slug/file', async (req, res) => {
  try {
    const { slug } = req.params;
    
    console.log(`📁 Serving file for composition slug: ${slug}`);
    
    // Get the composition from Notion by slug
    const composition = await notionService.getCompositionBySlug(slug);
    
    if (!composition) {
      return res.status(404).json({
        success: false,
        error: 'Composition not found'
      });
    }

    if (!composition.pdfUrl) {
      return res.status(404).json({
        success: false,
        error: 'No file available for this composition'
      });
    }

    console.log(`📥 Downloading file from Notion: ${composition.pdfUrl}`);

    // Download the file from Notion
    const fileResponse = await axios.get(composition.pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Notion-File-Server/1.0)'
      }
    });

    if (fileResponse.status === 200 && fileResponse.data) {
      const buffer = Buffer.from(fileResponse.data);
      
      // Set appropriate headers for file download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${composition.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
        'Content-Length': buffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      console.log(`✅ Serving file: ${composition.title} (${buffer.length} bytes)`);
      
      // Send the file buffer
      res.send(buffer);
    } else {
      throw new Error(`Failed to download file from Notion (status: ${fileResponse.status})`);
    }

  } catch (error) {
    console.error('Error serving composition file by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve file'
    });
  }
});

// Get all compositions from Notion
router.get('/compositions', async (req, res) => {
  try {
    const compositions = await notionService.getCompositions();
    
    res.json({
      success: true,
      compositions,
      count: compositions.length
    });

  } catch (error) {
    console.error('Error fetching compositions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get a specific composition by ID
router.get('/compositions/:compositionId', validateCompositionId, async (req, res) => {
  try {
    const { compositionId } = req.params;
    
    const composition = await notionService.getComposition(compositionId);
    
    if (!composition) {
      return res.status(404).json({
        success: false,
        error: 'Composition not found'
      });
    }

    res.json({
      success: true,
      composition
    });

  } catch (error) {
    console.error('Error fetching composition:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update composition price in Notion
router.patch('/compositions/:compositionId/price', validateCompositionId, validatePriceUpdate, async (req, res) => {
  try {
    const { compositionId } = req.params;
    const { price } = req.body;

    const updatedComposition = await notionService.updateCompositionPrice(compositionId, price);

    res.json({
      success: true,
      message: 'Price updated successfully',
      composition: updatedComposition
    });

  } catch (error) {
    console.error('Error updating composition price:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Notion connection
router.get('/test', async (req, res) => {
  try {
    const result = await notionService.testConnection();
    
    res.json({
      success: result.success,
      message: result.message || result.error,
      databaseName: result.databaseName
    });

  } catch (error) {
    console.error('Notion test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get compositions with filtering
router.get('/compositions/filter', async (req, res) => {
  try {
    const { status, category, difficulty, composer } = req.query;
    
    let compositions = await notionService.getCompositions();
    
    // Apply filters
    if (status) {
      compositions = compositions.filter(c => c.status === status);
    }
    
    if (category) {
      compositions = compositions.filter(c => c.category === category);
    }
    
    if (difficulty) {
      compositions = compositions.filter(c => c.difficulty === difficulty);
    }
    
    if (composer) {
      compositions = compositions.filter(c => 
        c.composer && c.composer.toLowerCase().includes(composer.toLowerCase())
      );
    }

    res.json({
      success: true,
      compositions,
      count: compositions.length,
      filters: { status, category, difficulty, composer }
    });

  } catch (error) {
    console.error('Error filtering compositions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get composition statistics
router.get('/stats', async (req, res) => {
  try {
    const compositions = await notionService.getCompositions();
    
    const stats = {
      total: compositions.length,
      published: compositions.filter(c => c.status === 'Published').length,
      draft: compositions.filter(c => c.status === 'Draft').length,
      categories: {},
      difficulties: {},
      composers: {},
      priceRange: {
        min: 0,
        max: 0,
        average: 0
      }
    };

    // Calculate category distribution
    compositions.forEach(c => {
      if (c.category) {
        stats.categories[c.category] = (stats.categories[c.category] || 0) + 1;
      }
      if (c.difficulty) {
        stats.difficulties[c.difficulty] = (stats.difficulties[c.difficulty] || 0) + 1;
      }
      if (c.composer) {
        stats.composers[c.composer] = (stats.composers[c.composer] || 0) + 1;
      }
    });

    // Calculate price statistics
    const prices = compositions.map(c => c.price).filter(p => p > 0);
    if (prices.length > 0) {
      stats.priceRange.min = Math.min(...prices);
      stats.priceRange.max = Math.max(...prices);
      stats.priceRange.average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    }

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting composition stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search compositions
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const compositions = await notionService.getCompositions();
    const searchTerm = q.toLowerCase();
    
    const results = compositions.filter(c => 
      c.title.toLowerCase().includes(searchTerm) ||
      (c.description && c.description.toLowerCase().includes(searchTerm)) ||
      (c.composer && c.composer.toLowerCase().includes(searchTerm))
    );

    res.json({
      success: true,
      results,
      count: results.length,
      query: q
    });

  } catch (error) {
    console.error('Error searching compositions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get unique values for filters
router.get('/filters', async (req, res) => {
  try {
    const compositions = await notionService.getCompositions();
    
    const filters = {
      statuses: [...new Set(compositions.map(c => c.status).filter(Boolean))],
      categories: [...new Set(compositions.map(c => c.category).filter(Boolean))],
      difficulties: [...new Set(compositions.map(c => c.difficulty).filter(Boolean))],
      composers: [...new Set(compositions.map(c => c.composer).filter(Boolean))]
    };

    res.json({
      success: true,
      filters
    });

  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 