import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


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

// Initialize Auth
export const auth = getAuth(app);

export default app;

