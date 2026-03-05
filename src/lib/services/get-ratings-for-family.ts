import { collection, getDocs } from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import type { Rating } from "$lib/types";
import { normalizeRatingScores } from "./normalize-rating-scores";

export async function getRatingsForFamily(
  familyId: string,
): Promise<Rating[]> {
  const database = getFirestoreInstance();
  const ratingsReference = collection(
    database,
    "families",
    familyId,
    "ratings",
  );
  const snapshot = await getDocs(ratingsReference);

  return snapshot.docs.map((document) => {
    const data = document.data();
    const rating = {
      id: document.id,
      ...data,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    } as Rating;
    return normalizeRatingScores(rating);
  });
}
