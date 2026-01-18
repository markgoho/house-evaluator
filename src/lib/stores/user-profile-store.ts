import { writable } from 'svelte/store';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirestoreInstance } from '$lib/firebase/get-firestore-instance';
import { authStore } from './auth-store';
import type { User } from '$lib/types';
import { browser } from '$app/environment';

interface UserProfileState {
	profile: User | null;
	loading: boolean;
	initialized: boolean;
	error: string | null;
}

function createUserProfileStore() {
	const { subscribe, set, update } = writable<UserProfileState>({
		profile: null,
		loading: true,
		initialized: false,
		error: null
	});

	let unsubscribe: (() => void) | null = null;

	// Listen to auth changes and subscribe to user profile
	if (browser) {
		authStore.subscribe(($authStore) => {
			// Clean up previous listener
			if (unsubscribe) {
				unsubscribe();
				unsubscribe = null;
			}

			if (!$authStore.user) {
				set({ profile: null, loading: false, initialized: true, error: null });
				return;
			}

			// Subscribe to user profile document
			const db = getFirestoreInstance();
			const userRef = doc(db, 'users', $authStore.user.uid);

			unsubscribe = onSnapshot(
				userRef,
				(snapshot) => {
					if (snapshot.exists()) {
						const data = snapshot.data();
						set({
							profile: {
								id: snapshot.id,
								...data,
								createdAt: data.createdAt?.toDate() ?? new Date(),
								updatedAt: data.updatedAt?.toDate() ?? new Date()
							} as User,
							loading: false,
							initialized: true,
							error: null
						});
					} else {
						set({
							profile: null,
							loading: false,
							initialized: true,
							error: 'User profile not found'
						});
					}
				},
				(error) => {
					console.error('User profile listener error:', error);
					update((state) => ({
						...state,
						loading: false,
						initialized: true,
						error: error.message
					}));
				}
			);
		});
	}

	return {
		subscribe
	};
}

export const userProfileStore = createUserProfileStore();
