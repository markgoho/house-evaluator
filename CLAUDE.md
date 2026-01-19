# House Evaluator - Development Guidelines

## Package Manager - Bun Only

### Critical: Use Bun, NOT npm or npx

This project uses **Bun** as its package manager and runtime. Do NOT use npm or npx commands.

```bash
# ❌ BAD - Do not use npm/npx
npm install
npm run dev
npx some-command

# ✅ GOOD - Use bun
bun install
bun run dev
bun x some-command
```

**Key Commands:**
- `bun install` - Install dependencies
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun x <command>` - Execute a package binary (replaces npx)

## Browser Extension Version Management

### CRITICAL: Always Update Extension Version

**ALWAYS update the version in `browser-extension/manifest.json` when making ANY changes to the extension code.**

This includes changes to:
- Content scripts (`content-scripts/*.js`)
- Popup scripts (`popup/*.js`)
- Popup HTML/CSS (`popup/*.html`, `popup/*.css`)
- Manifest configuration

### Version Bump Guidelines

Follow semantic versioning:

- **Major version** (X.0.0): Breaking changes or major feature overhaul
  - Example: Changing data extraction format, removing features

- **Minor version** (1.X.0): New features or significant enhancements
  - Example: Adding image extraction, supporting new listing sites

- **Patch version** (1.0.X): Bug fixes or small improvements
  - Example: Fixing selector, improving error handling

### Example Updates

```json
// Before - bug fix
"version": "1.1.0"

// After - bug fix (patch bump)
"version": "1.1.1"

// Before - new feature
"version": "1.1.1"

// After - new feature (minor bump)
"version": "1.2.0"
```

### Why This Matters

- Chrome Web Store requires version bumps for updates
- Users can see what version they're running
- Helps track which features are in which version
- Makes debugging easier ("What version are you using?")

## Firebase Authentication & Firestore Race Conditions

### The Problem

When using Firebase Auth with Firestore in Svelte stores, there's a critical race condition that can occur:

- **Symptom**: Works when navigating between pages, but fails with "Missing or insufficient permissions" when refreshing a page directly
- **Cause**: Firestore listeners try to authenticate before Firebase Auth is fully initialized and has restored the user's auth token

### The Solution Pattern

#### For Components: Use `userProfileReady` Store

**BEST PRACTICE**: Use the `userProfileReady` derived store in components to automatically avoid race conditions:

```typescript
// ❌ BAD - Manual initialization check (error-prone, easy to forget)
import { userProfileStore } from "$lib/stores/user-profile-store";

$effect(() => {
  if (!$userProfileStore.initialized) {
    return;
  }

  if ($userProfileStore.profile?.familyId) {
    loadFamilyData($userProfileStore.profile.familyId);
  }
});

// ✅ GOOD - Use userProfileReady (automatic, foolproof)
import { userProfileReady } from "$lib/stores/user-profile-store";

$effect(() => {
  // userProfileReady only emits when initialized - no manual check needed!
  if ($userProfileReady.profile?.familyId) {
    loadFamilyData($userProfileReady.profile.familyId);
  }
});
```

#### For Stores: Check `initialized` Flag

**For creating stores** that subscribe to other stores, always check the `initialized` flag:

```typescript
// ❌ BAD - Race condition on page refresh
if (browser) {
  authStore.subscribe(($authStore) => {
    if (!$authStore.user) {
      // Handle no user
      return;
    }

    // Set up Firestore listener - MIGHT FAIL on refresh!
    const userRef = doc(db, 'users', $authStore.user.uid);
    onSnapshot(userRef, ...);
  });
}

// ✅ GOOD - Wait for auth to be ready first
if (browser) {
  authStore.subscribe(($authStore) => {
    // CRITICAL: Wait for auth to be initialized
    if (!$authStore.initialized) {
      return;
    }

    if (!$authStore.user) {
      // Handle no user
      return;
    }

    // Now safe to set up Firestore listener
    const userRef = doc(db, 'users', $authStore.user.uid);
    onSnapshot(userRef, ...);
  });
}
```

### Testing Strategy

**Always test with page refreshes, not just navigation:**

1. Navigate to a page normally ✓
2. **Refresh that page directly (F5 or Cmd+R)** ← This catches race conditions!
3. Hard refresh (Ctrl+Shift+R) to clear cache ← Extra thorough

If it works on navigation but fails on refresh, you have an initialization race condition.

### Real Examples from This Codebase

- Store implementation: See `src/lib/stores/user-profile-store.ts:93-120` for the `userProfileReady` derived store
- Component usage: See `src/routes/family/+page.svelte:21-25` for proper usage with `$effect()`
- Store initialization: See `src/lib/stores/user-profile-store.ts:28-31` for checking `initialized` flag

## Firebase Security Rules - Initial Setup Chicken-and-Egg

### The Problem

Firestore security rules can create circular dependencies during initial user setup:

- User needs a family to read/write data
- But you need to create the family first
- Creating criteria requires being a family member
- But user isn't a family member until profile is updated with familyId

### The Solution

**Allow family owners to perform actions even before their user profile has the familyId:**

```javascript
// ❌ BAD - Circular dependency
match /criteria/{criterionId} {
  // Can't create criteria until user profile has familyId
  allow create: if isFamilyMember(familyId);
}

// ✅ GOOD - Allow owner to create during setup
match /criteria/{criterionId} {
  // Owner can create before profile is updated
  allow create: if (isFamilyMember(familyId) || isFamilyOwner(familyId)) &&
                   request.resource.data.familyId == familyId;
}
```

### Setup Flow Order Matters

When creating a new family:

1. Create family document (user is owner)
2. Create default criteria (owner permission allows this)
3. Update user profile with familyId (now user becomes member)

The rules must support this sequence!

## SvelteKit SSR Considerations

### Browser-Only Code

Always wrap Firebase/browser-only code with `if (browser)`:

```typescript
import { browser } from "$app/environment";

if (browser) {
  // Firebase initialization, stores, etc.
}
```

### Store Initialization Order

1. `authStore` - Listens to Firebase Auth state
2. `userProfileStore` - Listens to authStore, then Firestore (wait for initialized!)
3. Components - Listen to both stores with proper loading states

## Svelte 5 Runes Mode

### The Problem

This project uses Svelte 5 with runes mode enabled. The old Svelte 4 reactive statement syntax (`$:`) is **not allowed** and will cause build failures.

**Symptom**: Build fails with error like:

```
`$:` is not allowed in runes mode, use `$derived` or `$effect` instead
```

### The Solution

**Use `$derived` for reactive values and `$effect` for side effects:**

```typescript
// ❌ BAD - Svelte 4 syntax (not allowed in runes mode)
$: isOwner = $userProfileStore.profile?.role === "owner";
$: familyId = $userProfileStore.profile?.familyId;

// ✅ GOOD - Svelte 5 runes syntax
const isOwner = $derived($userProfileStore.profile?.role === "owner");
const familyId = $derived($userProfileStore.profile?.familyId);
```

### Common Runes Patterns

**State (replaces `let` with reactive updates):**

```typescript
let count = $state(0);
let items = $state<Item[]>([]);
```

**Derived values (replaces `$:` reactive statements):**

```typescript
const doubled = $derived(count * 2);
const isEmpty = $derived(items.length === 0);
```

**Effects (replaces `$:` statements with side effects):**

```typescript
$effect(() => {
  console.log(`Count changed to ${count}`);
});
```

### Real Example from This Codebase

See `src/routes/family/+page.svelte:17-18` for proper usage of `$derived` with store subscriptions.
