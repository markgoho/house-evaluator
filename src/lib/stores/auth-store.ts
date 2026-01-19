import { writable, type Readable } from "svelte/store";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getAuthInstance } from "$lib/firebase/get-auth-instance";
import { browser } from "$app/environment";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  // Initialize auth listener only in browser
  if (browser) {
    const auth = getAuthInstance();
    onAuthStateChanged(auth, (user) => {
      set({
        user,
        loading: false,
        initialized: true,
      });
    });
  }

  return {
    subscribe,
  };
}

export const authStore = createAuthStore();
