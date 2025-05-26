
import admin from 'firebase-admin';
// Make sure you have serviceAccountKey.json in the /scripts folder
// AND that 'scripts/serviceAccountKey.json' is in your .gitignore
import serviceAccount from './serviceAccountKey.json' assert { type: "json" };

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const emailToMakeAdmin = 'lgubevu@gmail.com'; // The email of the user to make admin

async function setAdminClaim() {
  try {
    console.log(`Attempting to set admin claim for: ${emailToMakeAdmin}`);
    const user = await admin.auth().getUserByEmail(emailToMakeAdmin);
    if (user) {
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`✅ Successfully set admin custom claim for ${emailToMakeAdmin} (UID: ${user.uid})`);
      console.log("IMPORTANT: The user must log out and log back in for the new claim to take effect in the app.");
    } else {
      console.error(`❌ User with email ${emailToMakeAdmin} not found in Firebase Authentication.`);
    }
  } catch (error) {
    console.error('❌ Error setting admin custom claim:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.error(`Hint: Ensure the user ${emailToMakeAdmin} has already signed up to the application.`);
    }
  }
}

setAdminClaim();
