import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import type { Rating, RatingInput, RatingUpdate, Criterion } from "$lib/types";

// Calculates weighted average score
// Scores range from -5 (poor) to +5 (excellent), with 0 as baseline/adequate
function calculateOverallScore(
  criteriaScores: Record<string, number>,
  criteria: Criterion[],
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const criterion of criteria) {
    const score = criteriaScores[criterion.id];
    if (score !== undefined) {
      weightedSum += score * criterion.weight;
      totalWeight += criterion.weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 10) / 10; // Round to 1 decimal
}

export async function createOrUpdateRating(
  data: RatingInput,
  criteria: Criterion[],
): Promise<string> {
  const db = getFirestoreInstance();

  // Check if rating already exists for this user and house
  const ratingsRef = collection(db, "families", data.familyId, "ratings");
  const q = query(
    ratingsRef,
    where("userId", "==", data.userId),
    where("houseId", "==", data.houseId),
  );
  const snapshot = await getDocs(q);

  const overallScore = calculateOverallScore(data.criteriaScores, criteria);

  const ratingData = {
    ...data,
    overallScore,
    updatedAt: serverTimestamp(),
  };

  if (!snapshot.empty) {
    // Update existing rating
    const ratingDoc = snapshot.docs[0];
    if (ratingDoc) {
      await updateDoc(ratingDoc.ref, ratingData);
      return ratingDoc.id;
    }
  }

  // Create new rating
  const ratingRef = doc(ratingsRef);
  await setDoc(ratingRef, {
    ...ratingData,
    createdAt: serverTimestamp(),
  });

  return ratingRef.id;
}

export async function getRatingsForHouse(
  familyId: string,
  houseId: string,
): Promise<Rating[]> {
  const db = getFirestoreInstance();
  const ratingsRef = collection(db, "families", familyId, "ratings");
  const q = query(ratingsRef, where("houseId", "==", houseId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    } as Rating;
  });
}

export async function getRatingByUserAndHouse(
  familyId: string,
  userId: string,
  houseId: string,
): Promise<Rating | null> {
  const db = getFirestoreInstance();
  const ratingsRef = collection(db, "families", familyId, "ratings");
  const q = query(
    ratingsRef,
    where("userId", "==", userId),
    where("houseId", "==", houseId),
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  if (!doc) {
    return null;
  }

  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as Rating;
}

export async function deleteRating(
  familyId: string,
  ratingId: string,
): Promise<void> {
  const db = getFirestoreInstance();
  const ratingRef = doc(db, "families", familyId, "ratings", ratingId);
  await deleteDoc(ratingRef);
}
