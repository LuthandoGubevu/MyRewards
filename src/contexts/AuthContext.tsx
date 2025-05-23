
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
      if (firebaseUser) {
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
            // map other fields from userData as needed
          });
        } else {
          // Should not happen if user is created correctly in signUp
          setAppUser({ uid: firebaseUser.uid, email: firebaseUser.email }); 
        }
      } else {
        // User is signed out
        setAppUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
        
        setAppUser({ // Set AppUser state
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
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        // Fetch user details from Firestore
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
          // Update lastLogin timestamp
          await setDoc(doc(db, "users", firebaseUser.uid), { lastLogin: serverTimestamp() }, { merge: true });
        } else {
           // Fallback if user doc doesn't exist for some reason
          setAppUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: 'User' });
        }
        router.push('/');
        toast({ title: 'Login Successful!', description: 'Welcome back!' });
      }
    } catch (error: any) {
      console.error("Error logging in:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code) {
        switch (error.code) {
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
          default:
            description = error.message; 
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
      console.log("User logged out. Redirecting to login page..."); // Added console log
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

    