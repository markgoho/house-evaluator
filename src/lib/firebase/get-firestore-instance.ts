import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeFirebase } from "./initialize-firebase";

let firestoreInstance: Firestore | null = null;

export function getFirestoreInstance(): Firestore {
  if (!firestoreInstance) {
    const app = initializeFirebase();
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}
