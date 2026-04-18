
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDLT0MK7H0WKNE_YTvktBVofaAc-tcbew8",
  authDomain: "robo-advisor-prod.firebaseapp.com",
  projectId: "robo-advisor-prod",
  storageBucket: "robo-advisor-prod.firebasestorage.app",
  messagingSenderId: "922125111622",
  appId: "1:922125111622:web:dbf6811f8cc5f8b46f5547",
  measurementId: "G-H9CSZ20BSV"
};

console.log("🔥 Firebase Initialization Attempt:", {
  projectId: firebaseConfig.projectId,
  apiKeyLength: firebaseConfig.apiKey?.length,
  apiKeyFirstChars: firebaseConfig.apiKey?.substring(0, 5),
  authDomain: firebaseConfig.authDomain
});

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase App Initialized Successfully");
} catch (e) {
  console.error("❌ Firebase Initialization Failed:", e);
  throw e;
}

export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("🔥 ADMIN LOGIN ATTEMPT RESULT:", {
      email: result.user.email,
      uid: result.user.uid,
      emailVerified: result.user.emailVerified,
      displayName: result.user.displayName
    });
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google', error);
    throw error;
  }
};
