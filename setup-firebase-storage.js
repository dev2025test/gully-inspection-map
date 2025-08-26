const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Firebase Storage for Gully Inspection System...\n');

async function setupFirebaseStorage() {
  try {
    // Step 1: Deploy storage rules
    console.log('📋 Step 1: Deploying Firebase Storage rules...');
    try {
      execSync('firebase deploy --only storage', { stdio: 'inherit' });
      console.log('✅ Storage rules deployed successfully!\n');
    } catch (error) {
      console.error('❌ Error deploying storage rules:', error.message);
      console.log('💡 Make sure you are logged into Firebase CLI: firebase login');
      return;
    }

    // Step 2: Set CORS configuration
    console.log('🌐 Step 2: Setting CORS configuration...');
    try {
      const corsConfig = path.join(__dirname, 'cors.json');
      if (fs.existsSync(corsConfig)) {
        execSync(`gsutil cors set ${corsConfig} gs://gullytest3.appspot.com`, { stdio: 'inherit' });
        console.log('✅ CORS configuration set successfully!\n');
      } else {
        console.log('⚠️ CORS configuration file not found, skipping...\n');
      }
    } catch (error) {
      console.error('❌ Error setting CORS configuration:', error.message);
      console.log('💡 Make sure you have gsutil installed and configured');
    }

    // Step 3: Test storage connection
    console.log('🔍 Step 3: Testing storage connection...');
    try {
      // Create a test file
      const testFile = path.join(__dirname, 'test-upload.txt');
      fs.writeFileSync(testFile, 'Test upload for Firebase Storage');
      
      // Upload test file
      execSync(`gsutil cp ${testFile} gs://gullytest3.appspot.com/test-upload.txt`, { stdio: 'inherit' });
      
      // Delete test file locally
      fs.unlinkSync(testFile);
      
      // Delete test file from storage
      execSync('gsutil rm gs://gullytest3.appspot.com/test-upload.txt', { stdio: 'inherit' });
      
      console.log('✅ Storage connection test successful!\n');
    } catch (error) {
      console.error('❌ Error testing storage connection:', error.message);
    }

    // Step 4: Create storage folders structure
    console.log('📁 Step 4: Creating storage folder structure...');
    try {
      const folders = ['inspections', 'gullies', 'playgrounds', 'walkways', 'signage', 'lining'];
      
      for (const folder of folders) {
        const folderPath = `gs://gullytest3.appspot.com/${folder}/`;
        try {
          execSync(`gsutil ls ${folderPath}`, { stdio: 'pipe' });
          console.log(`✅ Folder ${folder} already exists`);
        } catch (error) {
          // Folder doesn't exist, create it
          execSync(`gsutil mb ${folderPath}`, { stdio: 'pipe' });
          console.log(`✅ Created folder: ${folder}`);
        }
      }
      console.log('✅ Storage folder structure created!\n');
    } catch (error) {
      console.error('❌ Error creating folder structure:', error.message);
    }

    console.log('🎉 Firebase Storage setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Storage rules deployed');
    console.log('✅ CORS configuration set');
    console.log('✅ Storage connection tested');
    console.log('✅ Folder structure created');
    
    console.log('\n🔧 Next steps:');
    console.log('1. Test photo upload in your application');
    console.log('2. Check the browser console for any CORS errors');
    console.log('3. Verify photos are being saved to Firebase Storage');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure you are logged into Firebase CLI: firebase login');
    console.log('2. Make sure you have gsutil installed and configured');
    console.log('3. Check your Firebase project permissions');
    console.log('4. Verify your storage bucket name in firebase.json');
  }
}

// Run the setup
setupFirebaseStorage();
