import {
	collection,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	arrayUnion,
	serverTimestamp
} from 'firebase/firestore';
import { getFirestoreInstance } from '$lib/firebase/get-firestore-instance';
import type { Family, FamilyInput } from '$lib/types';
import { createDefaultCriteria } from './criterion-service';

export async function createFamily(data: FamilyInput): Promise<string> {
	const db = getFirestoreInstance();
	const familyRef = doc(collection(db, 'families'));

	const familyData = {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	};

	await setDoc(familyRef, familyData);

	// Create default criteria for the new family
	await createDefaultCriteria(familyRef.id);

	return familyRef.id;
}

export async function getFamily(familyId: string): Promise<Family | null> {
	const db = getFirestoreInstance();
	const familyRef = doc(db, 'families', familyId);
	const familySnap = await getDoc(familyRef);

	if (!familySnap.exists()) {
		return null;
	}

	const data = familySnap.data();
	return {
		id: familySnap.id,
		...data,
		createdAt: data.createdAt?.toDate() ?? new Date(),
		updatedAt: data.updatedAt?.toDate() ?? new Date()
	} as Family;
}

export async function addFamilyMember(familyId: string, userId: string): Promise<void> {
	const db = getFirestoreInstance();
	const familyRef = doc(db, 'families', familyId);

	await updateDoc(familyRef, {
		memberIds: arrayUnion(userId),
		updatedAt: serverTimestamp()
	});
}
