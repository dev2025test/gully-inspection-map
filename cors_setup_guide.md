# CORS Configuration Setup Guide for Firebase Storage

This guide explains exactly where and how to implement CORS configuration for your Firebase Storage bucket.

## 🎯 **What is CORS and Why Do You Need It?**

**CORS (Cross-Origin Resource Sharing)** is a security feature that prevents web browsers from making requests to different domains. Without proper CORS configuration, your web app won't be able to upload photos to Firebase Storage.

### **The Problem:**
- Your web app runs on: `http://localhost:8000` (development) or `https://gully-inspection-cccdev2025netlifyapp.netlify.app` (production)
- Firebase Storage is on: `https://firebasestorage.googleapis.com/...`
- Browser blocks requests between different domains unless CORS is configured

## 📍 **Where to Implement CORS Configuration**

### **Location 1: Command Line/Terminal (Recommended)**

#### **Step 1: Install Google Cloud SDK**

**For Windows:**
1. Download from: https://cloud.google.com/sdk/docs/install-windows
2. Run the installer
3. Open Command Prompt or PowerShell

**For Mac/Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

#### **Step 2: Authenticate**
```bash
gcloud auth login
```

#### **Step 3: Set CORS Configuration**
```bash
# Navigate to your project directory
cd "C:\Users\Mick\Documents\Working Gully Applicattion\gully-inspection database\gully-inspection database\gully-inspection-map-main"

# Set CORS configuration
gsutil cors set cors.json gs://gullytest3.appspot.com
```

### **Location 2: Automated Scripts (Easiest)**

#### **Option A: Windows Batch Script**
```bash
# Double-click or run:
set-cors-configuration.bat
```

#### **Option B: PowerShell Script**
```powershell
# Run in PowerShell:
.\set-cors-configuration.ps1
```

### **Location 3: Manual Firebase Console (Alternative)**

If you can't use command line:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `gullytest3`
3. Go to **Cloud Storage** → **Browser**
4. Click on your bucket: `gullytest3.appspot.com`
5. Go to **Permissions** tab
6. Add CORS configuration manually

## 🔧 **CORS Configuration Details**

### **Your `cors.json` File:**
```json
[
  {
    "origin": [
      "http://localhost:8000",
      "http://localhost:3000", 
      "http://localhost:5000",
      "https://gully-inspection-cccdev2025netlifyapp.netlify.app",
      "https://gullytest3.firebaseapp.com",
      "https://gullytest3.web.app"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods", 
      "Access-Control-Allow-Headers",
      "Access-Control-Max-Age"
    ]
  }
]
```

### **What Each Part Does:**

- **`origin`**: List of domains allowed to access your storage
- **`method`**: HTTP methods allowed (GET=download, PUT=upload, etc.)
- **`maxAgeSeconds`**: How long browser caches CORS settings
- **`responseHeader`**: Headers exposed to your web app

## 🚀 **Step-by-Step Implementation**

### **Method 1: Using the Automated Script (Recommended)**

1. **Open Command Prompt** in your project directory
2. **Run the batch script:**
   ```bash
   set-cors-configuration.bat
   ```
3. **Follow the prompts** - the script will:
   - Check if gsutil is installed
   - Verify authentication
   - Set CORS configuration
   - Verify the setup

### **Method 2: Manual Command Line**

1. **Open Command Prompt/PowerShell**
2. **Navigate to project directory:**
   ```bash
   cd "C:\Users\Mick\Documents\Working Gully Applicattion\gully-inspection database\gully-inspection database\gully-inspection-map-main"
   ```
3. **Check if gsutil is available:**
   ```bash
   gsutil --version
   ```
4. **Authenticate (if needed):**
   ```bash
   gcloud auth login
   ```
5. **Set CORS configuration:**
   ```bash
   gsutil cors set cors.json gs://gullytest3.appspot.com
   ```
6. **Verify the configuration:**
   ```bash
   gsutil cors get gs://gullytest3.appspot.com
   ```

## ✅ **Verification Steps**

### **1. Check CORS Configuration**
```bash
gsutil cors get gs://gullytest3.appspot.com
```

### **2. Test in Browser Console**
```javascript
// Test Firebase Storage connection
testFirebaseStorage();
```

### **3. Test Photo Upload**
1. Open your gully inspection app
2. Log in
3. Click on a gully marker
4. Try to upload a photo
5. Check browser console for errors

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **Issue 1: "gsutil not found"**
**Solution:**
```bash
# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install-windows
```

#### **Issue 2: "Not authenticated"**
**Solution:**
```bash
gcloud auth login
```

#### **Issue 3: "Permission denied"**
**Solution:**
- Make sure you're logged in with the correct Google account
- Verify you have access to the Firebase project
- Check if you're a project owner or have Storage Admin role

#### **Issue 4: "CORS errors in browser"**
**Solution:**
1. Verify CORS is set correctly:
   ```bash
   gsutil cors get gs://gullytest3.appspot.com
   ```
2. Make sure your domain is in the `origin` list
3. Check that the bucket name is correct

### **Error Messages and Solutions:**

| Error | Solution |
|-------|----------|
| `gsutil: command not found` | Install Google Cloud SDK |
| `Access denied` | Run `gcloud auth login` |
| `Bucket not found` | Check bucket name: `gullytest3.appspot.com` |
| `CORS policy too large` | Reduce the number of origins in cors.json |

## 📋 **Complete Setup Checklist**

- [ ] Google Cloud SDK installed
- [ ] Authenticated with `gcloud auth login`
- [ ] `cors.json` file exists in project directory
- [ ] CORS configuration set with `gsutil cors set`
- [ ] Configuration verified with `gsutil cors get`
- [ ] Firebase Storage rules deployed
- [ ] Photo upload tested in application
- [ ] No CORS errors in browser console

## 🎉 **Success Indicators**

When CORS is configured correctly, you should see:

1. **No CORS errors** in browser console
2. **Successful photo uploads** to Firebase Storage
3. **Photos visible** in Firebase Console Storage section
4. **Download URLs** working for uploaded photos

## 📞 **Need Help?**

If you encounter issues:

1. **Check the error messages** in the command line
2. **Verify your setup** using the verification steps
3. **Check browser console** for specific error details
4. **Ensure all prerequisites** are met (SDK installed, authenticated, etc.)

The automated scripts (`set-cors-configuration.bat` or `set-cors-configuration.ps1`) will guide you through the process and provide helpful error messages if something goes wrong.
