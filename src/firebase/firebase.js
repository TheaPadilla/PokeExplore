import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { setLogLevel } from 'firebase/firestore';

// Optional: Enable debug logging
setLogLevel('debug');

const firebaseConfig = {
  apiKey: "AIzaSyDLVumzeqFwzoMC32gQTakmCXNifDmP6hA",
  authDomain: "pokeexplore-1e32b.firebaseapp.com",
  projectId: "pokeexplore-1e32b",
  storageBucket: "pokeexplore-1e32b.appspot.com",
  messagingSenderId: "404765038398",
  appId: "1:404765038398:web:877ee2cb796dc524fdfe6f",
  measurementId: "G-PVC8D02CN6"
};

// 1. Initialize App (Hot Reload safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth (Hot Reload safe)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // If app is already initialized, use getAuth
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

// 3. Initialize Firestore Database
const db = getFirestore(app);

// 4. Export both auth AND db
export { auth, db };