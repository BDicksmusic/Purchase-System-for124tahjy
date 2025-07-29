require('dotenv').config();

console.log('🔍 Debugging Environment Variables...\n');

const keys = [
  'NOTION_API_KEY',
  'NOTION_DATABASE_ID', 
  'MAILGUN_API_KEY',
  'MAILGUN_DOMAIN',
  'JWT_SECRET',
  'SESSION_SECRET'
];

keys.forEach(key => {
  const value = process.env[key];
  console.log(`${key}: ${value || 'NOT SET'}`);
});

console.log('\n📁 Current working directory:', process.cwd());
console.log('📄 .env file exists:', require('fs').existsSync('.env'));

// Check if .env file is readable
try {
  const fs = require('fs');
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('\n📄 .env file content (first 500 chars):');
  console.log(envContent.substring(0, 500));
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
} 