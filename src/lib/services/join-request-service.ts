import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import type {
  JoinRequest,
  JoinRequestInput,
  JoinRequestStatus,
} from "$lib/types";
import { getUser } from "./user-service";

const JOIN_REQUESTS_COLLECTION = "joinRequests";

/**
 * Check if a user has a pending join request for a specific family
 */
export async function hasPendingJoinRequest({
  userId,
  familyId,
}: {
  userId: string;
  familyId: string;
}): Promise<boolean> {
  const q = query(
    collection(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION),
    where("userId", "==", userId),
    where("familyId", "==", familyId),
    where("status", "==", "pending"),
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Create a new join request
 * Throws an error if:
 * - User already has a family
 * - A pending request already exists for this user and family
 */
export async function createJoinRequest({
  familyId,
  userId,
  userEmail,
  userDisplayName,
  userPhotoUrl,
}: {
  familyId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userPhotoUrl: string | null;
}): Promise<string> {
  // Check if user already has a family
  const user = await getUser(userId);
  if (user?.familyId) {
    throw new Error(
      "You are already a member of a family. You cannot join another family.",
    );
  }

  // Check for existing pending request
  const existingRequest = await hasPendingJoinRequest({ userId, familyId });
  if (existingRequest) {
    throw new Error(
      "You already have a pending join request for this family. Please wait for the family owner to approve your request.",
    );
  }

  const joinRequestData: JoinRequestInput = {
    familyId,
    userId,
    userEmail,
    userDisplayName,
    userPhotoUrl,
    status: "pending",
  };

  const docRef = await addDoc(
    collection(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION),
    {
      ...joinRequestData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return docRef.id;
}

/**
 * Get all pending join requests for a family
 */
export async function getFamilyJoinRequests(
  familyId: string,
): Promise<JoinRequest[]> {
  const q = query(
    collection(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION),
    where("familyId", "==", familyId),
    where("status", "==", "pending"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as JoinRequest;
  });
}

/**
 * Get a specific join request
 */
export async function getJoinRequest(
  requestId: string,
): Promise<JoinRequest | null> {
  const docRef = doc(
    getFirestoreInstance(),
    JOIN_REQUESTS_COLLECTION,
    requestId,
  );
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  } as JoinRequest;
}

/**
 * Update the status of a join request
 */
export async function updateJoinRequestStatus(
  requestId: string,
  status: JoinRequestStatus,
): Promise<void> {
  const docRef = doc(
    getFirestoreInstance(),
    JOIN_REQUESTS_COLLECTION,
    requestId,
  );
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a join request
 */
export async function deleteJoinRequest(requestId: string): Promise<void> {
  const docRef = doc(
    getFirestoreInstance(),
    JOIN_REQUESTS_COLLECTION,
    requestId,
  );
  await deleteDoc(docRef);
}

/**
 * Get join requests created by a specific user
 */
export async function getUserJoinRequests(
  userId: string,
): Promise<JoinRequest[]> {
  const q = query(
    collection(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as JoinRequest;
  });
}
