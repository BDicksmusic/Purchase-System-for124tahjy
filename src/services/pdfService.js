const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class PdfService {
  constructor() {
    this.pdfStoragePath = process.env.PDF_STORAGE_PATH || './storage/pdfs';
    this.ensureDirectories();
  }

  // Ensure necessary directories exist
  async ensureDirectories() {
    try {
      await fs.ensureDir(this.pdfStoragePath);
      await fs.ensureDir(path.join(this.pdfStoragePath, 'compositions'));
      await fs.ensureDir(path.join(this.pdfStoragePath, 'temp'));
    } catch (error) {
      console.error('Error creating PDF directories:', error);
    }
  }

  // Get PDF for a composition using multiple methods
  async getCompositionPdf(compositionId, compositionData = null) {
    try {
      console.log(`🔍 Looking for PDF for composition: ${compositionId}`);

      // Method 1: Check local storage first
      const localPdf = await this.getLocalPdf(compositionId);
      if (localPdf) {
        console.log(`✅ Found local PDF for composition: ${compositionId}`);
        return localPdf;
      }

      // Method 2: Download from Notion URL if available
      if (compositionData && compositionData.pdfUrl) {
        console.log(`📥 Downloading PDF from Notion URL: ${compositionData.pdfUrl}`);
        const downloadedPdf = await this.downloadFromUrl(compositionData.pdfUrl, compositionId);
        if (downloadedPdf) {
          return downloadedPdf;
        }
      }

      // Method 3: Check cloud storage URLs
      if (compositionData && compositionData.cloudPdfUrl) {
        console.log(`☁️ Downloading PDF from cloud storage: ${compositionData.cloudPdfUrl}`);
        const cloudPdf = await this.downloadFromUrl(compositionData.cloudPdfUrl, compositionId);
        if (cloudPdf) {
          return cloudPdf;
        }
      }

      console.warn(`⚠️ No PDF found for composition: ${compositionId}`);
      return null;
    } catch (error) {
      console.error('Error getting composition PDF:', error);
      return null;
    }
  }

  // Get PDF from local storage
  async getLocalPdf(compositionId) {
    try {
      const pdfPath = path.join(this.pdfStoragePath, 'compositions', `${compositionId}.pdf`);
      
      if (await fs.pathExists(pdfPath)) {
        const stats = await fs.stat(pdfPath);
        return {
          path: pdfPath,
          buffer: await fs.readFile(pdfPath),
          size: stats.size,
          source: 'local'
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting local PDF:', error);
      return null;
    }
  }

  // Download PDF from URL
  async downloadFromUrl(url, compositionId) {
    try {
      console.log(`📥 Downloading PDF from: ${url}`);
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PDF-Downloader/1.0)'
        }
      });

      if (response.status === 200 && response.data) {
        const buffer = Buffer.from(response.data);
        
        // Validate it's actually a PDF
        if (this.isValidPdf(buffer)) {
          // Store locally for future use
          const localPath = await this.storePdf(compositionId, buffer);
          
          return {
            path: localPath,
            buffer: buffer,
            size: buffer.length,
            source: 'url',
            originalUrl: url
          };
        } else {
          console.warn(`⚠️ Downloaded file is not a valid PDF: ${url}`);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error downloading PDF from ${url}:`, error.message);
      return null;
    }
  }

  // Store PDF locally
  async storePdf(compositionId, buffer) {
    try {
      const pdfPath = path.join(this.pdfStoragePath, 'compositions', `${compositionId}.pdf`);
      await fs.ensureDir(path.dirname(pdfPath));
      await fs.writeFile(pdfPath, buffer);
      
      console.log(`✅ PDF stored locally: ${compositionId}`);
      return pdfPath;
    } catch (error) {
      console.error('Error storing PDF:', error);
      throw new Error(`PDF storage failed: ${error.message}`);
    }
  }

  // Validate if buffer is a PDF
  isValidPdf(buffer) {
    // Check PDF magic number
    const pdfHeader = buffer.slice(0, 4).toString('ascii');
    return pdfHeader === '%PDF';
  }

  // Upload PDF to cloud storage (placeholder for future implementation)
  async uploadToCloudStorage(compositionId, buffer) {
    try {
      // This would integrate with AWS S3, Google Cloud Storage, etc.
      console.log(`☁️ Uploading PDF to cloud storage: ${compositionId}`);
      
      // Placeholder implementation
      const cloudUrl = `https://your-cloud-storage.com/pdfs/${compositionId}.pdf`;
      
      return {
        url: cloudUrl,
        success: true
      };
    } catch (error) {
      console.error('Error uploading to cloud storage:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate temporary download link
  async generateDownloadLink(compositionId, expiresIn = 24 * 60 * 60 * 1000) {
    try {
      const pdf = await this.getCompositionPdf(compositionId);
      if (!pdf) {
        throw new Error('PDF not found');
      }

      const downloadId = uuidv4();
      const tempPath = path.join(this.pdfStoragePath, 'temp', `${downloadId}.pdf`);
      
      await fs.ensureDir(path.dirname(tempPath));
      await fs.writeFile(tempPath, pdf.buffer);

      // Schedule cleanup
      setTimeout(async () => {
        try {
          await fs.remove(tempPath);
          console.log(`🧹 Cleaned up temporary PDF: ${downloadId}`);
        } catch (error) {
          console.error('Error cleaning up temporary PDF:', error);
        }
      }, expiresIn);

      return {
        downloadUrl: `/api/download/${downloadId}`,
        expiresAt: new Date(Date.now() + expiresIn).toISOString(),
        size: pdf.size
      };
    } catch (error) {
      console.error('Error generating download link:', error);
      throw new Error(`Download link generation failed: ${error.message}`);
    }
  }

  // Get PDF statistics
  async getPdfStats() {
    try {
      const compositionsDir = path.join(this.pdfStoragePath, 'compositions');
      
      if (!(await fs.pathExists(compositionsDir))) {
        return { totalPdfs: 0, totalSize: 0, averageSize: 0 };
      }

      const files = await fs.readdir(compositionsDir);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      
      let totalSize = 0;
      for (const file of pdfFiles) {
        const filePath = path.join(compositionsDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return {
        totalPdfs: pdfFiles.length,
        totalSize: totalSize,
        averageSize: pdfFiles.length > 0 ? Math.round(totalSize / pdfFiles.length) : 0
      };
    } catch (error) {
      console.error('Error getting PDF stats:', error);
      return { totalPdfs: 0, totalSize: 0, averageSize: 0 };
    }
  }
}

module.exports = new PdfService(); 