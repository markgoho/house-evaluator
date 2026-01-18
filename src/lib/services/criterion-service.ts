import {
	collection,
	doc,
	getDocs,
	setDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	serverTimestamp,
	writeBatch
} from 'firebase/firestore';
import { getFirestoreInstance } from '$lib/firebase/get-firestore-instance';
import type { Criterion, CriterionInput, CriterionUpdate } from '$lib/types';
import { DEFAULT_CRITERIA } from '$lib/types';

export async function createDefaultCriteria(familyId: string): Promise<void> {
	const db = getFirestoreInstance();
	const batch = writeBatch(db);

	for (const criterionData of DEFAULT_CRITERIA) {
		const criterionRef = doc(collection(db, 'families', familyId, 'criteria'));
		batch.set(criterionRef, {
			...criterionData,
			familyId,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp()
		});
	}

	await batch.commit();
}

export async function getCriteria(familyId: string): Promise<Criterion[]> {
	const db = getFirestoreInstance();
	const criteriaRef = collection(db, 'families', familyId, 'criteria');
	const q = query(criteriaRef, orderBy('order', 'asc'));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			id: doc.id,
			...data,
			createdAt: data.createdAt?.toDate() ?? new Date(),
			updatedAt: data.updatedAt?.toDate() ?? new Date()
		} as Criterion;
	});
}

export async function createCriterion(familyId: string, data: CriterionInput): Promise<string> {
	const db = getFirestoreInstance();
	const criterionRef = doc(collection(db, 'families', familyId, 'criteria'));

	await setDoc(criterionRef, {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});

	return criterionRef.id;
}

export async function updateCriterion(
	familyId: string,
	criterionId: string,
	data: CriterionUpdate
): Promise<void> {
	const db = getFirestoreInstance();
	const criterionRef = doc(db, 'families', familyId, 'criteria', criterionId);

	await updateDoc(criterionRef, {
		...data,
		updatedAt: serverTimestamp()
	});
}

export async function deleteCriterion(familyId: string, criterionId: string): Promise<void> {
	const db = getFirestoreInstance();
	const criterionRef = doc(db, 'families', familyId, 'criteria', criterionId);
	await deleteDoc(criterionRef);
}
