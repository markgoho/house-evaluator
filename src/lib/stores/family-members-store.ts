import { writable } from "svelte/store";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirestoreInstance } from "$lib/firebase/get-firestore-instance";
import { userProfileStore } from "./user-profile-store";
import type { Family, User } from "$lib/types";
import { browser } from "$app/environment";

interface FamilyMembersState {
  familyData: Family | null;
  members: User[];
  loading: boolean;
  error: string | null;
}

function createFamilyMembersStore() {
  const { subscribe, set, update } = writable<FamilyMembersState>({
    familyData: null,
    members: [],
    loading: true,
    error: null,
  });

  let familyUnsubscribe: (() => void) | null = null;
  const memberUnsubscribes = new Map<string, () => void>();

  // Helper to clean up all member listeners
  function cleanupMemberListeners(): void {
    for (const unsubscribe of memberUnsubscribes.values()) {
      unsubscribe();
    }
    memberUnsubscribes.clear();
  }

  // Helper to clean up family listener
  function cleanupFamilyListener(): void {
    if (familyUnsubscribe) {
      familyUnsubscribe();
      familyUnsubscribe = null;
    }
  }

  // Listen to user profile changes and subscribe to family and members
  if (browser) {
    userProfileStore.subscribe(($userProfile) => {
      // CRITICAL: Wait for userProfile to be initialized to avoid race conditions on page refresh
      if (!$userProfile.initialized) {
        return;
      }

      // Clean up all previous listeners
      cleanupFamilyListener();
      cleanupMemberListeners();

      if (!$userProfile.profile?.familyId) {
        set({ familyData: null, members: [], loading: false, error: null });
        return;
      }

      const db = getFirestoreInstance();
      const familyRef = doc(db, "families", $userProfile.profile.familyId);

      set({ familyData: null, members: [], loading: true, error: null });

      // Subscribe to family document to get memberIds
      familyUnsubscribe = onSnapshot(
        familyRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            update((state) => ({
              ...state,
              familyData: null,
              loading: false,
              error: "Family not found",
            }));
            return;
          }

          const familyData = snapshot.data();
          const family: Family = {
            id: snapshot.id,
            ...familyData,
            createdAt: familyData.createdAt?.toDate() ?? new Date(),
            updatedAt: familyData.updatedAt?.toDate() ?? new Date(),
          } as Family;

          // Update family data
          update((state) => ({
            ...state,
            familyData: family,
          }));

          // Get current memberIds
          const memberIds = family.memberIds || [];

          // Determine which member listeners to add/remove
          const currentMemberIds = new Set(memberUnsubscribes.keys());
          const newMemberIds = new Set(memberIds);

          // Remove listeners for members no longer in the family
          for (const memberId of currentMemberIds) {
            if (!newMemberIds.has(memberId)) {
              const unsubscribe = memberUnsubscribes.get(memberId);
              if (unsubscribe) {
                unsubscribe();
                memberUnsubscribes.delete(memberId);
              }
            }
          }

          // Add listeners for new members
          for (const memberId of memberIds) {
            if (!currentMemberIds.has(memberId)) {
              const memberRef = doc(db, "users", memberId);

              const memberUnsubscribe = onSnapshot(
                memberRef,
                (memberSnapshot) => {
                  if (memberSnapshot.exists()) {
                    const memberData = memberSnapshot.data();
                    const member: User = {
                      id: memberSnapshot.id,
                      ...memberData,
                      createdAt: memberData.createdAt?.toDate() ?? new Date(),
                      updatedAt: memberData.updatedAt?.toDate() ?? new Date(),
                    } as User;

                    // Add or update member in the members array
                    update((state) => {
                      const existingIndex = state.members.findIndex(
                        (m) => m.id === member.id,
                      );
                      const updatedMembers = [...state.members];

                      if (existingIndex >= 0) {
                        updatedMembers[existingIndex] = member;
                      } else {
                        updatedMembers.push(member);
                      }

                      return {
                        ...state,
                        members: updatedMembers,
                        loading: false,
                      };
                    });
                  } else {
                    // Member document doesn't exist, remove from array
                    update((state) => ({
                      ...state,
                      members: state.members.filter((m) => m.id !== memberId),
                    }));
                  }
                },
                (error) => {
                  console.error(
                    `Member listener error for ${memberId}:`,
                    error,
                  );
                  // Don't update error state for individual member errors
                  // Just log them and continue
                },
              );

              memberUnsubscribes.set(memberId, memberUnsubscribe);
            }
          }

          // If no members, set loading to false
          if (memberIds.length === 0) {
            update((state) => ({
              ...state,
              loading: false,
            }));
          }
        },
        (error) => {
          console.error("Family listener error:", error);
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

export const familyMembersStore = createFamilyMembersStore();
