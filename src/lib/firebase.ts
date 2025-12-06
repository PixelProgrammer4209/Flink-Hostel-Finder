import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2FhIcYI_X9QxmSOKYnsbfdvw3JfUfcwU",
  authDomain: "hostel-finder-app-8f7a8.firebaseapp.com",
  projectId: "hostel-finder-app-8f7a8",
  storageBucket: "hostel-finder-app-8f7a8.firebasestorage.app",
  messagingSenderId: "670809905618",
  appId: "1:670809905618:web:9d99c35688a9cab5a0500b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the database and auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);