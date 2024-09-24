// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPxLVxfMDmwvhQxPKuOtvFL3OMy60Y0b4",
  authDomain: "resumecollector-1.firebaseapp.com",
  projectId: "resumecollector-1",
  storageBucket: "resumecollector-1.appspot.com",
  messagingSenderId: "52146220127",
  appId: "1:52146220127:web:bcb3964c07e00f39f5ffea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app); // Initialize Firestore

export { auth, storage, db }; // Export Firestore
