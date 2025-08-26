// Enhanced Photo Upload Function for Gully Inspection System
// This function provides better error handling, CORS support, and progress tracking

window.enhancedPhotoUpload = {
  // Upload photo with enhanced error handling and progress tracking
  async uploadPhoto(file, gullyId, layerType = 'inspections') {
    console.log('Enhanced photo upload started for gully:', gullyId);
    
    if (!file) {
      throw new Error('No file provided for upload');
    }
    
    if (!gullyId) {
      throw new Error('No gully ID provided for upload');
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.');
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }
    
    // Check if Firebase Storage is available
    if (!window.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    try {
      // Create a unique filename with timestamp and sanitized name
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      
      // Create storage reference
      const storageRef = window.storage.ref(`${layerType}/${gullyId}/${fileName}`);
      
      // Set metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'uploaded-by': window.currentUserData ? window.currentUserData.email : 'unknown',
          'gully-id': gullyId,
          'upload-timestamp': timestamp.toString(),
          'original-filename': file.name,
          'file-size': file.size.toString()
        }
      };
      
      console.log('Uploading photo with metadata:', metadata);
      
      // Upload with metadata
      const uploadTask = storageRef.put(file, metadata);
      
      // Return a promise that resolves with the download URL
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          // Progress function
          (snapshot) => {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            console.log(`Upload progress: ${percent}%`);
            
            // Update progress UI if available
            this.updateProgressUI(percent);
          },
          // Error function
          (error) => {
            console.error('Upload error:', error);
            this.updateProgressUI(0, 'Upload failed');
            reject(this.handleUploadError(error));
          },
          // Success function
          async () => {
            try {
              const downloadURL = await storageRef.getDownloadURL();
              console.log('Photo uploaded successfully:', downloadURL);
              this.updateProgressUI(100, 'Upload complete');
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(new Error('Failed to get download URL: ' + error.message));
            }
          }
        );
      });
      
    } catch (error) {
      console.error('Photo upload failed:', error);
      throw this.handleUploadError(error);
    }
  },
  
  // Handle upload errors with user-friendly messages
  handleUploadError(error) {
    console.error('Handling upload error:', error);
    
    let userMessage = 'Photo upload failed. ';
    
    switch (error.code) {
      case 'storage/unauthorized':
        userMessage += 'Permission denied. Please check your authentication.';
        break;
      case 'storage/canceled':
        userMessage += 'Upload was canceled.';
        break;
      case 'storage/unknown':
        userMessage += 'Unknown error occurred. Please try again.';
        break;
      case 'storage/invalid-checksum':
        userMessage += 'File corruption detected. Please try uploading again.';
        break;
      case 'storage/retry-limit-exceeded':
        userMessage += 'Upload failed after multiple attempts. Please check your connection and try again.';
        break;
      case 'storage/invalid-format':
        userMessage += 'Invalid file format. Please use JPG, PNG, GIF, or WebP images.';
        break;
      case 'storage/cannot-slice-blob':
        userMessage += 'File processing error. Please try a different image.';
        break;
      default:
        if (error.message && error.message.includes('CORS')) {
          userMessage += 'CORS error detected. Please contact administrator to fix Firebase Storage CORS settings.';
        } else if (error.message && error.message.includes('network')) {
          userMessage += 'Network error. Please check your connection and try again.';
        } else {
          userMessage += error.message || 'Unknown error occurred.';
        }
    }
    
    return new Error(userMessage);
  },
  
  // Update progress UI
  updateProgressUI(percent, text = null) {
    const progressContainer = document.getElementById('photo-upload-progress-container');
    const progressBar = document.getElementById('photo-upload-progress-bar');
    const progressText = document.getElementById('photo-upload-progress-text');
    
    if (progressContainer && progressBar && progressText) {
      if (percent === 0 && text === 'Upload failed') {
        progressContainer.style.display = 'none';
        return;
      }
      
      if (percent === 100 && text === 'Upload complete') {
        progressBar.style.width = '100%';
        progressText.textContent = 'Upload complete!';
        setTimeout(() => { 
          progressContainer.style.display = 'none'; 
        }, 1000);
        return;
      }
      
      progressContainer.style.display = 'block';
      progressBar.style.width = percent + '%';
      progressText.textContent = text || `Uploading photo... ${percent}%`;
    }
  },
  
  // Test Firebase Storage connection
  async testConnection() {
    console.log('Testing Firebase Storage connection...');
    
    if (!window.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    
    try {
      const testRef = window.storage.ref('test-connection');
      await testRef.putString('test', 'raw');
      await testRef.delete();
      console.log('Firebase Storage connection test successful');
      return true;
    } catch (error) {
      console.error('Firebase Storage connection test failed:', error);
      throw error;
    }
  },
  
  // Delete photo from storage
  async deletePhoto(photoURL, gullyId, layerType = 'inspections') {
    console.log('Deleting photo:', photoURL);
    
    if (!photoURL) {
      console.log('No photo URL provided for deletion');
      return;
    }
    
    try {
      // Extract filename from URL
      const urlParts = photoURL.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      
      // Create storage reference
      const storageRef = window.storage.ref(`${layerType}/${gullyId}/${fileName}`);
      
      // Delete the file
      await storageRef.delete();
      console.log('Photo deleted successfully');
      
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Don't throw error for deletion failures as they're not critical
    }
  },
  
  // Get photo metadata
  async getPhotoMetadata(photoURL) {
    if (!photoURL) return null;
    
    try {
      const storageRef = window.storage.refFromURL(photoURL);
      const metadata = await storageRef.getMetadata();
      return metadata;
    } catch (error) {
      console.error('Error getting photo metadata:', error);
      return null;
    }
  }
};

// Initialize enhanced photo upload when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Enhanced photo upload system initialized');
  
  // Test connection on page load
  if (window.storage) {
    window.enhancedPhotoUpload.testConnection()
      .then(() => console.log('✅ Firebase Storage connection verified'))
      .catch(error => console.warn('⚠️ Firebase Storage connection test failed:', error.message));
  }
});

console.log('Enhanced photo upload functions loaded');
