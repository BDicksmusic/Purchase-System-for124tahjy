const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PurchaseService {
  constructor() {
    this.dataPath = process.env.DATABASE_PATH || './data/purchases.json';
    this.pdfStoragePath = process.env.PDF_STORAGE_PATH || './storage/pdfs';
    this.ensureDirectories();
  }

  // Ensure necessary directories exist
  async ensureDirectories() {
    try {
      await fs.ensureDir(path.dirname(this.dataPath));
      await fs.ensureDir(this.pdfStoragePath);
      await fs.ensureDir(path.join(this.pdfStoragePath, 'compositions'));
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  // Create a new purchase record
  async createPurchase(purchaseData) {
    try {
      const purchases = await this.loadPurchases();
      
      const purchase = {
        id: uuidv4(),
        ...purchaseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      purchases.push(purchase);
      await this.savePurchases(purchases);

      console.log(`✅ Purchase record created: ${purchase.orderId}`);
      return purchase;
    } catch (error) {
      console.error('Error creating purchase record:', error);
      throw new Error(`Purchase creation failed: ${error.message}`);
    }
  }

  // Get purchase by ID
  async getPurchase(purchaseId) {
    try {
      const purchases = await this.loadPurchases();
      return purchases.find(p => p.id === purchaseId || p.orderId === purchaseId);
    } catch (error) {
      console.error('Error getting purchase:', error);
      throw new Error(`Purchase retrieval failed: ${error.message}`);
    }
  }

  // Get all purchases
  async getAllPurchases(limit = 100, offset = 0) {
    try {
      const purchases = await this.loadPurchases();
      return purchases
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting all purchases:', error);
      throw new Error(`Purchase retrieval failed: ${error.message}`);
    }
  }

  // Get purchases by customer email
  async getPurchasesByCustomer(customerEmail) {
    try {
      const purchases = await this.loadPurchases();
      return purchases
        .filter(p => p.customerEmail === customerEmail)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error getting customer purchases:', error);
      throw new Error(`Customer purchase retrieval failed: ${error.message}`);
    }
  }

  // Update purchase status
  async updatePurchaseStatus(purchaseId, status, additionalData = {}) {
    try {
      const purchases = await this.loadPurchases();
      const purchaseIndex = purchases.findIndex(p => p.id === purchaseId || p.orderId === purchaseId);
      
      if (purchaseIndex === -1) {
        throw new Error('Purchase not found');
      }

      purchases[purchaseIndex] = {
        ...purchases[purchaseIndex],
        status,
        ...additionalData,
        updatedAt: new Date().toISOString()
      };

      await this.savePurchases(purchases);
      
      console.log(`✅ Purchase status updated: ${purchaseId} -> ${status}`);
      return purchases[purchaseIndex];
    } catch (error) {
      console.error('Error updating purchase status:', error);
      throw new Error(`Purchase update failed: ${error.message}`);
    }
  }

  // Get composition PDF path
  async getCompositionPdfPath(compositionId) {
    try {
      // First check if PDF exists in the compositions directory
      const compositionPdfPath = path.join(this.pdfStoragePath, 'compositions', `${compositionId}.pdf`);
      
      if (await fs.pathExists(compositionPdfPath)) {
        return compositionPdfPath;
      }

      // If not found, check if there's a mapping or fallback
      const fallbackPath = path.join(this.pdfStoragePath, `${compositionId}.pdf`);
      
      if (await fs.pathExists(fallbackPath)) {
        return fallbackPath;
      }

      // Return null if no PDF found
      console.warn(`⚠️ No PDF found for composition: ${compositionId}`);
      return null;
    } catch (error) {
      console.error('Error getting composition PDF path:', error);
      return null;
    }
  }

  // Store PDF for a composition
  async storeCompositionPdf(compositionId, pdfBuffer, filename = null) {
    try {
      const pdfPath = path.join(this.pdfStoragePath, 'compositions', `${compositionId}.pdf`);
      await fs.ensureDir(path.dirname(pdfPath));
      await fs.writeFile(pdfPath, pdfBuffer);
      
      console.log(`✅ PDF stored for composition: ${compositionId}`);
      return pdfPath;
    } catch (error) {
      console.error('Error storing composition PDF:', error);
      throw new Error(`PDF storage failed: ${error.message}`);
    }
  }

  // Generate download link for a purchase
  async generateDownloadLink(purchaseId) {
    try {
      const purchase = await this.getPurchase(purchaseId);
      if (!purchase) {
        throw new Error('Purchase not found');
      }

      const pdfPath = await this.getCompositionPdfPath(purchase.compositionId);
      if (!pdfPath) {
        throw new Error('PDF not found for this purchase');
      }

      // In a real implementation, you might want to generate a temporary download link
      // For now, we'll return the file path
      return {
        downloadUrl: `/api/download/${purchaseId}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
    } catch (error) {
      console.error('Error generating download link:', error);
      throw new Error(`Download link generation failed: ${error.message}`);
    }
  }

  // Get purchase by session ID
  async getPurchaseBySessionId(sessionId) {
    try {
      const purchases = await this.loadPurchases();
      return purchases.find(p => p.paymentIntentId === sessionId || p.orderId === sessionId);
    } catch (error) {
      console.error('Error getting purchase by session ID:', error);
      throw new Error(`Purchase retrieval failed: ${error.message}`);
    }
  }

  // Generate download URL for confirmation page
  async generateDownloadUrl(orderId) {
    try {
      const purchase = await this.getPurchase(orderId);
      if (!purchase) {
        return null;
      }

      const pdfPath = await this.getCompositionPdfPath(purchase.compositionId);
      if (!pdfPath) {
        return null;
      }

      // Return a secure download URL
      return `/api/download/${orderId}`;
    } catch (error) {
      console.error('Error generating download URL:', error);
      return null;
    }
  }

  // Get purchase statistics
  async getPurchaseStats() {
    try {
      const purchases = await this.loadPurchases();
      const completedPurchases = purchases.filter(p => p.status === 'completed');
      
      const totalRevenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0);
      const totalPurchases = completedPurchases.length;
      const uniqueCustomers = new Set(completedPurchases.map(p => p.customerEmail)).size;
      
      // Monthly stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const monthlyPurchases = completedPurchases.filter(p => {
        const purchaseDate = new Date(p.purchaseDate);
        return purchaseDate.getMonth() === thisMonth && purchaseDate.getFullYear() === thisYear;
      });
      
      const monthlyRevenue = monthlyPurchases.reduce((sum, p) => sum + p.amount, 0);

      return {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalPurchases,
        uniqueCustomers,
        monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
        monthlyPurchases: monthlyPurchases.length,
        averageOrderValue: totalPurchases > 0 ? parseFloat((totalRevenue / totalPurchases).toFixed(2)) : 0
      };
    } catch (error) {
      console.error('Error getting purchase stats:', error);
      throw new Error(`Statistics calculation failed: ${error.message}`);
    }
  }

  // Load purchases from file
  async loadPurchases() {
    try {
      if (await fs.pathExists(this.dataPath)) {
        const data = await fs.readFile(this.dataPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading purchases:', error);
      return [];
    }
  }

  // Save purchases to file
  async savePurchases(purchases) {
    try {
      await fs.writeFile(this.dataPath, JSON.stringify(purchases, null, 2));
    } catch (error) {
      console.error('Error saving purchases:', error);
      throw new Error(`Purchase save failed: ${error.message}`);
    }
  }

  // Backup purchase data
  async backupPurchases() {
    try {
      const purchases = await this.loadPurchases();
      const backupPath = `${this.dataPath}.backup.${Date.now()}`;
      await fs.writeFile(backupPath, JSON.stringify(purchases, null, 2));
      
      console.log(`✅ Purchase data backed up to: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Error backing up purchases:', error);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  // Clean up old purchase records (optional)
  async cleanupOldPurchases(daysToKeep = 365) {
    try {
      const purchases = await this.loadPurchases();
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const filteredPurchases = purchases.filter(p => 
        new Date(p.createdAt) > cutoffDate
      );

      if (filteredPurchases.length < purchases.length) {
        await this.savePurchases(filteredPurchases);
        console.log(`✅ Cleaned up ${purchases.length - filteredPurchases.length} old purchase records`);
      }

      return {
        originalCount: purchases.length,
        newCount: filteredPurchases.length,
        removedCount: purchases.length - filteredPurchases.length
      };
    } catch (error) {
      console.error('Error cleaning up purchases:', error);
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  }
}

module.exports = new PurchaseService(); 