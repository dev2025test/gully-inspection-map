require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account from file
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
  console.error('Error loading serviceAccountKey.json:', error);
  console.error('Please ensure serviceAccountKey.json exists');
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

// Load users from JSON file
let users;
try {
  users = require('./users.json').users;
} catch (error) {
  console.error('Error loading users.json:', error);
  process.exit(1);
}

// Validate user data
function validateUser(user) {
  if (!user.email || !user.password || !user.role || !user.initials) {
    throw new Error(`Invalid user data: ${JSON.stringify(user)}`);
  }
  if (!['admin', 'operator', 'viewer'].includes(user.role)) {
    throw new Error(`Invalid role '${user.role}' for user ${user.email}`);
  }
  if (user.password.length < 8) {
    throw new Error(`Password too short for user ${user.email}`);
  }
}

async function deleteUserIfExists(email) {
  try {
    email = email.toLowerCase();
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);
    console.log(`Deleted existing user: ${email}`);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }
}

async function cleanupDatabase() {
  try {
    await admin.database().ref('users').remove();
    console.log('Cleaned up existing database entries');
  } catch (error) {
    console.error('Error cleaning up database:', error);
    throw error;
  }
}

async function setupUsers() {
  const results = {
    success: [],
    failures: []
  };

  try {
    console.log('Starting user setup...');
    await cleanupDatabase();

    for (const user of users) {
      try {
        validateUser(user);
        const email = user.email.toLowerCase();
        
        await deleteUserIfExists(email);

        const userRecord = await admin.auth().createUser({
          email: email,
          password: user.password,
          emailVerified: true
        });

        await admin.database().ref(`users/${userRecord.uid}`).set({
          email: email,
          role: user.role,
          initials: user.initials,
          created: admin.database.ServerValue.TIMESTAMP,
          lastUpdated: admin.database.ServerValue.TIMESTAMP
        });

        results.success.push({
          email: email,
          uid: userRecord.uid,
          role: user.role
        });
        
        console.log(`Created user ${email} with role ${user.role}`);
      } catch (error) {
        results.failures.push({
          email: user.email,
          error: error.message
        });
        console.error(`Error processing user ${user.email}:`, error.message);
      }
    }

    // Final report
    console.log('\nSetup Summary:');
    console.log(`Successfully created: ${results.success.length} users`);
    console.log(`Failed to create: ${results.failures.length} users`);

    if (results.failures.length > 0) {
      console.log('\nFailed users:');
      results.failures.forEach(failure => {
        console.log(`- ${failure.email}: ${failure.error}`);
      });
    }

    // Write results to log file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(__dirname, `setup-results-${timestamp}.json`);
    fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
    console.log(`\nDetailed results written to: ${logFile}`);

    if (results.failures.length > 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during setup:', error);
    process.exit(1);
  }
}

setupUsers(); 