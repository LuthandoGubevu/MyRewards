
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface AppUser {
  uid: string;
  email: string | null;
  name?: string;
  phoneNumber?: string;
  isAdmin?: boolean; 
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phoneNumber?: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      console.log('AuthContext (onAuthStateChanged): Firebase user state changed:', firebaseUser?.uid);
      if (firebaseUser) {
        try {
          // Force refresh to get the latest claims
          const tokenResult = await firebaseUser.getIdTokenResult(true); 
          const isAdminFromClaims = !!tokenResult.claims.admin;
          console.log('AuthContext (onAuthStateChanged): User claims:', tokenResult.claims, 'isAdmin (from claims):', isAdminFromClaims);

          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let appUserData: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            isAdmin: isAdminFromClaims, // isAdmin is determined by custom claims
          };

          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data();
            appUserData.name = firestoreData.name;
            appUserData.phoneNumber = firestoreData.phoneNumber;
            // Note: firestoreData.role or firestoreData.user is NOT used here to set appUserData.isAdmin
            console.log("AuthContext (onAuthStateChanged): User document found, data:", firestoreData);
          } else {
            console.warn("AuthContext (onAuthStateChanged): User document not found in Firestore for UID:", firebaseUser.uid);
            // If user doc not found, still set basic info and claims-derived admin status
          }
          setAppUser(appUserData);
          console.log("AuthContext (onAuthStateChanged): AppUser set", appUserData);

        } catch (error: any) {
          let toastTitle = 'Profile Load Error';
          let toastDescription = `We couldn't load your full profile details. Error: ${error.message}`;
          let consoleMessage = `AuthContext (onAuthStateChanged): Error processing user data or claims for UID ${firebaseUser.uid}: ${error.message}`;

          if (error.code === 'permission-denied') {
             console.warn(`${consoleMessage}. Check Firestore security rules. Custom claims, not Firestore roles, determine admin access.`);
            toastTitle = 'Permission Issue';
            toastDescription = `Could not load profile due to a permission error. Ensure Firestore rules are correctly set up.`;
          } else if (error.code === 'unavailable' || (error.message && error.message.toLowerCase().includes('client is offline'))) {
            console.warn(`AuthContext (onAuthStateChanged): Firestore offline for UID ${firebaseUser.uid}. App is proceeding with basic auth data and claims. Message: ${error.message}`);
            toastTitle = 'Offline Mode';
            toastDescription = `Your full profile details couldn't be loaded as the app seems to be offline. Basic info and authentication status will be used.`;
          } else {
            console.error(consoleMessage, error);
          }
          toast({
            variant: error.code === 'permission-denied' || error.code === 'unavailable' ? 'default' : 'destructive',
            title: toastTitle,
            description: toastDescription,
            duration: 7000
          });
          
          let basicIsAdmin = false;
          try {
             if (firebaseUser) { 
                const fallbackTokenResult = await firebaseUser.getIdTokenResult(true); 
                console.log('AuthContext (onAuthStateChanged - error fallback): User claims:', fallbackTokenResult.claims); 
                basicIsAdmin = !!fallbackTokenResult.claims.admin;
             }
          } catch (claimError) {
            console.warn("AuthContext (onAuthStateChanged - error fallback): Could not fetch claims for fallback user data", claimError);
          }
          const fallbackUserData: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: undefined, 
            phoneNumber: undefined, 
            isAdmin: basicIsAdmin // isAdmin determined by custom claims
          };
          setAppUser(fallbackUserData);
          console.log("AuthContext (onAuthStateChanged - error fallback): AppUser set with basic data", fallbackUserData);
        }
      } else {
        setAppUser(null);
        console.log("AuthContext (onAuthStateChanged): No Firebase user, AppUser set to null");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, name: string, phoneNumber?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        const userDataToSave: {
          uid: string;
          email: string | null;
          name: string;
          phoneNumber?: string;
          createdAt: any;
          lastLogin: any;
          points?: number;
          visitsCount?: number;
          role?: string; // This role field is for informational purposes in Firestore.
                         // Actual admin access in the app is controlled by Firebase Auth Custom Claims.
        } = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          points: 0,
          visitsCount: 0,
          role: 'user', // Default role; admins get custom claims set via a separate script.
        };
        if (phoneNumber && phoneNumber.trim() !== '') {
          userDataToSave.phoneNumber = phoneNumber;
        }
        // If signing up the special admin email, you might set a 'pending-admin' role here,
        // but the custom claim script is still the source of truth for app admin status.
        if (email === 'admin@mykfcloyalty.com') {
          userDataToSave.role = 'admin-pending-claim'; // Example: for easier identification in Firestore
        }


        await setDoc(doc(db, "users", firebaseUser.uid), userDataToSave);
        
        // Custom claims are set by an admin script, not at signup by the client.
        // Here, we just initialize a basic AppUser. Admin status will be picked up by onAuthStateChanged 
        // after claims are set and token refreshes.
        const initialAppUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          phoneNumber: phoneNumber && phoneNumber.trim() !== '' ? phoneNumber : undefined,
          isAdmin: false, // Default to false; claims will update this later via onAuthStateChanged
        };
        setAppUser(initialAppUser);

        // All users go to /dashboard after signup. Redirection to /admin happens after
        // claims are confirmed via onAuthStateChanged or subsequent login.
        router.push('/dashboard');
        toast({ title: 'Signup Successful!', description: 'Welcome to KFC Rewards!' });
      }
    } catch (error: any) {
      const baseErrorMessage = `Signup attempt for email "${email}" failed with Firebase error code: ${error.code}, message: ${error.message}.`;
      let description = error.message || "An unknown error occurred during signup.";
      let toastTitle = "Signup Failed";

      if (error.code === 'auth/email-already-in-use') {
        console.warn(`${baseErrorMessage} - Email already in use.`);
        description = 'This email address is already in use. Please try a different email or log in.';
      } else if (error.code === 'auth/network-request-failed') {
         console.warn(`${baseErrorMessage} Network request failed.`);
        toastTitle = 'Network Error';
        description = 'Signup failed due to a network issue. Please check your internet connection and try again.';
      } else if (error.code === 'auth/configuration-not-found') {
        console.error(`${baseErrorMessage} Firebase configuration error.`);
        toastTitle = 'Configuration Error';
        description = 'Signup failed due to a Firebase configuration issue. Please ensure Firebase is correctly initialized.';
      } else {
        console.error(`Unhandled Firebase Auth Error during signup for email "${email}":`, error);
      }
      toast({ variant: 'destructive', title: toastTitle, description });
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, password: string) => {
    setLoading(true);
    let authenticatedFirebaseUser: FirebaseUser | null = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      authenticatedFirebaseUser = userCredential.user;

      if (authenticatedFirebaseUser) {
        toast({ title: 'Login Successful!', description: 'Fetching your profile & permissions...' });

        // Force refresh token to get latest claims
        const tokenResult = await authenticatedFirebaseUser.getIdTokenResult(true); 
        const isAdminFromClaims = !!tokenResult.claims.admin;
        console.log('AuthContext (logIn): User claims:', tokenResult.claims, 'isAdmin (from claims):', isAdminFromClaims);

        let appUserData: AppUser = {
          uid: authenticatedFirebaseUser.uid,
          email: authenticatedFirebaseUser.email,
          isAdmin: isAdminFromClaims, // isAdmin is determined by custom claims
        };

        try {
          const userDocRef = doc(db, "users", authenticatedFirebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data();
            appUserData.name = firestoreData.name;
            appUserData.phoneNumber = firestoreData.phoneNumber;
            await updateDoc(doc(db, "users", authenticatedFirebaseUser.uid), { lastLogin: serverTimestamp() });
            toast({ title: 'Profile Loaded!', description: 'Welcome back!' });
          } else {
            console.warn("AuthContext (logIn): User document not found in Firestore for UID:", authenticatedFirebaseUser.uid);
            toast({ variant: 'default', title: 'Welcome!', description: 'User profile details not fully loaded. Using basic info.' });
          }
        } catch (firestoreError: any) {
          let toastTitle = 'Profile Load Error';
          let toastDescription = `We couldn't load your full profile details. Error: ${firestoreError.message}`;
          let consoleMessage = `AuthContext (logIn): Error fetching user document for UID ${authenticatedFirebaseUser.uid}: ${firestoreError.message}`;

          if (firestoreError.code === 'permission-denied') {
             console.warn(`${consoleMessage}. Check Firestore security rules. Custom claims, not Firestore roles, determine admin access.`);
            toastTitle = 'Permission Issue';
            toastDescription = `Could not load profile due to a permission error. Ensure Firestore rules are correctly set up.`;
          } else if (firestoreError.code === 'unavailable' || (firestoreError.message && firestoreError.message.toLowerCase().includes('client is offline'))) {
            console.warn(`AuthContext (logIn): Firestore offline for UID ${authenticatedFirebaseUser.uid}. App is proceeding with basic auth data and claims. Message: ${firestoreError.message}`);
            toastTitle = 'Logged In (Offline Profile)';
            toastDescription = `Successfully logged in, but could not load your full profile due to a connection issue. Basic info and authentication status will be used.`;
          } else {
            console.error(consoleMessage, firestoreError);
          }
          toast({
            variant: firestoreError.code === 'permission-denied' || firestoreError.code === 'unavailable' ? 'default' : 'destructive',
            title: toastTitle,
            description: toastDescription,
            duration: 7000,
          });
        }

        setAppUser(appUserData);
        console.log("AuthContext (logIn): AppUser set", appUserData);

        if (appUserData.isAdmin) {
          console.log('AuthContext (logIn): Admin user detected, redirecting to /admin');
          router.push('/admin');
        } else {
          console.log('AuthContext (logIn): Regular user detected, redirecting to /dashboard');
          router.push('/dashboard');
        }
      }
    } catch (authError: any) {
      let description = "An unexpected error occurred during login. Please try again.";
      let toastTitle = "Login Failed";
      const baseErrorMessage = `Login attempt for email "${email}" failed with Firebase error code: ${authError.code}, message: ${authError.message}.`;

      if (authError.code) {
        switch (authError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            console.warn(`${baseErrorMessage} - This indicates incorrect email or password.`);
            description = 'The email or password you entered is incorrect. Please check your credentials and try again.';
            break;
          case 'auth/invalid-email':
            console.warn(`${baseErrorMessage} - This indicates the email format is invalid.`);
            description = 'The email address format is not valid. Please enter a valid email.';
            break;
          case 'auth/user-disabled':
            console.warn(`${baseErrorMessage} - This user account is disabled.`);
            description = 'This user account has been disabled. Please contact support.';
            break;
          case 'auth/network-request-failed':
            console.warn(`${baseErrorMessage} Network request failed during authentication.`);
            toastTitle = 'Network Error';
            description = 'Could not connect to authentication services. Please check your internet connection and try again.';
            break;
          case 'auth/configuration-not-found':
            console.error(`${baseErrorMessage} Firebase configuration not found.`);
            toastTitle = 'Configuration Error';
description = 'Login failed due to a Firebase configuration issue. Please ensure Firebase is correctly initialized.';
            break;
          default:
            console.error(`Unhandled Firebase Auth Error during login for email "${email}":`, authError);
            description = authError.message || 'An unknown error occurred. Please try again.';
        }
      } else {
        console.error(`Error logging in for email "${email}" (Authentication):`, authError);
      }
      toast({ variant: 'destructive', title: toastTitle, description });
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setAppUser(null);
      console.log("AuthContext: User logged out. Redirecting to landing page...");
      router.push('/'); // Redirect to landing page
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error: any) {
      console.error("AuthContext: Error logging out:", error);
      toast({ variant: 'destructive', title: 'Logout Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user: appUser, loading, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
