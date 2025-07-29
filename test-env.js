require('dotenv').config();

console.log('🔍 Testing Environment Variables...\n');

// Check if dotenv is working
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Check the specific variables
console.log('\n📋 API Keys:');
console.log('NOTION_API_KEY:', process.env.NOTION_API_KEY ? 'SET' : 'NOT SET');
console.log('NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID ? 'SET' : 'NOT SET');
console.log('MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? 'SET' : 'NOT SET');
console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN ? 'SET' : 'NOT SET');

// Check if they're placeholder values
console.log('\n🔍 Checking for placeholder values:');
console.log('NOTION_API_KEY starts with "your_":', process.env.NOTION_API_KEY?.startsWith('your_'));
console.log('MAILGUN_API_KEY starts with "your_":', process.env.MAILGUN_API_KEY?.startsWith('your_'));

console.log('\n📄 .env file path:', require('path').resolve('.env'));
console.log('📄 .env file exists:', require('fs').existsSync('.env')); 