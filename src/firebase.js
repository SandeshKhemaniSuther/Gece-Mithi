// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// --- YE DO LINES ADD KAREIN ---
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeVo8GELUKz9R3v88pGygg7FStf_dWHD4",
  authDomain: "gece-portal.firebaseapp.com",
  projectId: "gece-portal",
  storageBucket: "gece-portal.firebasestorage.app",
  messagingSenderId: "168643740246",
  appId: "1:168643740246:web:fff3661626b58c30f971f7",
  measurementId: "G-S2T8GF2CJ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Services
export const db = getFirestore(app); // Ab ye chalega kyunki upar import kiya hai
export const auth = getAuth(app);    // Ye bhi chalega