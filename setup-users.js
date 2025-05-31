const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gullytest3-default-rtdb.europe-west1.firebasedatabase.app"
});

const users = [
  {
    email: 'shane_dorgan@corkcity.ie',
    password: 'Admin123!@#',  // You should change this password
    role: 'admin',
    initials: 'SD'
  },
  {
    email: 'Richard_Daly@corkcity.ie',
    password: 'Operator123!@#',
    role: 'operator',
    initials: 'RD'
  },
  {
    email: 'John_ocallaghan@corkcity.ie',
    password: 'Operator123!@#',
    role: 'operator',
    initials: 'JO'
  },
  {
    email: 'viewer@corkcity.ie',
    password: 'Viewer123!@#',  // You should change this password
    role: 'viewer',
    initials: 'VW'
  }
];

async function deleteUserIfExists(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);
    console.log(`Deleted existing user: ${email}`);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      console.error(`Error deleting user ${email}:`, error);
    }
  }
}

async function setupUsers() {
  try {
    for (const user of users) {
      try {
        // First, delete the user if they exist
        await deleteUserIfExists(user.email);

        // Create new user in Authentication
        const userRecord = await admin.auth().createUser({
          email: user.email,
          password: user.password,
          emailVerified: true
        });

        console.log('Created user:', userRecord.uid);

        // Set user role and initials in Realtime Database
        await admin.database().ref(`users/${userRecord.uid}`).set({
          email: user.email,
          role: user.role,
          initials: user.initials,
          created: admin.database.ServerValue.TIMESTAMP
        });

        console.log(`Set role '${user.role}' and initials '${user.initials}' for user:`, user.email);
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    console.log('\nSetup completed. Verifying users...');
    
    // Verify the setup
    const listUsersResult = await admin.auth().listUsers();
    console.log('\nUsers in Authentication:');
    listUsersResult.users.forEach(userRecord => {
      console.log(`- ${userRecord.email} (UID: ${userRecord.uid})`);
    });

    const usersSnapshot = await admin.database().ref('users').once('value');
    const dbUsers = usersSnapshot.val();
    console.log('\nUsers in Database:');
    for (const [uid, userData] of Object.entries(dbUsers)) {
      console.log(`- ${userData.email} (Role: ${userData.role}, Initials: ${userData.initials})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupUsers(); 