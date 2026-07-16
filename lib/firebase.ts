// PULSE — Firebase SDK Initialization & Config
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Firebase web app configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfZQst5ViZ1BTaUfUC2Z9BUK06VwkxhKQ",
  authDomain: "pulse-d73dc.firebaseapp.com",
  projectId: "pulse-d73dc",
  storageBucket: "pulse-d73dc.firebasestorage.app",
  messagingSenderId: "388066931279",
  appId: "1:388066931279:web:d00d9e831cfb609711f03a",
  measurementId: "G-ENT2L4JSG7",
};

// Initialize Firebase safely for Next.js SSR / Turbopack
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, auth, analytics };
