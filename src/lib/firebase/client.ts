import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Public Firebase Web App config for the client's "industrial-aqua"
// project. A Firebase web apiKey is a public project identifier, not a
// secret — access is controlled by Firestore security rules (products are
// publicly readable; writes require a signed-in admin). Environment
// variables, when set, override these defaults. Never add service-account
// credentials here.
const defaultConfig = {
  apiKey: 'AIzaSyCyJ-TqWC35xaQ3ZlLz9NMYF3HdKjGenQw',
  authDomain: 'industrial-aqua.firebaseapp.com',
  projectId: 'industrial-aqua',
  storageBucket: 'industrial-aqua.firebasestorage.app',
  messagingSenderId: '949790989197',
  appId: '1:949790989197:web:444758c63769c9634dfbc4',
};

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
export const firebaseConfigMissingKeys = requiredKeys.filter((key) => !config[key]);
export const firebaseConfigured =
  import.meta.env.VITE_FIREBASE_ENABLED !== 'false' && firebaseConfigMissingKeys.length === 0;

let app: FirebaseApp | null = null;
if (firebaseConfigured) app = getApps().length ? getApp() : initializeApp(config);
export const firebaseApp = app;
export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;
