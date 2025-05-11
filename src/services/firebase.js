import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  verifyPasswordResetCode, 
  confirmPasswordReset 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDfvYWXApAHzqmPWGFhIPo93JEraiYnH4",
  authDomain: "fashionsquareweb-b5854.firebaseapp.com",
  projectId: "fashionsquareweb-b5854",
  storageBucket: "fashionsquareweb-b5854.firebasestorage.app",
  messagingSenderId: "16197278447",
  appId: "1:16197278447:web:46f0d223cc217e530a591a",
  measurementId: "G-18MBH713M7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signupWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const resetPassword = (email, actionCodeSettings) => sendPasswordResetEmail(auth, email, actionCodeSettings);
export const verifyResetCode = (oobCode) => verifyPasswordResetCode(auth, oobCode);
export const confirmResetPassword = (oobCode, newPassword) => confirmPasswordReset(auth, oobCode, newPassword);