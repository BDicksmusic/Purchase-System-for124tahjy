require('dotenv').config();

console.log('🔧 Testing Configuration...\n');

const requiredVars = {
  'Stripe': ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'],
  'Mailgun': ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN'],
  'Notion': ['NOTION_API_KEY', 'NOTION_DATABASE_ID'],
  'Security': ['JWT_SECRET', 'SESSION_SECRET'],
  'Email': ['EMAIL_FROM', 'EMAIL_FROM_NAME']
};

let allGood = true;

for (const [category, vars] of Object.entries(requiredVars)) {
  console.log(`📋 ${category} Configuration:`);
  
  for (const varName of vars) {
    const value = process.env[varName];
    const status = value && value !== `your_${varName.toLowerCase()}_here` ? '✅' : '❌';
    const displayValue = value ? 
      (varName.includes('KEY') || varName.includes('SECRET') ? 
        `${value.substring(0, 8)}...` : value) : 
      'NOT SET';
    
    console.log(`   ${status} ${varName}: ${displayValue}`);
    
    if (!value || value === `your_${varName.toLowerCase()}_here`) {
      allGood = false;
    }
  }
  console.log('');
}

if (allGood) {
  console.log('🎉 All required configuration is set!');
  console.log('\n📝 Next steps:');
  console.log('   1. Add your actual API keys to .env file');
  console.log('   2. Run: npm start');
  console.log('   3. Test your endpoints');
} else {
  console.log('⚠️  Please configure the missing values in your .env file');
  console.log('\n📝 You need to:');
  console.log('   1. Get your Stripe API keys from dashboard.stripe.com');
  console.log('   2. Get your Mailgun API key from app.mailgun.com');
  console.log('   3. Get your Notion API key from notion.so/my-integrations');
  console.log('   4. Update the .env file with real values');
}

console.log('\n🔗 Useful Links:');
console.log('   Stripe Dashboard: https://dashboard.stripe.com/apikeys');
console.log('   Mailgun Dashboard: https://app.mailgun.com/app/account/security/api_keys');
console.log('   Notion Integrations: https://notion.so/my-integrations'); 