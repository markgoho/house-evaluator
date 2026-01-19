import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import type { User, UserInput } from "$lib/types";

export async function createOrUpdateUser(
  userId: string,
  data: UserInput,
): Promise<void> {
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);

  // Filter out undefined values to avoid Firestore errors
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );

  const userData = {
    ...cleanedData,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, userData, { merge: true });
}

export async function getUser(userId: string): Promise<User | null> {
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    id: userSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as User;
}

export async function updateUserFamilyId(
  userId: string,
  familyId: string,
): Promise<void> {
  const db = getFirestoreInstance();
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    familyId,
    updatedAt: serverTimestamp(),
  });
}
