require('dotenv').config();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Validate configuration
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  process.exit(1);
}

// Create an admin user with proper error handling and validation
async function createAdminUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (!email.includes('@') || password.length < 8) {
    throw new Error('Invalid email or password (password must be at least 8 characters)');
  }

  try {
    // Check if user already exists
    const existingUser = await firebase.auth().fetchSignInMethodsForEmail(email);
    if (existingUser.length > 0) {
      console.log(`User ${email} already exists`);
      return;
    }

    // Create user
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    
    // Set admin role with server timestamp
    await firebase.database().ref(`users/${uid}`).set({
      email,
      role: 'admin',
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      lastUpdated: firebase.database.ServerValue.TIMESTAMP
    });
    
    console.log('Admin user created successfully:', email);
    return uid;
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    throw error;
  }
}

// Export the functions and configuration for use in other files
module.exports = {
  createAdminUser,
  firebaseConfig
};

// Database security rules template
const databaseRules = {
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "gullies": {
      ".read": "auth != null",
      ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'operator'",
      "$gullyId": {
        ".validate": "newData.hasChildren(['location', 'lastInspection', 'status'])",
        "location": {
          ".validate": "newData.hasChildren(['lat', 'lng'])"
        }
      }
    },
    ".read": false,
    ".write": false
  }
};

// Example storage rules (Add these in Firebase Console)
const storageRules = `
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{gullyId}/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'operator');
    }
