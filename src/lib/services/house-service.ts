import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import type { House, HouseInput, HouseUpdate } from "$lib/types";

function calculatePricePerSqFt(
  price: number | null,
  squareFeet: number | null,
): number | null {
  if (price && squareFeet && squareFeet > 0) {
    return Math.round(price / squareFeet);
  }
  return null;
}

export async function createHouse(data: HouseInput): Promise<string> {
  const db = getFirestoreInstance();
  const houseRef = doc(collection(db, "families", data.familyId, "houses"));

  const houseData = {
    ...data,
    pricePerSqFt: calculatePricePerSqFt(data.price, data.squareFeet),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(houseRef, houseData);
  return houseRef.id;
}

export async function getHouse(
  familyId: string,
  houseId: string,
): Promise<House | null> {
  const db = getFirestoreInstance();
  const houseRef = doc(db, "families", familyId, "houses", houseId);
  const houseSnap = await getDoc(houseRef);

  if (!houseSnap.exists()) {
    return null;
  }

  const data = houseSnap.data();
  return {
    id: houseSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as House;
}

export async function getHouses(familyId: string): Promise<House[]> {
  const db = getFirestoreInstance();
  const housesRef = collection(db, "families", familyId, "houses");
  const q = query(housesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    } as House;
  });
}

export async function updateHouse(
  familyId: string,
  houseId: string,
  data: HouseUpdate,
): Promise<void> {
  const db = getFirestoreInstance();
  const houseRef = doc(db, "families", familyId, "houses", houseId);

  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Recalculate pricePerSqFt if price or squareFeet changed
  if ("price" in data || "squareFeet" in data) {
    const currentHouse = await getHouse(familyId, houseId);
    const newPrice = data.price ?? currentHouse?.price ?? null;
    const newSquareFeet = data.squareFeet ?? currentHouse?.squareFeet ?? null;
    updateData.pricePerSqFt = calculatePricePerSqFt(newPrice, newSquareFeet);
  }

  await updateDoc(houseRef, updateData);
}

export async function deleteHouse(
  familyId: string,
  houseId: string,
): Promise<void> {
  const db = getFirestoreInstance();
  const houseRef = doc(db, "families", familyId, "houses", houseId);
  await deleteDoc(houseRef);
}
