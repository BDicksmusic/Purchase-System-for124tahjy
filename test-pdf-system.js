require('dotenv').config();
const pdfService = require('./src/services/pdfService');
const notionService = require('./src/services/notionService');

async function testPdfSystem() {
  console.log('🔍 Testing PDF System...\n');

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
    console.log(`📄 PDF URL from Notion: ${testComposition.pdfUrl || 'Not set'}`);

    // Test 2: Try to get PDF for the composition
    console.log('\n🔍 Testing PDF retrieval...');
    const pdf = await pdfService.getCompositionPdf(testComposition.id, testComposition);
    
    if (pdf) {
      console.log(`✅ PDF found!`);
      console.log(`   Source: ${pdf.source}`);
      console.log(`   Size: ${pdf.size} bytes`);
      console.log(`   Path: ${pdf.path}`);
    } else {
      console.log('❌ No PDF found for this composition');
      console.log('\n💡 To add PDFs, you can:');
      console.log('   1. Add PDF URLs to your Notion database');
      console.log('   2. Upload PDFs to ./storage/pdfs/compositions/');
      console.log('   3. Use cloud storage URLs');
    }

    // Test 3: Get PDF statistics
    console.log('\n📊 PDF Statistics:');
    const stats = await pdfService.getPdfStats();
    console.log(`   Total PDFs: ${stats.totalPdfs}`);
    console.log(`   Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Average Size: ${(stats.averageSize / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('❌ Error testing PDF system:', error.message);
  }
}

testPdfSystem(); 