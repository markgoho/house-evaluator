import { initializeApp, type FirebaseApp } from "firebase/app";
import { firebaseConfig } from "./config";
import { browser } from "$app/environment";

let app: FirebaseApp | null = null;

export function initializeFirebase(): FirebaseApp {
  // Only initialize in browser context
  if (!browser) {
    throw new Error("Firebase can only be initialized in the browser");
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  return app;
}

export function getFirebaseApp(): FirebaseApp | null {
  return app;
}
