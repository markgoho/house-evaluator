import { getAuth, type Auth } from "firebase/auth";
import { initializeFirebase } from "./initialize-firebase";

let authInstance: Auth | null = null;

export function getAuthInstance(): Auth {
  if (!authInstance) {
    const app = initializeFirebase();
    authInstance = getAuth(app);
  }
  return authInstance;
}
