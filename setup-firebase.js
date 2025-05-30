// Replace these values with your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create an admin user (Run this in Firebase Cloud Functions or your secure backend)
async function createAdminUser(email, password) {
  try {
    // Create user
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    
    // Set admin role
    await firebase.database().ref(`users/${uid}/role`).set('admin');
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Example database rules (Add these in Firebase Console)
const databaseRules = {
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "gullies": {
      ".read": "auth != null",
      ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'operator'"
    }
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
  }
}
`; 