import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getStorageInstance } from "$lib/firebase/get-storage-instance";

/**
 * Downloads an image from an external URL by fetching it directly
 * Note: This may fail due to CORS if the image server doesn't allow cross-origin requests
 * @param sourceUrl - The URL of the image to download
 * @returns A Blob of the downloaded image
 * @throws Error if download fails
 */
export async function downloadImageFromUrl({
	sourceUrl
}: {
	sourceUrl: string;
}): Promise<Blob> {
	try {
		// Try direct fetch first (works if CORS is allowed)
		const response = await fetch(sourceUrl, {
			mode: "cors",
			credentials: "omit"
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
		}

		const blob = await response.blob();

		// Verify it's an image
		if (!blob.type.startsWith("image/")) {
			throw new Error(`URL does not point to an image (got ${blob.type})`);
		}

		// Check size (max 5MB)
		if (blob.size > 5 * 1024 * 1024) {
			throw new Error(`Image too large (${Math.round(blob.size / 1024 / 1024)}MB). Maximum is 5MB.`);
		}

		return blob;
	} catch (error) {
		console.error("Failed to download image:", error);
		throw error instanceof Error ? error : new Error("Failed to download image");
	}
}

/**
 * Uploads a house photo to Firebase Storage
 * @param familyId - The family ID for storage path organization
 * @param houseId - The house ID for storage path organization
 * @param imageBlob - The image data as a Blob
 * @param filename - The filename to use (e.g., "main-photo.jpg")
 * @returns The public download URL for the uploaded image
 * @throws Error if upload fails
 */
export async function uploadHousePhoto({
	familyId,
	houseId,
	imageBlob,
	filename
}: {
	familyId: string;
	houseId: string;
	imageBlob: Blob;
	filename: string;
}): Promise<string> {
	const storage = getStorageInstance();

	// Create storage reference with path: families/{familyId}/houses/{houseId}/{filename}
	const storagePath = `families/${familyId}/houses/${houseId}/${filename}`;
	const storageRef = ref(storage, storagePath);

	// Upload the image
	const uploadResult = await uploadBytes(storageRef, imageBlob, {
		contentType: imageBlob.type
	});

	// Get and return the download URL
	const downloadURL = await getDownloadURL(uploadResult.ref);
	return downloadURL;
}

/**
 * Deletes a house photo from Firebase Storage
 * @param storageUrl - The full storage URL (from getDownloadURL)
 * @throws Error if deletion fails
 */
export async function deleteHousePhoto({
	storageUrl
}: {
	storageUrl: string;
}): Promise<void> {
	const storage = getStorageInstance();

	// Extract the storage path from the URL
	// Firebase Storage URLs look like: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?token={token}
	const url = new URL(storageUrl);
	const pathMatch = url.pathname.match(/\/o\/(.+)$/);

	if (!pathMatch || !pathMatch[1]) {
		throw new Error("Invalid storage URL");
	}

	const storagePath = decodeURIComponent(pathMatch[1]);
	const storageRef = ref(storage, storagePath);

	await deleteObject(storageRef);
}
