const { execSync } = require('child_process');

console.log('Deploying Firebase Storage rules...');

try {
  // Deploy storage rules
  execSync('firebase deploy --only storage', { stdio: 'inherit' });
  console.log('✅ Firebase Storage rules deployed successfully!');
} catch (error) {
  console.error('❌ Error deploying Firebase Storage rules:', error.message);
  console.log('\nTo deploy manually, run:');
  console.log('firebase deploy --only storage');
}
