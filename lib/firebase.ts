"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getAuth, signInAnonymously, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let persistenceEnabled = false;

export function getFirebase() {
  if (typeof window === "undefined") {
    throw new Error("Firebase ne peut être utilisé que côté client.");
  }

  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Active la persistence offline une seule fois
    if (!persistenceEnabled) {
      persistenceEnabled = true;
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn(
            "[Firestore] Persistence offline désactivée (plusieurs onglets ouverts)."
          );
        } else if (err.code === "unimplemented") {
          console.warn(
            "[Firestore] Le navigateur ne supporte pas la persistence offline."
          );
        }
      });
    }
  }

  return { app, db, auth };
}

/**
 * S'assure que l'utilisateur est authentifié (anonyme).
 * Retourne l'UID utilisateur.
 */
export async function ensureAuth(): Promise<string> {
  const { auth } = getFirebase();

  if (auth.currentUser) {
    return auth.currentUser.uid;
  }

  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}