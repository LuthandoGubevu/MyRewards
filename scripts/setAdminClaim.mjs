
// Use ES module syntax for imports
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// IMPORTANT: Place your serviceAccountKey.json file in this 'scripts' directory.
// Make sure this file is in your .gitignore to avoid committing it to your repository.
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const ADMIN_EMAIL_TO_SET = "lgubevu@gmail.com"; // The email to grant admin privileges

async function setAdminClaim() {
  try {
    const user = await getAuth().getUserByEmail(ADMIN_EMAIL_TO_SET);
    if (user) {
      const currentClaims = user.customClaims || {};
      if (currentClaims.admin === true) {
        console.log(`User ${ADMIN_EMAIL_TO_SET} already has admin claims.`);
        return;
      }

      await getAuth().setCustomUserClaims(user.uid, { ...currentClaims, admin: true });
      console.log(`✅ Successfully set admin claim for ${ADMIN_EMAIL_TO_SET} (UID: ${user.uid})`);
      console.log("IMPORTANT: The user must log out and log back in for the new claims to take effect in the app.");
    } else {
      console.error(`❌ User with email ${ADMIN_EMAIL_TO_SET} not found.`);
    }
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: User with email ${ADMIN_EMAIL_TO_SET} was not found in Firebase Authentication.`);
      console.log("Please ensure the user has signed up for an account first.");
    } else {
      console.error("❌ Error setting admin claim:", error.message);
      console.error("Full error object:", error);
    }
    process.exit(1); // Exit with error code
  }
}

setAdminClaim()
  .then(() => {
    console.log("Admin claim script finished.");
    process.exit(0); // Exit successfully
  })
  .catch(() => {
    // Error is already logged in setAdminClaim, just ensure process exits with error
    process.exit(1);
  });
