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
	type Timestamp
} from 'firebase/firestore';
import { getFirestoreInstance } from '$lib/firebase/get-firestore-instance';
import type { JoinRequest, JoinRequestInput, JoinRequestStatus } from '$lib/types';

const JOIN_REQUESTS_COLLECTION = 'joinRequests';

/**
 * Create a new join request
 */
export async function createJoinRequest(
	familyId: string,
	userId: string,
	userEmail: string,
	userDisplayName: string,
	userPhotoUrl: string | null
): Promise<string> {
	const joinRequestData: JoinRequestInput = {
		familyId,
		userId,
		userEmail,
		userDisplayName,
		userPhotoUrl,
		status: 'pending'
	};

	const docRef = await addDoc(collection(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION), {
		...joinRequestData,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});

	return docRef.id;
}

/**
 * Get all pending join requests for a family
 */
export async function getFamilyJoinRequests(familyId: string): Promise<JoinRequest[]> {
	const q = query(
		collection(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION),
		where('familyId', '==', familyId),
		where('status', '==', 'pending')
	);

	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			...data,
			createdAt: (data.createdAt as Timestamp).toDate(),
			updatedAt: (data.updatedAt as Timestamp).toDate()
		} as JoinRequest;
	});
}

/**
 * Get a specific join request
 */
export async function getJoinRequest(requestId: string): Promise<JoinRequest | null> {
	const docRef = doc(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION, requestId);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) {
		return null;
	}

	const data = docSnap.data();
	return {
		id: docSnap.id,
		...data,
		createdAt: (data.createdAt as Timestamp).toDate(),
		updatedAt: (data.updatedAt as Timestamp).toDate()
	} as JoinRequest;
}

/**
 * Update the status of a join request
 */
export async function updateJoinRequestStatus(
	requestId: string,
	status: JoinRequestStatus
): Promise<void> {
	const docRef = doc(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION, requestId);
	await updateDoc(docRef, {
		status,
		updatedAt: serverTimestamp()
	});
}

/**
 * Delete a join request
 */
export async function deleteJoinRequest(requestId: string): Promise<void> {
	const docRef = doc(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION, requestId);
	await deleteDoc(docRef);
}

/**
 * Get join requests created by a specific user
 */
export async function getUserJoinRequests(userId: string): Promise<JoinRequest[]> {
	const q = query(collection(getFirestoreInstance(), JOIN_REQUESTS_COLLECTION), where('userId', '==', userId));

	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			...data,
			createdAt: (data.createdAt as Timestamp).toDate(),
			updatedAt: (data.updatedAt as Timestamp).toDate()
		} as JoinRequest;
	});
}
