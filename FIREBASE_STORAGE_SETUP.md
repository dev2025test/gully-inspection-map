# Firebase Storage Setup for Gully Inspection System

This guide will help you set up Firebase Storage for photo uploads in the Gully Inspection System.

## Prerequisites

1. **Firebase CLI** installed and configured
2. **Google Cloud SDK** (gsutil) installed and configured
3. **Node.js** installed
4. **Firebase project** created and configured

## Quick Setup

### 1. Install Dependencies

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Install Google Cloud SDK (if not already installed)
# Download from: https://cloud.google.com/sdk/docs/install
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project (if not already done)

```bash
firebase init
```

### 4. Run the Setup Script

```bash
node setup-firebase-storage.js
```

## Manual Setup Steps

If the automated setup doesn't work, follow these manual steps:

### Step 1: Deploy Storage Rules

```bash
firebase deploy --only storage
```

### Step 2: Set CORS Configuration

```bash
gsutil cors set cors.json gs://gullytest3.appspot.com
```

### Step 3: Create Storage Folders

```bash
# Create main folders
gsutil mb gs://gullytest3.appspot.com/inspections/
gsutil mb gs://gullytest3.appspot.com/gullies/
gsutil mb gs://gullytest3.appspot.com/playgrounds/
gsutil mb gs://gullytest3.appspot.com/walkways/
gsutil mb gs://gullytest3.appspot.com/signage/
gsutil mb gs://gullytest3.appspot.com/lining/
```

## Storage Rules

The storage rules are defined in `storage.rules` and allow:

- **Read access**: All authenticated users can read photos
- **Write access**: Authenticated users can upload photos to specific folders
- **File restrictions**: Only image files (JPG, PNG, GIF, WebP) up to 10MB
- **Delete access**: Only admin users can delete photos

## CORS Configuration

The CORS configuration in `cors.json` allows requests from:

- Local development servers (localhost:8000, localhost:3000, etc.)
- Production domains (Netlify, Firebase Hosting)

## Folder Structure

```
gs://gullytest3.appspot.com/
├── inspections/
│   └── {gullyId}/
│       └── {timestamp}_{filename}
├── gullies/
│   └── {gullyId}/
│       └── {timestamp}_{filename}
├── playgrounds/
├── walkways/
├── signage/
└── lining/
```

## Testing the Setup

### 1. Test Storage Connection

Run this in your browser console:

```javascript
// Test Firebase Storage connection
window.enhancedPhotoUpload.testConnection()
  .then(() => console.log('✅ Storage connection working'))
  .catch(error => console.error('❌ Storage connection failed:', error));
```

### 2. Test Photo Upload

1. Open the Gully Inspection System
2. Log in with your credentials
3. Click on a gully marker
4. Click "Take Photo" and select an image
5. Save the inspection
6. Check the browser console for upload progress

### 3. Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (gullytest3)
3. Go to Storage section
4. Check if photos are being uploaded to the correct folders

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. **Check CORS configuration**:
   ```bash
   gsutil cors get gs://gullytest3.appspot.com
   ```

2. **Update CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://gullytest3.appspot.com
   ```

3. **Add your domain** to the CORS configuration if not included

### Permission Errors

If you see permission errors:

1. **Check Firebase Storage rules**:
   ```bash
   firebase deploy --only storage
   ```

2. **Verify user authentication** in the browser console

3. **Check user role** in Firebase Database

### Upload Failures

If photo uploads fail:

1. **Check file size** (max 10MB)
2. **Check file type** (only images allowed)
3. **Check network connection**
4. **Check browser console** for specific error messages

## Security Considerations

1. **File size limits**: 10MB maximum per file
2. **File type restrictions**: Only image files allowed
3. **Authentication required**: All uploads require user authentication
4. **Role-based access**: Only admins can delete files
5. **Metadata tracking**: All uploads include user and timestamp metadata

## Monitoring and Maintenance

### Storage Usage

Monitor storage usage in the Firebase Console:
- Go to Storage section
- Check usage metrics
- Set up billing alerts if needed

### Cleanup

To clean up old photos:

```bash
# List files older than 30 days
gsutil ls -l gs://gullytest3.appspot.com/inspections/ | grep "2024-"

# Delete specific files (be careful!)
gsutil rm gs://gullytest3.appspot.com/inspections/{gullyId}/{filename}
```

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify Firebase project configuration
3. Test with the enhanced photo upload functions
4. Check Firebase Storage logs in the console

## Files Created

- `storage.rules` - Firebase Storage security rules
- `cors.json` - CORS configuration for cross-origin requests
- `enhanced-photo-upload.js` - Enhanced photo upload functions
- `setup-firebase-storage.js` - Automated setup script
- `deploy-storage-rules.js` - Storage rules deployment script

## Next Steps

After setup is complete:

1. Test photo uploads in the application
2. Monitor storage usage
3. Set up backup procedures if needed
4. Configure storage lifecycle policies if required
