
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface AppUser {
  uid: string;
  email: string | null;
  name?: string;
  phoneNumber?: string;
  isAdmin?: boolean; // Added isAdmin flag
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phoneNumber?: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@mykfcloyalty.com"; // Define admin email

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const isAdmin = firebaseUser.email === ADMIN_EMAIL;

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAppUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name,
              phoneNumber: userData.phoneNumber,
              isAdmin,
            });
          } else {
            // This case might occur if user was created in Auth but not in Firestore,
            // or if Firestore data is cleared. Log it and proceed with basic info.
            console.warn("User document not found in Firestore for UID (onAuthStateChanged):", firebaseUser.uid);
            setAppUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: undefined, phoneNumber: undefined, isAdmin });
          }
        } catch (error: any) {
          const isAdminOnAuthError = firebaseUser.email === ADMIN_EMAIL;
          let toastTitle = 'Profile Load Error';
          let toastDescription = `We couldn't load your full profile details. Error: ${error.message}`;

          if (error.code === 'permission-denied') {
            console.warn(`Firestore permission denied (onAuthStateChanged) for UID ${firebaseUser.uid}: ${error.message}. Check Firestore security rules.`);
            toastTitle = 'Permission Issue';
            toastDescription = `Could not load profile due to a permission error. Please ensure Firestore rules are correctly set up.`;
          } else if (error.code === 'unavailable' || (error.message && error.message.toLowerCase().includes('client is offline'))) {
            console.warn(`Firestore offline (onAuthStateChanged): User profile for UID ${firebaseUser.uid} could not be fetched. App is proceeding with basic auth data. Message: ${error.message}`);
            toastTitle = 'Offline Mode';
            toastDescription = `Your full profile details couldn't be loaded. The app seems to be offline. Basic info will be used.`;
          } else {
            console.error("Error fetching user data from Firestore (onAuthStateChanged):", error);
          }
          
          toast({
            variant: error.code === 'permission-denied' || error.code === 'unavailable' ? 'default' : 'destructive',
            title: toastTitle,
            description: toastDescription,
            duration: 7000
          });
          setAppUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: undefined, phoneNumber: undefined, isAdmin: isAdminOnAuthError });
        }
      } else {
        setAppUser(null);
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
        } = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          points: 0,
          visitsCount: 0,
        };
        if (phoneNumber && phoneNumber.trim() !== '') {
          userDataToSave.phoneNumber = phoneNumber;
        }

        await setDoc(doc(db, "users", firebaseUser.uid), userDataToSave);

        setAppUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          phoneNumber: phoneNumber && phoneNumber.trim() !== '' ? phoneNumber : undefined,
          isAdmin: firebaseUser.email === ADMIN_EMAIL,
        });
        if (firebaseUser.email === ADMIN_EMAIL) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        toast({ title: 'Signup Successful!', description: 'Welcome to KFC Rewards!' });
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Signup Failed',
          description: 'This email address is already in use. Please try a different email or log in.'
        });
      } else if (error.code === 'auth/network-request-failed') {
        toast({
          variant: 'destructive',
          title: 'Network Error',
          description: 'Signup failed due to a network issue. Please check your internet connection and try again.',
        });
      } else if (error.code === 'auth/configuration-not-found') {
         toast({
          variant: 'destructive',
          title: 'Configuration Error',
          description: 'Signup failed due to a Firebase configuration issue. Please ensure Firebase is correctly initialized.',
        });
      }
      else {
        toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
      }
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
        toast({ title: 'Login Successful!', description: 'Fetching your profile...' });
        const isAdmin = authenticatedFirebaseUser.email === ADMIN_EMAIL;

        try {
          const userDocRef = doc(db, "users", authenticatedFirebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAppUser({
              uid: authenticatedFirebaseUser.uid,
              email: authenticatedFirebaseUser.email,
              name: userData.name,
              phoneNumber: userData.phoneNumber,
              isAdmin,
            });
            await updateDoc(doc(db, "users", authenticatedFirebaseUser.uid), { lastLogin: serverTimestamp() });
            toast({ title: 'Profile Loaded!', description: 'Welcome back!' });
          } else {
            // This case might occur if user was created in Auth but not in Firestore,
            // or if Firestore data is cleared. Log it and proceed with basic info.
            console.warn("User document not found in Firestore for UID (login):", authenticatedFirebaseUser.uid);
            // Create a basic document if it doesn't exist (optional, consider if this is desired behavior)
            // await setDoc(doc(db, "users", authenticatedFirebaseUser.uid), { 
            //   uid: authenticatedFirebaseUser.uid,
            //   email: authenticatedFirebaseUser.email,
            //   name: 'User', // Default name
            //   createdAt: serverTimestamp(),
            //   lastLogin: serverTimestamp(),
            //   points: 0,
            //   visitsCount: 0,
            // }, { merge: true });
            setAppUser({ uid: authenticatedFirebaseUser.uid, email: authenticatedFirebaseUser.email, name: undefined, phoneNumber: undefined, isAdmin });
            toast({ variant: 'default', title: 'Welcome!', description: 'User profile details not fully loaded. Using basic info.' });
          }
        } catch (firestoreError: any) {
          const isAdminOnFirestoreError = authenticatedFirebaseUser.email === ADMIN_EMAIL;
          let toastTitle = 'Profile Load Error';
          let toastDescription = `We couldn't load your full profile details. Error: ${firestoreError.message}`;

          if (firestoreError.code === 'permission-denied') {
            console.warn(`Firestore permission denied (login) for UID ${authenticatedFirebaseUser.uid}: ${firestoreError.message}. Check Firestore security rules.`);
            toastTitle = 'Permission Issue';
            toastDescription = `Could not load profile due to a permission error. Please ensure Firestore rules are correctly set up.`;
          } else if (firestoreError.code === 'unavailable' || (firestoreError.message && firestoreError.message.toLowerCase().includes('client is offline'))) {
            console.warn(`Firestore offline (login): User profile for UID ${authenticatedFirebaseUser.uid} could not be fetched. App is proceeding with basic auth data. Message: ${firestoreError.message}`);
            toastTitle = 'Logged In (Offline Profile)';
            toastDescription = `Successfully logged in, but could not load your full profile due to a connection issue. Basic info will be used.`;
          } else {
            console.error("Error fetching user document during login:", firestoreError);
          }
          setAppUser({ uid: authenticatedFirebaseUser.uid, email: authenticatedFirebaseUser.email, name: undefined, phoneNumber: undefined, isAdmin: isAdminOnFirestoreError });
          toast({
            variant: firestoreError.code === 'permission-denied' || firestoreError.code === 'unavailable' ? 'default' : 'destructive',
            title: toastTitle,
            description: toastDescription,
            duration: 7000,
          });
        }
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
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
            console.error(`${baseErrorMessage} Network request failed during authentication.`);
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
      console.log("User logged out. Redirecting to login page...");
      router.push('/login');
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error: any) {
      console.error("Error logging out:", error);
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

    