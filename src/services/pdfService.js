const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class FileService {
  constructor() {
    this.fileStoragePath = process.env.FILE_STORAGE_PATH || './storage/files';
    this.ensureDirectories();
  }

  // Ensure necessary directories exist
  async ensureDirectories() {
    try {
      await fs.ensureDir(this.fileStoragePath);
      await fs.ensureDir(path.join(this.fileStoragePath, 'compositions'));
      await fs.ensureDir(path.join(this.fileStoragePath, 'temp'));
    } catch (error) {
      console.error('Error creating file directories:', error);
    }
  }

  // Get file package for a composition using multiple methods
  async getCompositionFile(compositionId, compositionData = null) {
    try {
      console.log(`🔍 Looking for file package for composition: ${compositionId}`);

      // Method 1: Check local storage first
      const localFile = await this.getLocalFile(compositionId);
      if (localFile) {
        console.log(`✅ Found local file package for composition: ${compositionId}`);
        return localFile;
      }

      // Method 2: Download from Notion URL if available
      if (compositionData && compositionData.pdfUrl) {
        console.log(`📥 Downloading file package from Notion URL: ${compositionData.pdfUrl}`);
        const downloadedFile = await this.downloadFromUrl(compositionData.pdfUrl, compositionId);
        if (downloadedFile) {
          return downloadedFile;
        }
      }

      // Method 3: Check cloud storage URLs
      if (compositionData && compositionData.cloudPdfUrl) {
        console.log(`☁️ Downloading file package from cloud storage: ${compositionData.cloudPdfUrl}`);
        const cloudFile = await this.downloadFromUrl(compositionData.cloudPdfUrl, compositionId);
        if (cloudFile) {
          return cloudFile;
        }
      }

      console.warn(`⚠️ No file package found for composition: ${compositionId}`);
      return null;
    } catch (error) {
      console.error('Error getting composition file package:', error);
      return null;
    }
  }

  // Get file from local storage
  async getLocalFile(compositionId) {
    try {
      const filePath = path.join(this.fileStoragePath, 'compositions', `${compositionId}.zip`);
      
      if (await fs.pathExists(filePath)) {
        const stats = await fs.stat(filePath);
        return {
          path: filePath,
          buffer: await fs.readFile(filePath),
          size: stats.size,
          source: 'local'
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting local file:', error);
      return null;
    }
  }

  // Download file from URL
  async downloadFromUrl(url, compositionId) {
    try {
      console.log(`📥 Downloading file package from: ${url}`);
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; File-Downloader/1.0)'
        }
      });

      if (response.status === 200 && response.data) {
        const buffer = Buffer.from(response.data);
        
        // Validate it's actually a ZIP file
        if (this.isValidZip(buffer)) {
          // Store locally for future use
          const localPath = await this.storeFile(compositionId, buffer);
          
          return {
            path: localPath,
            buffer: buffer,
            size: buffer.length,
            source: 'url',
            originalUrl: url
          };
        } else {
          console.warn(`⚠️ Downloaded file is not a valid ZIP: ${url}`);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error downloading file from ${url}:`, error.message);
      return null;
    }
  }

  // Store file locally
  async storeFile(compositionId, buffer) {
    try {
      const filePath = path.join(this.fileStoragePath, 'compositions', `${compositionId}.zip`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, buffer);
      
      console.log(`✅ File package stored locally: ${compositionId}`);
      return filePath;
    } catch (error) {
      console.error('Error storing file:', error);
      throw new Error(`File storage failed: ${error.message}`);
    }
  }

  // Validate if buffer is a ZIP file
  isValidZip(buffer) {
    // Check ZIP magic number (PK\x03\x04 or PK\x05\x06)
    const zipHeader = buffer.slice(0, 4);
    return zipHeader[0] === 0x50 && zipHeader[1] === 0x4B && 
           (zipHeader[2] === 0x03 || zipHeader[2] === 0x05) && 
           (zipHeader[3] === 0x04 || zipHeader[3] === 0x06);
  }

  // Upload file to cloud storage (placeholder for future implementation)
  async uploadToCloudStorage(compositionId, buffer) {
    try {
      // This would integrate with AWS S3, Google Cloud Storage, etc.
      console.log(`☁️ Uploading file package to cloud storage: ${compositionId}`);
      
      // Placeholder implementation
      const cloudUrl = `https://your-cloud-storage.com/files/${compositionId}.zip`;
      
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
      const file = await this.getCompositionFile(compositionId);
      if (!file) {
        throw new Error('File package not found');
      }

      const downloadId = uuidv4();
      const tempPath = path.join(this.fileStoragePath, 'temp', `${downloadId}.zip`);
      
      await fs.ensureDir(path.dirname(tempPath));
      await fs.writeFile(tempPath, file.buffer);

      // Schedule cleanup
      setTimeout(async () => {
        try {
          await fs.remove(tempPath);
          console.log(`🧹 Cleaned up temporary file: ${downloadId}`);
        } catch (error) {
          console.error('Error cleaning up temporary file:', error);
        }
      }, expiresIn);

      return {
        downloadUrl: `/api/download/${downloadId}`,
        expiresAt: new Date(Date.now() + expiresIn).toISOString(),
        size: file.size
      };
    } catch (error) {
      console.error('Error generating download link:', error);
      throw new Error(`Download link generation failed: ${error.message}`);
    }
  }

  // Get file statistics
  async getFileStats() {
    try {
      const compositionsDir = path.join(this.fileStoragePath, 'compositions');
      
      if (!(await fs.pathExists(compositionsDir))) {
        return { totalFiles: 0, totalSize: 0, averageSize: 0 };
      }

      const files = await fs.readdir(compositionsDir);
      const zipFiles = files.filter(file => file.endsWith('.zip'));
      
      let totalSize = 0;
      for (const file of zipFiles) {
        const filePath = path.join(compositionsDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return {
        totalFiles: zipFiles.length,
        totalSize: totalSize,
        averageSize: zipFiles.length > 0 ? Math.round(totalSize / zipFiles.length) : 0
      };
    } catch (error) {
      console.error('Error getting file stats:', error);
      return { totalFiles: 0, totalSize: 0, averageSize: 0 };
    }
  }
}

module.exports = new FileService(); 