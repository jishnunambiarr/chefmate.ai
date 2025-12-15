import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCuwDGSNFPYEOsem7Vd-4lHjVgBNDwTcr8",
    authDomain: "chefmate-ai-fac55.firebaseapp.com",
    projectId: "chefmate-ai-fac55",
    storageBucket: "chefmate-ai-fac55.firebasestorage.app",
    messagingSenderId: "803568333002",
    appId: "1:803568333002:web:d3ac8a8ed068e68d7ec433",
    measurementId: "G-4LQXJTYXN7"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
// getReactNativePersistence exists at runtime but not in type definitions, so we use require()
const { getReactNativePersistence } = require('firebase/auth');
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
