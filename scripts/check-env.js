// Check if environment variables are properly loaded
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('----------------------------');

// Check required environment variables
const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

let allVarsPresent = true;

requiredVars.forEach(varName => {
  const isPresent = process.env[varName] !== undefined;
  console.log(`${varName}: ${isPresent ? '✅' : '❌'}`);
  if (!isPresent) allVarsPresent = false;
});

console.log('\nAdditional Environment Variables:');
console.log('--------------------------------');

// Show other non-required but common variables
const otherVars = Object.keys(process.env)
  .filter(key => !requiredVars.includes(key) && !key.startsWith('npm_'));

otherVars.forEach(varName => {
  const value = varName.includes('SECRET') || varName.includes('PASSWORD') 
    ? '*****' 
    : process.env[varName];
  console.log(`${varName}=${value}`);
});

if (!allVarsPresent) {
  console.error('\n❌ Missing required environment variables!');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are present');
  process.exit(0);
}
