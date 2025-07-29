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
  console.log(`${key}: ${value ? value.substring(0, 20) + '...' : 'NOT SET'}`);
});

console.log('\n📁 Current working directory:', process.cwd());
console.log('📄 .env file exists:', require('fs').existsSync('.env')); 