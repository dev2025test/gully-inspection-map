require('dotenv').config();

const firebase = require('firebase/compat/app');
require('firebase/compat/auth');
require('firebase/compat/database');

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gullytest3-default-rtdb.europe-west1.firebasedatabase.app"
});

async function cleanupDatabase() {
  try {
    // Get all users from Authentication
    const authUsers = await admin.auth().listUsers();
    const usersByEmail = {};
    
    // Create a map of email to UID
    authUsers.users.forEach(user => {
      usersByEmail[user.email] = user.uid;
    });

    // Get all database entries
    const dbSnapshot = await admin.database().ref('users').once('value');
    const dbData = dbSnapshot.val() || {};

    // Create new clean data structure
    const cleanData = {};
    for (const [email, uid] of Object.entries(usersByEmail)) {
      // Find the role from existing data
      let role = null;
      for (const userData of Object.values(dbData)) {
        if (userData.email === email) {
          role = userData.role;
          break;
        }
      }
      
      if (role) {
        cleanData[uid] = {
          email: email,
          role: role,
          created: admin.database.ServerValue.TIMESTAMP
        };
      }
    }

    // Clear and set new data
    await admin.database().ref('users').set(cleanData);
    console.log('Database cleaned up successfully');

    // Verify the cleanup
    const verifySnapshot = await admin.database().ref('users').once('value');
    const finalData = verifySnapshot.val();
    console.log('\nFinal Database State:');
    for (const [uid, userData] of Object.entries(finalData)) {
      console.log(`- ${userData.email} (Role: ${userData.role})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupDatabase(); 