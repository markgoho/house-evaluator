import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getStorageInstance } from "$lib/firebase/get-storage-instance";

/**
 * Downloads an image from an external URL via our CORS proxy API route
 * @param sourceUrl - The URL of the image to download
 * @returns A Blob of the downloaded image
 * @throws Error if download fails or response is invalid
 */
export async function downloadImageFromUrl({
	sourceUrl
}: {
	sourceUrl: string;
}): Promise<Blob> {
	const response = await fetch("/api/download-image", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ imageUrl: sourceUrl })
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to download image: ${error}`);
	}

	const data = await response.json();

	if (!data.image || !data.contentType) {
		throw new Error("Invalid response from download API");
	}

	// Convert base64 to Blob
	const base64Data = data.image;
	const byteCharacters = atob(base64Data);
	const byteNumbers = new Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNumbers);
	return new Blob([byteArray], { type: data.contentType });
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
