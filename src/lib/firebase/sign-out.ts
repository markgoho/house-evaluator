import { signOut as firebaseSignOut } from "firebase/auth";
import { getAuthInstance } from "./get-auth-instance";

export async function signOut(): Promise<void> {
  const auth = getAuthInstance();
  await firebaseSignOut(auth);
}
