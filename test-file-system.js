require('dotenv').config();
const fileService = require('./src/services/pdfService'); // Updated to use FileService
const notionService = require('./src/services/notionService');

async function testFileSystem() {
  console.log('🔍 Testing File System (ZIP)...\n');

  try {
    // Test 1: Get compositions from Notion
    console.log('📝 Getting compositions from Notion...');
    const compositions = await notionService.getCompositions();
    
    if (compositions.length === 0) {
      console.log('⚠️ No compositions found in Notion');
      return;
    }

    const testComposition = compositions[0];
    console.log(`✅ Found composition: ${testComposition.title}`);
    console.log(`📄 File URL from Notion: ${testComposition.pdfUrl || 'Not set'}`);

    // Test 2: Try to get file package for the composition
    console.log('\n🔍 Testing file package retrieval...');
    const file = await fileService.getCompositionFile(testComposition.id, testComposition);
    
    if (file) {
      console.log(`✅ File package found!`);
      console.log(`   Source: ${file.source}`);
      console.log(`   Size: ${file.size} bytes`);
      console.log(`   Path: ${file.path}`);
    } else {
      console.log('❌ No file package found for this composition');
      console.log('\n💡 To add file packages, you can:');
      console.log('   1. Add ZIP file URLs to your Notion database');
      console.log('   2. Upload ZIP files to ./storage/files/compositions/');
      console.log('   3. Use cloud storage URLs');
    }

    // Test 3: Get file statistics
    console.log('\n📊 File Statistics:');
    const stats = await fileService.getFileStats();
    console.log(`   Total Files: ${stats.totalFiles}`);
    console.log(`   Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Average Size: ${(stats.averageSize / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Error testing file system:', error.message);
  }
}

testFileSystem(); 