// Test Firebase Storage Setup
// Run this in your browser console to test the storage connection

console.log('🧪 Testing Firebase Storage Setup...');

// Test 1: Check if Firebase Storage is initialized
if (typeof storage !== 'undefined') {
  console.log('✅ Firebase Storage is initialized');
} else {
  console.error('❌ Firebase Storage is not initialized');
  console.log('💡 Make sure firebase-storage-compat.js is loaded');
}

// Test 2: Check if enhanced photo upload functions are available
if (typeof window.enhancedPhotoUpload !== 'undefined') {
  console.log('✅ Enhanced photo upload functions are available');
} else {
  console.error('❌ Enhanced photo upload functions are not available');
  console.log('💡 Make sure enhanced-photo-upload.js is loaded');
}

// Test 3: Test storage connection
async function testStorageConnection() {
  try {
    console.log('🔍 Testing storage connection...');
    
    if (!window.storage) {
      throw new Error('Firebase Storage not available');
    }
    
    // Create a test reference
    const testRef = window.storage.ref('test-connection');
    console.log('✅ Storage reference created successfully');
    
    // Try to upload a small test string
    const testData = 'Test connection ' + Date.now();
    await testRef.putString(testData, 'raw');
    console.log('✅ Test upload successful');
    
    // Get download URL
    const downloadURL = await testRef.getDownloadURL();
    console.log('✅ Download URL obtained:', downloadURL);
    
    // Delete test file
    await testRef.delete();
    console.log('✅ Test file deleted successfully');
    
    console.log('🎉 All storage tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Storage test failed:', error.message);
    
    if (error.code === 'storage/unauthorized') {
      console.log('💡 This might be a permissions issue. Check Firebase Storage rules.');
    } else if (error.message.includes('CORS')) {
      console.log('💡 This might be a CORS issue. Check CORS configuration.');
    } else if (error.code === 'storage/unknown') {
      console.log('💡 This might be a network or authentication issue.');
    }
    
    return false;
  }
}

// Test 4: Test enhanced photo upload functions
async function testEnhancedFunctions() {
  try {
    console.log('🔍 Testing enhanced photo upload functions...');
    
    if (!window.enhancedPhotoUpload) {
      throw new Error('Enhanced photo upload functions not available');
    }
    
    // Test connection function
    const connectionTest = await window.enhancedPhotoUpload.testConnection();
    console.log('✅ Enhanced connection test passed');
    
    return true;
    
  } catch (error) {
    console.error('❌ Enhanced functions test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running all Firebase Storage tests...\n');
  
  const storageTest = await testStorageConnection();
  const enhancedTest = await testEnhancedFunctions();
  
  console.log('\n📊 Test Results:');
  console.log(`Storage Connection: ${storageTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Enhanced Functions: ${enhancedTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (storageTest && enhancedTest) {
    console.log('\n🎉 All tests passed! Firebase Storage is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('1. Try uploading a photo in the application');
    console.log('2. Check Firebase Console to see uploaded files');
    console.log('3. Monitor storage usage');
  } else {
    console.log('\n⚠️ Some tests failed. Check the setup guide for troubleshooting.');
  }
}

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
  // Wait a bit for Firebase to initialize
  setTimeout(runAllTests, 2000);
}

// Export functions for manual testing
window.testFirebaseStorage = runAllTests;
window.testStorageConnection = testStorageConnection;
window.testEnhancedFunctions = testEnhancedFunctions;

console.log('🧪 Storage test functions loaded. Run testFirebaseStorage() to test everything.');
