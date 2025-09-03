require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// Load service account from file
let serviceAccount;
try {
  serviceAccount = require('./serviceaccountkey.json');
} catch (error) {
  console.error('Error loading serviceaccountkey.json:', error);
  console.error('Please ensure serviceaccountkey.json exists');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gullytest3-default-rtdb.europe-west1.firebasedatabase.app"
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

async function createSerenaUser() {
  const email = 'serena_oconnor@corkcity.ie';
  const uid = 'D8dFOiXupcfVUikt9uwcOImYtCy1';
  const password = 'TempSerena2024!'; // Temporary password that should be changed
  
  try {
    console.log('Creating Serena O\'Connor user account...');
    
    // Check if user already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      console.log(`User ${email} already exists with UID: ${existingUser.uid}`);
      
      if (existingUser.uid !== uid) {
        console.log('UID mismatch. Deleting existing user to recreate with correct UID...');
        await admin.auth().deleteUser(existingUser.uid);
      } else {
        console.log('User already exists with correct UID. Updating database record...');
        await updateDatabaseRecord(uid, email);
        console.log('Database record updated successfully.');
        return;
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Check if UID is already in use
    try {
      const uidUser = await admin.auth().getUser(uid);
      console.log(`UID ${uid} is already in use by user: ${uidUser.email}`);
      if (uidUser.email !== email) {
        console.log('Deleting conflicting user...');
        await admin.auth().deleteUser(uid);
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Create user with custom UID
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      uid: uid,
      emailVerified: true
    });
    
    console.log(`Created user ${email} with UID: ${userRecord.uid}`);
    
    // Create database record
    await updateDatabaseRecord(uid, email);
    
    console.log('\nSerena O\'Connor user account created successfully!');
    console.log(`Email: ${email}`);
    console.log(`UID: ${uid}`);
    console.log(`Temporary Password: ${password}`);
    console.log('\nIMPORTANT: Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating Serena O\'Connor user:', error);
    process.exit(1);
  }
}

async function updateDatabaseRecord(uid, email) {
  await admin.database().ref(`users/${uid}`).set({
    email: email,
    role: 'admin',
    initials: 'SO',
    name: 'Serena O\'Connor',
    isAdmin: true,
    adminPrivileges: {
      canDelete: true,
      canEdit: true,
      canImport: true,
      canExport: true,
      canReset: true,
      canManageUsers: true
    },
    created: admin.database.ServerValue.TIMESTAMP,
    lastUpdated: admin.database.ServerValue.TIMESTAMP
  });
  
  console.log('Database record created/updated successfully');
}

// Run the script
createSerenaUser().then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
