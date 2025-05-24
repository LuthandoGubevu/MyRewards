
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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface AppUser {
  uid: string;
  email: string | null;
  name?: string;
  phoneNumber?: string;
  // Add any other user-specific fields you might store in Firestore
}

interface AuthContextType {
  user: AppUser | null; // Changed from FirebaseUser to AppUser
  loading: boolean; // General loading for auth operations
  signUp: (email: string, password: string, name: string, phoneNumber?: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // For initial auth state check and operations
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); 
      if (firebaseUser) {
        try {
          // User is signed in, fetch additional details from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAppUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name,
              phoneNumber: userData.phoneNumber,
            });
          } else {
            console.warn("User document not found in Firestore for UID (onAuthStateChanged):", firebaseUser.uid);
            setAppUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: 'User' }); // Set with fallback name
          }
        } catch (error: any) {
          console.error("Error fetching user data from Firestore (onAuthStateChanged):", error);
          toast({
            variant: 'destructive',
            title: 'Data Load Error',
            description: `Could not load your profile details. Please check your internet connection. (${error.message})`,
            duration: 7000
          });
          // Still set basic user info so the app knows user is authenticated at least
          setAppUser({ uid: firebaseUser.uid, email: firebaseUser.email });
        }
      } else {
        // User is signed out
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
        } = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        if (phoneNumber) {
          userDataToSave.phoneNumber = phoneNumber;
        }
        await setDoc(doc(db, "users", firebaseUser.uid), userDataToSave);
        
        setAppUser({ 
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name,
          phoneNumber: phoneNumber,
        });
        router.push('/');
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
      } else {
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
      // Step 1: Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      authenticatedFirebaseUser = userCredential.user;

      if (authenticatedFirebaseUser) {
        // Auth successful, now try to fetch Firestore data.
        // The onAuthStateChanged listener will also attempt this, but doing it here
        // allows for more immediate feedback and state update in the login flow.
        toast({ title: 'Login Successful!', description: 'Fetching your profile...' });

        try {
          const userDocRef = doc(db, "users", authenticatedFirebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setAppUser({ // This will trigger UI update
              uid: authenticatedFirebaseUser.uid,
              email: authenticatedFirebaseUser.email,
              name: userData.name,
              phoneNumber: userData.phoneNumber,
            });
            await setDoc(doc(db, "users", authenticatedFirebaseUser.uid), { lastLogin: serverTimestamp() }, { merge: true });
            toast({ title: 'Profile Loaded!', description: 'Welcome back!' });
          } else {
            console.warn("User document not found in Firestore for UID (login):", authenticatedFirebaseUser.uid);
            setAppUser({ uid: authenticatedFirebaseUser.uid, email: authenticatedFirebaseUser.email, name: 'User' });
            toast({ variant: 'default', title: 'Welcome!', description: 'User profile not found, using basic info.' });
          }
        } catch (firestoreError: any) {
          // Firestore fetch failed (e.g., offline)
          console.error("Error fetching user document during login:", firestoreError);
          // Set basic user info as auth succeeded
          setAppUser({ uid: authenticatedFirebaseUser.uid, email: authenticatedFirebaseUser.email }); 
          toast({
            variant: 'default', // Not 'destructive' because auth itself succeeded
            title: 'Logged In',
            description: 'Successfully logged in, but could not load your full profile. Please check your internet connection.',
            duration: 7000,
          });
        }
        router.push('/'); // Redirect after auth success, regardless of Firestore profile fetch outcome
      }
    } catch (authError: any) { // Errors from signInWithEmailAndPassword itself
      console.error("Error logging in (Authentication):", authError);
      let description = "An unexpected error occurred during login. Please try again.";
      if (authError.code) {
        switch (authError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'auth/invalid-email':
            description = 'The email address is not valid. Please enter a valid email.';
            break;
          case 'auth/user-disabled':
            description = 'This user account has been disabled.';
            break;
          case 'auth/network-request-failed':
            description = 'Could not connect to authentication services. Please check your internet connection.';
            break;
          default:
            description = authError.message || 'Failed to log in.';
        }
      }
      toast({ variant: 'destructive', title: 'Login Failed', description });
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
