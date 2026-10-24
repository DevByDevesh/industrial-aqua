import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase/client';

// The store owner's account. Product writes in Firestore are restricted
// to this email in the security rules as well; the check here only drives
// what the admin UI offers.
export const STORE_ADMIN_EMAIL = 'yadavrajan7572@gmail.com';

interface AuthApi {
  user: User | null;
  ready: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      setReady(true);
      return;
    }
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setReady(true);
    });
  }, []);

  const api: AuthApi = {
    user,
    ready,
    isAdmin: user?.email === STORE_ADMIN_EMAIL,
    async signIn(email, password) {
      if (!auth) throw new Error('Accounts are unavailable right now.');
      await signInWithEmailAndPassword(auth, email, password);
    },
    async register(email, password) {
      if (!auth) throw new Error('Accounts are unavailable right now.');
      await createUserWithEmailAndPassword(auth, email, password);
    },
    async resetPassword(email) {
      if (!auth) throw new Error('Accounts are unavailable right now.');
      await sendPasswordResetEmail(auth, email);
    },
    async logOut() {
      if (auth) await signOut(auth);
    },
  };

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
