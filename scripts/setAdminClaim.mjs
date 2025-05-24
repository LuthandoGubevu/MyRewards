
import admin from 'firebase-admin';
// Make sure you have your service account key JSON file
// and have set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// For example: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"

// Initialize Firebase Admin SDK
// If you haven't initialized it elsewhere with a service account
try {
  admin.initializeApp({
    // If you've already initialized elsewhere with credential, this might not be needed
    // or you might initialize with a specific credential if not using GOOGLE_APPLICATION_CREDENTIALS
    // credential: admin.credential.applicationDefault(), // Uses GOOGLE_APPLICATION_CREDENTIALS
  });
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase Admin SDK initialization error:', error);
    process.exit(1);
  }
  // App already initialized, which is fine.
}


const adminEmail = 'lgubevu@gmail.com'; // The email of the user to make admin

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    if (user) {
      const currentClaims = user.customClaims || {};
      if (currentClaims.admin === true) {
        console.log(`User ${email} (UID: ${user.uid}) is already an admin.`);
        return;
      }

      await admin.auth().setCustomUserClaims(user.uid, { ...currentClaims, admin: true });
      console.log(`Successfully set admin claim for ${email} (UID: ${user.uid})`);
      console.log('Important: The user may need to re-login or their ID token refreshed on the client-side to see the changes immediately.');
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (error) {
    console.error('Error setting admin claim:', error);
    if (error.code === 'auth/user-not-found') {
        console.error(`Could not find user with email: ${email}. Please ensure the user has signed up first.`);
    }
    process.exit(1);
  }
}

setAdminClaim(adminEmail)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
