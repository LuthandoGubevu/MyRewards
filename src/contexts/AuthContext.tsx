
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
      setLoading(true); // Indicate loading has started
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
              // map other fields from userData as needed
            });
          } else {
            // Should not happen if user is created correctly in signUp
            console.warn("User document not found in Firestore for UID:", firebaseUser.uid);
            setAppUser({ uid: firebaseUser.uid, email: firebaseUser.email }); 
          }
        } catch (error: any) {
          console.error("Error fetching user data from Firestore:", error);
          toast({
            variant: 'destructive',
            title: 'Data Load Error',
            description: `Could not load your profile. Please check your internet connection. (${error.message})`
          });
          // Optionally, sign out the user if profile data is critical and app can't function without it
          // await signOut(auth); 
          // setAppUser(null); // This would effectively log them out if data fetch fails
        }
      } else {
        // User is signed out
        setAppUser(null);
      }
      setLoading(false); // Indicate loading is complete
    });
    return () => unsubscribe();
  }, [toast]); // Added toast to dependency array

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
        const userDocSnap = await getDoc(userDocRef); // This call can also fail if offline

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
           console.warn("User document not found in Firestore for UID:", firebaseUser.uid);
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
          // Firebase Storage/Firestore specific error codes for network issues might be 'unavailable'
          case 'unavailable': // Common code for network errors from Firestore/Storage
            description = 'Could not connect to our services. Please check your internet connection and try again.';
            break;
          default:
            // For "Failed to get document because the client is offline." or similar, error.message might be more direct
            if (error.message && error.message.toLowerCase().includes('offline')) {
                 description = 'Could not connect to our services. Please check your internet connection and try again.';
            } else {
                description = error.message; 
            }
        }
      } else if (error.message && error.message.toLowerCase().includes('offline')) {
        // Catch general "offline" messages if no specific code
        description = 'Could not connect to our services. Please check your internet connection and try again.';
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

    
