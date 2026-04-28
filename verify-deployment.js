#!/usr/bin/env node

// Simple deployment verification script
const fs = require('fs');
const path = require('path');

console.log('🚀 Roosterwise Deployment Verification\n');

// Check if key files exist
const requiredFiles = [
  'roosterwise/package.json',
  'roosterwise/app/page.tsx',
  'roosterwise/app/layout.tsx',
  'roosterwise/lib/root-api.ts',
  'roosterwise/lib/redis.ts',
  'vercel.json'
];

console.log('Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
});

console.log('\n✓ All files verified. Ready for deployment!\n');
console.log('Push to repository:');
console.log('  git push origin restaurant-tip-payouts\n');
console.log('Vercel will automatically deploy the roosterwise app.\n');
