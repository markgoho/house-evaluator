import { writable } from "svelte/store";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import { userProfileStore } from "./user-profile-store";
import type { House } from "$lib/types";
import { browser } from "$app/environment";

interface HousesState {
  houses: House[];
  loading: boolean;
  error: string | null;
}

function createHousesStore() {
  const { subscribe, set, update } = writable<HousesState>({
    houses: [],
    loading: true,
    error: null,
  });

  let unsubscribe: (() => void) | null = null;

  // Listen to user profile changes and subscribe to family houses
  if (browser) {
    userProfileStore.subscribe(($userProfile) => {
      // CRITICAL: Wait for profile to be initialized
      if (!$userProfile.initialized) {
        return;
      }

      // Clean up previous listener
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      if (!$userProfile.profile?.familyId) {
        set({ houses: [], loading: false, error: null });
        return;
      }

      // Subscribe to houses collection
      const db = getFirestoreInstance();
      const housesRef = collection(
        db,
        "families",
        $userProfile.profile.familyId,
        "houses",
      );
      const q = query(housesRef, orderBy("createdAt", "desc"));

      set({ houses: [], loading: true, error: null });

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const houses = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() ?? new Date(),
              updatedAt: data.updatedAt?.toDate() ?? new Date(),
            } as House;
          });

          set({ houses, loading: false, error: null });
        },
        (error) => {
          console.error("Houses listener error:", error);
          update((state) => ({
            ...state,
            loading: false,
            error: error.message,
          }));
        },
      );
    });
  }

  return {
    subscribe,
  };
}

export const housesStore = createHousesStore();
