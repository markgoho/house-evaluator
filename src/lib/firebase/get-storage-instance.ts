import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { initializeFirebase } from './initialize-firebase';

let storageInstance: FirebaseStorage | null = null;

export function getStorageInstance(): FirebaseStorage {
	if (!storageInstance) {
		const app = initializeFirebase();
		storageInstance = getStorage(app);
	}
	return storageInstance;
}
