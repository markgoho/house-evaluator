import { writable } from "svelte/store";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import { userProfileStore } from "./user-profile-store";
import type { Criterion } from "$lib/types";
import { browser } from "$app/environment";

interface CriteriaState {
  criteria: Criterion[];
  loading: boolean;
  error: string | null;
}

function createCriteriaStore() {
  const { subscribe, set, update } = writable<CriteriaState>({
    criteria: [],
    loading: true,
    error: null,
  });

  let unsubscribe: (() => void) | null = null;

  // Listen to user profile changes and subscribe to family criteria
  if (browser) {
    userProfileStore.subscribe(($userProfile) => {
      // Clean up previous listener
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      if (!$userProfile.profile?.familyId) {
        set({ criteria: [], loading: false, error: null });
        return;
      }

      // Subscribe to criteria collection
      const db = getFirestoreInstance();
      const criteriaRef = collection(
        db,
        "families",
        $userProfile.profile.familyId,
        "criteria",
      );
      const q = query(criteriaRef, orderBy("order", "asc"));

      set({ criteria: [], loading: true, error: null });

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const criteria = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() ?? new Date(),
              updatedAt: data.updatedAt?.toDate() ?? new Date(),
            } as Criterion;
          });

          set({ criteria, loading: false, error: null });
        },
        (error) => {
          console.error("Criteria listener error:", error);
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

export const criteriaStore = createCriteriaStore();
