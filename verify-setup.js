const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gullytest3-default-rtdb.europe-west1.firebasedatabase.app"
});

async function verifySetup() {
  try {
    // Check Authentication users
    console.log('Checking Authentication users...');
    const listUsersResult = await admin.auth().listUsers();
    console.log('\nUsers in Authentication:');
    listUsersResult.users.forEach(userRecord => {
      console.log(`- ${userRecord.email} (UID: ${userRecord.uid})`);
    });

    // Check Database roles
    console.log('\nChecking Database roles...');
    const usersSnapshot = await admin.database().ref('users').once('value');
    const users = usersSnapshot.val();
    
    console.log('\nUsers in Database:');
    for (const [uid, userData] of Object.entries(users)) {
      console.log(`- ${userData.email} (Role: ${userData.role})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifySetup(); 