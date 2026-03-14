// ── Firebase Configuration ────────────────────────────────────────────────────
// 1. Go to https://console.firebase.google.com
// 2. Create a new project → name it "cryptoguide"
// 3. Click "Web" app icon (</>)  → register app → copy the config below
// 4. Go to Authentication → Get Started → Enable "Email/Password"
// 5. Paste your values here and save

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA3twEuS-JkvzKMPMhbgTkzj9OtMWwkgwU",
  authDomain: "cryptoguide-1bcfd.firebaseapp.com",
  projectId: "cryptoguide-1bcfd",
  storageBucket: "cryptoguide-1bcfd.firebasestorage.app",
  messagingSenderId: "981425119634",
  appId: "1:981425119634:web:4a2af6a07e34244ea3614b",
  measurementId: "G-3FM1VY87TY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;