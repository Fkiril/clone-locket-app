import { initializeApp } from "firebase/app";

import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { EmailAuthProvider, getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
const emailProvider = new EmailAuthProvider();

const rt_db = getDatabase();
const fs_db = getFirestore(firebaseApp);
const storage = getStorage();

// export default firebaseApp;
export { googleProvider, emailProvider, firebaseApp, auth, rt_db, fs_db, storage };