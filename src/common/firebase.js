// firebase.js
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, TwitterAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCncy_Vc_hN3NKdwvJ7161MZ6onDF5vaiE",
    authDomain: "monetiza-verify.firebaseapp.com",
    projectId: "monetiza-verify",
    storageBucket: "monetiza-verify.firebasestorage.app",
    messagingSenderId: "361464743666",
    appId: "1:361464743666:web:5e5618b12a74c9ecc8b26b",
    measurementId: "G-ZNYXL6Y852"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider()

export { auth, provider, twitterProvider, RecaptchaVerifier, signInWithPhoneNumber };
