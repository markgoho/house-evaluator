# STORES — Auth Chain Pattern

Reactive Svelte stores backed by Firestore `onSnapshot` listeners. Stores form a dependency chain — each waits for its parent to `initialized` before attaching listeners.

## INITIALIZATION CHAIN

```
authStore (onAuthStateChanged → sets initialized)
  └→ userProfileStore (subscribes to authStore, waits for initialized)
       ├→ housesStore (subscribes to userProfileStore, waits for initialized)
       ├→ criteriaStore (subscribes to userProfileStore, waits for initialized)
       └→ familyMembersStore (subscribes to userProfileStore, waits for initialized)
```

**CRITICAL**: Never attach a Firestore listener before the parent store's `initialized === true`. Skipping this causes race conditions on page refresh (F5) where Firestore queries fire before `familyId` is available, resulting in "Missing or insufficient permissions" errors.

### Verification Checklist (Race Conditions)

After modifying any store, always test:
1. Navigate to page via app link — should work
2. Refresh page (F5 / Cmd+R) — **must also work** (catches initialization races)
3. Hard refresh (Ctrl+Shift+R) — clears cache, extra thorough

If step 1 works but step 2 fails, you have an `initialized` guard missing.

## STORE ANATOMY

Every store follows this exact structure:

```typescript
interface XxxState {
  /* domain data */;
  loading: boolean;
  error: string | null;
  initialized?: boolean;       // only authStore and userProfileStore
}

function createXxxStore() {
  const { subscribe, set, update } = writable<XxxState>({ /* initial */ });
  let unsubscribe: (() => void) | null = null;

  if (browser) {                              // SSR guard — REQUIRED
    parentStore.subscribe(($parent) => {
      if (!$parent.initialized) return;       // wait for parent
      if (unsubscribe) { unsubscribe(); unsubscribe = null; }  // cleanup previous
      if (!$parent.profile?.familyId) { set(/* empty state */); return; }

      // attach Firestore onSnapshot
      unsubscribe = onSnapshot(ref, (snapshot) => { set(/* ... */); });
    });
  }

  return { subscribe };                       // expose ONLY subscribe
}

export const xxxStore = createXxxStore();
```

## KEY PATTERNS

| Pattern | Where | Why |
|---------|-------|-----|
| `if (browser)` guard | All stores, top of factory | Prevents Firebase calls during SSR/build |
| `if (!$parent.initialized) return` | Child stores | Prevents premature Firestore queries |
| `unsubscribe` variable + cleanup | All stores with listeners | Prevents listener leaks on auth/family change |
| `return { subscribe }` only | All stores | Prevents external mutation of store state |
| `userProfileReady` derived store | `user-profile-store.ts` | Filters emissions until `initialized === true` |

## `userProfileReady` — Component-Safe Store

`userProfileStore` emits immediately with `{ initialized: false }`. Components using `$effect()` would fire prematurely.

**Solution**: `userProfileReady` (derived store) suppresses emissions until initialized. Always use this in components instead of `userProfileStore` directly.

## `familyMembersStore` — Multi-Listener Pattern

Unlike other stores, this one manages **per-member** Firestore listeners via a `Map<string, () => void>`. When `family.memberIds` changes, it diffs the set: removes listeners for departed members, adds listeners for new ones. Individual member listener errors are logged but don't set the store's error state.

## TESTING

Mock stores with `vi.mock` + `readable` from `svelte/store`. See `__tests__/store-mocking-example.test.ts`. Pattern: replace the entire module export with a `readable()` wrapping test data.

## NAMING

| Element | Convention | Example |
|---------|------------|---------|
| File | `kebab-case.ts` | `houses-store.ts` |
| Factory | `createXxxStore()` | `createHousesStore()` |
| Export | `xxxStore` | `housesStore` |
| State interface | `XxxState` | `HousesState` |
