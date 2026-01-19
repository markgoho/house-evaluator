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
  arrayUnion,
} from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import type { House, HouseInput, HouseUpdate } from "$lib/types";
import {
  downloadImageFromUrl,
  uploadHousePhoto,
} from "$lib/services/storage-service";

function calculatePricePerSqFt(
  price: number | null,
  squareFeet: number | null,
): number | null {
  if (price && squareFeet && squareFeet > 0) {
    return Math.round(price / squareFeet);
  }
  return null;
}

export async function createHouse({
  data,
  sourceImageUrl,
}: {
  data: HouseInput;
  sourceImageUrl?: string;
}): Promise<string> {
  const db = getFirestoreInstance();
  const houseRef = doc(collection(db, "families", data.familyId, "houses"));

  const houseData = {
    ...data,
    pricePerSqFt: calculatePricePerSqFt(data.price, data.squareFeet),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Step 1: Create house document first (atomic operation, always succeeds)
  await setDoc(houseRef, houseData);
  const houseId = houseRef.id;

  // Step 2: If image URL provided, attempt to download and upload
  // This is best-effort - house creation succeeds even if image fails
  if (sourceImageUrl) {
    console.log(`[House Service] Image URL provided: ${sourceImageUrl}`);
    try {
      // Download image via direct fetch
      console.log(`[House Service] Downloading image for house ${houseId}...`);
      const imageBlob = await downloadImageFromUrl({ sourceUrl: sourceImageUrl });
      console.log(`[House Service] Image downloaded successfully`);

      // Generate filename with timestamp to ensure uniqueness
      const timestamp = Date.now();
      const extension = imageBlob.type.split("/")[1] ?? "jpg";
      const filename = `main-${timestamp}.${extension}`;
      console.log(`[House Service] Generated filename: ${filename}`);

      // Upload to Firebase Storage
      console.log(`[House Service] Uploading to Firebase Storage...`);
      const photoUrl = await uploadHousePhoto({
        familyId: data.familyId,
        houseId,
        imageBlob,
        filename,
      });
      console.log(`[House Service] Upload complete, photo URL: ${photoUrl}`);

      // Update house document with photo URL
      console.log(`[House Service] Updating house document with photo URL...`);
      await updateDoc(houseRef, {
        photoUrls: arrayUnion(photoUrl),
        updatedAt: serverTimestamp(),
      });

      console.log(`[House Service] Successfully uploaded image for house ${houseId}`);
    } catch (error) {
      // Log error but don't fail house creation
      console.error(`[House Service] Failed to upload image for house ${houseId}:`, error);
    }
  } else {
    console.log(`[House Service] No image URL provided for house ${houseId}`);
  }

  return houseId;
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
