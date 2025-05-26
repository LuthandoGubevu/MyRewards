
// Import Firebase Admin SDK
import admin from 'firebase-admin';
// Import the service account key JSON file
// Ensure this file is in your .gitignore for security!
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// Initialize the Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.message);
  if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('serviceAccountKey.json')) {
    console.error("Ensure 'serviceAccountKey.json' is in the 'scripts' directory and correctly named.");
  }
  process.exit(1); // Exit if initialization fails
}


// The email of the user to make an admin
const adminEmail = "lgubevu@gmail.com";

async function setAdminClaim() {
  try {
    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(adminEmail);
    const uid = userRecord.uid;

    // Set the custom claim { admin: true }
    await admin.auth().setCustomUserClaims(uid, { admin: true });

    console.log(`✅ Admin claim set for ${adminEmail} (UID: ${uid})`);
    console.log("👉 Important: The user must log out and log back into the application for the claim to take effect.");

  } catch (error) {
    console.error(`❌ Error setting admin claim for ${adminEmail}:`, error.message);
    if (error.code === 'auth/user-not-found') {
      console.error(`Ensure the user ${adminEmail} has signed up and exists in Firebase Authentication.`);
    }
  }
}

// Run the function
setAdminClaim().catch(error => {
  // Catch any unhandled promise rejections from setAdminClaim itself
  console.error("❌ An unexpected error occurred:", error);
});
