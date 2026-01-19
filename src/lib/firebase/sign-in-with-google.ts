import {
  signInWithPopup,
  GoogleAuthProvider,
  type UserCredential,
} from "firebase/auth";
import { getAuthInstance } from "./get-auth-instance";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<UserCredential> {
  const auth = getAuthInstance();
  return signInWithPopup(auth, googleProvider);
}
