# Manual Firebase Storage Setup

Since the automated setup requires Firebase CLI project access, follow these manual steps to set up Firebase Storage for your gully inspection system.

## Step 1: Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `gullytest3`
3. **Enable Storage**:
   - Go to "Storage" in the left sidebar
   - Click "Get started"
   - Choose "Start in test mode" (we'll add rules later)
   - Select a location (choose the same region as your database)

## Step 2: Deploy Storage Rules

1. **Copy the storage rules** from `storage.rules` file
2. **In Firebase Console**:
   - Go to Storage → Rules
   - Replace the default rules with the content from `storage.rules`
   - Click "Publish"

## Step 3: Set CORS Configuration

1. **Install Google Cloud SDK** (if not already installed):
   - Download from: https://cloud.google.com/sdk/docs/install
   - Install and run `gcloud init`

2. **Set CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://gullytest3.appspot.com
   ```

## Step 4: Test the Setup

1. **Add the enhanced photo upload script** to your HTML:
   ```html
   <script src="enhanced-photo-upload.js"></script>
   ```

2. **Test in browser console**:
   ```javascript
   // Test Firebase Storage connection
   window.enhancedPhotoUpload.testConnection()
     .then(() => console.log('✅ Storage connection working'))
     .catch(error => console.error('❌ Storage connection failed:', error));
   ```

## Step 5: Update Your Application

Add this script tag to your `index.html` file (after the Firebase scripts):

```html
<script src="enhanced-photo-upload.js"></script>
```

## Troubleshooting

### If you get CORS errors:
1. Make sure CORS is set correctly
2. Check that your domain is in the CORS configuration
3. Verify Firebase Storage rules are deployed

### If you get permission errors:
1. Check that users are authenticated
2. Verify Firebase Storage rules allow the operation
3. Check user roles in the database

### If uploads fail:
1. Check file size (max 10MB)
2. Check file type (only images)
3. Check network connection
4. Look at browser console for specific errors

## Files Created

- `storage.rules` - Copy these rules to Firebase Console
- `cors.json` - Use this for CORS configuration
- `enhanced-photo-upload.js` - Enhanced upload functions
- `manual-firebase-setup.md` - This guide

## Next Steps

After completing the setup:
1. Test photo uploads in your application
2. Check Firebase Console to see uploaded files
3. Monitor storage usage
4. Set up billing alerts if needed
