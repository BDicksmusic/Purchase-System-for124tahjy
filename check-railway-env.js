require('dotenv').config();

console.log('🔍 Checking Railway Environment Variables for Email Service...\n');

const requiredVars = [
    'MAILGUN_API_KEY',
    'MAILGUN_DOMAIN', 
    'EMAIL_FROM',
    'EMAIL_FROM_NAME',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
];

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: SET (${value.substring(0, 10)}...)`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
    }
});

console.log('\n📧 Email Service Configuration:');
console.log(`   - MAILGUN_API_KEY: ${process.env.MAILGUN_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`   - MAILGUN_DOMAIN: ${process.env.MAILGUN_DOMAIN || 'NOT SET'}`);
console.log(`   - EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
console.log(`   - EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || 'NOT SET'}`);

console.log('\n💳 Stripe Configuration:');
console.log(`   - STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'}`);
console.log(`   - STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET'}`); 