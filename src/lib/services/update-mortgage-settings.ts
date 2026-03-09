import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import type { MortgageSettings } from "$lib/types";

/**
 * Save mortgage settings to the family document in Firestore.
 */
export async function updateMortgageSettings({
	familyId,
	settings
}: {
	familyId: string;
	settings: MortgageSettings;
}): Promise<void> {
	const database = getFirestoreInstance();
	const familyReference = doc(database, "families", familyId);

	await updateDoc(familyReference, {
		mortgageSettings: settings,
		updatedAt: serverTimestamp()
	});
}
