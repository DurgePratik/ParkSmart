import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
    GoogleAuthProvider,
    signInWithCredential,
    signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "867288690061-ovoaervmd29bfret437d6cegsc3onqvs.apps.googleusercontent.com",
  offlineAccess: true,
});

export async function signInWithGoogle() {
  try {
    // Check Google Play Services
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // Google Sign-In
    const response = await GoogleSignin.signIn();

    const idToken = response.data?.idToken;

    if (!idToken) {
      throw new Error("No Google ID Token received.");
    }

    // Firebase Credential
    const credential = GoogleAuthProvider.credential(idToken);

    // Firebase Login
    const userCredential = await signInWithCredential(auth, credential);

    const user = userCredential.user;

    // Save user to Firestore (only first login)
    const userRef = doc(db, "users", user.uid);

    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      });
    }

    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

export async function logout() {
  try {
    await GoogleSignin.signOut();
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
}
