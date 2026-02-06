# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-06
**Commit:** 67bc5fe
**Branch:** trunk

## OVERVIEW

Collaborative house evaluation SPA for families. SvelteKit 2 (Svelte 5 runes) + Firebase (Firestore, Auth, Storage) + Zod validation. Deployed as static SPA to Firebase Hosting. Includes a Chrome browser extension for scraping real estate listings.

## STRUCTURE

```
./
├── src/
│   ├── routes/              # SvelteKit pages (SPA, no +server.ts files)
│   │   ├── +layout.svelte   # Root shell: Nav, auth redirects, loading gate
│   │   ├── houses/           # CRUD: list, new, [id], [id]/edit, [id]/rate
│   │   ├── criteria/         # Manage rating criteria
│   │   ├── family/           # Family management, join requests
│   │   ├── setup/            # First-time onboarding
│   │   ├── pending/          # Awaiting family join approval
│   │   └── login/            # Google sign-in
│   ├── lib/
│   │   ├── stores/           # Svelte stores (auth chain pattern) → see stores/AGENTS.md
│   │   ├── services/         # Firestore CRUD operations (one service per domain)
│   │   ├── firebase/         # Firebase init, auth/firestore/storage getters
│   │   ├── types/            # TypeScript interfaces (barrel export)
│   │   ├── schemas/          # Zod form validation schemas
│   │   ├── components/       # Shared components (ui/ barrel, HouseForm, Nav)
│   │   └── constants.ts      # App-wide constants (routes, rating system, validation)
│   └── app.css               # Global styles (CSS custom properties)
├── browser-extension/        # Chrome MV3 extension → see browser-extension/AGENTS.md
├── firestore.rules           # Firestore security rules (family-scoped)
├── storage.rules              # Storage security rules
└── firebase.json              # Hosting config (SPA rewrite to index.html)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add a new page/route | `src/routes/{name}/+page.svelte` | SvelteKit file-based routing |
| Add a new store | `src/lib/stores/` | Follow auth chain pattern (see stores/AGENTS.md) |
| Add a new service | `src/lib/services/` | One file per domain, uses `getFirestoreInstance()` |
| Add a Firebase helper | `src/lib/firebase/` | One export per file pattern |
| Add/edit types | `src/lib/types/` | Add file + re-export from `index.ts` |
| Add validation schema | `src/lib/schemas/` | Zod schema + re-export from `index.ts` |
| Add UI component | `src/lib/components/ui/` | Re-export from `index.ts` barrel |
| Edit security rules | `firestore.rules` / `storage.rules` | Deploy: `firebase deploy --only firestore:rules,storage:rules` |
| Modify extension | `browser-extension/` | **MUST bump version in manifest.json** |
| Auth flow debugging | `auth-store → user-profile-store → +layout.svelte` | Check `initialized` flags |
| Route constants | `src/lib/constants.ts` | `ROUTES`, `RATING`, `PROPERTY`, `UI` |

## CONVENTIONS

- **Package manager**: Bun only. Never npm/npx. (`bun install`, `bun run dev`, `bun x`)
- **Svelte 5 runes mode**: `$state()`, `$derived()`, `$effect()`. No `$:` syntax — build fails.
- **One export per file**: Each .ts file exports exactly one function. Helpers stay private.
- **File naming**: kebab-case. File name matches export name.
- **Barrel exports**: `index.ts` in types/, schemas/, components/ui/ — use `export * from` or `export { default as }`.
- **Store pattern**: Factory function → writable internally → expose only `subscribe`. See stores/AGENTS.md.
- **Firebase SSR guard**: All Firebase code wrapped in `if (browser)`. Module-level calls use lazy getter pattern.
- **Static SPA**: adapter-static with `fallback: "index.html"`. No SSR, no +server.ts endpoints.
- **TypeScript strict**: `noUncheckedIndexedAccess`, `strict: true`. See `.claude/rules/typescript.md` for full ESLint rules.
- **Variable naming**: No abbreviations (`error` not `err`, `document` not `doc` in variable names). `unicorn/prevent-abbreviations`.
- **Null handling**: Prefer `undefined` over `null`. Only `null` when external APIs require it (with eslint-disable comment).
- **Parameters**: Single object parameter pattern for functions with 2+ args.
- **Return types**: Always explicit on functions.

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER** use npm/npx — Bun only
- **NEVER** use `$:` reactive syntax — Svelte 5 runes mode only
- **NEVER** use `as any`, `@ts-ignore`, `@ts-expect-error`
- **NEVER** use enums — use union string literals
- **NEVER** set Firestore listeners before `initialized` flag is true (race condition on page refresh)
- **NEVER** call Firebase at module top-level without browser guard
- **NEVER** disable ESLint rules globally — line-level only with justification
- **NEVER** use abbreviations in variable names
- **NEVER** use `null` when `undefined` works
- **NEVER** modify extension code without bumping `browser-extension/manifest.json` version

## STORE INITIALIZATION CHAIN

```
authStore (onAuthStateChanged)
  └→ userProfileStore (waits for authStore.initialized)
       ├→ housesStore (waits for userProfileStore.initialized)
       ├→ criteriaStore (waits for userProfileStore.initialized)
       └→ familyMembersStore (waits for userProfileStore.initialized)
```

**In components**: Use `userProfileReady` derived store (not `userProfileStore` directly) to avoid race conditions.

## FIRESTORE DATA MODEL

```
/users/{userId}                           # User profile (familyId, role)
/families/{familyId}                      # Family doc (ownerId, name)
  /houses/{houseId}                       # House listings
  /criteria/{criterionId}                 # Rating criteria
  /ratings/{ratingId}                     # User ratings (userId scoped)
/joinRequests/{requestId}                 # Family join requests
```

Security: All data family-scoped. Owner can manage family + approve joins. Members CRUD houses/ratings/criteria within their family.

## COMMANDS

```bash
bun run dev          # Dev server at localhost:5173
bun run build        # Static build to ./build
bun run check        # svelte-check + TypeScript
bun test             # Vitest watch mode
bun run test:run     # Vitest single run (CI)
bun run test:ui      # Vitest browser UI
firebase deploy --only hosting                    # Deploy app
firebase deploy --only firestore:rules,storage    # Deploy rules
```

## CI/CD

GitHub Actions on push to `trunk`: checkout → setup Bun → `bun install` → `bun run build` → deploy to Firebase Hosting. No test step in CI (tests are manual).

## NOTES

- **Race condition on refresh**: If page works via navigation but fails on F5 with "Missing or insufficient permissions", check store `initialized` guards. Auth token hasn't restored yet. See stores/AGENTS.md for full pattern.
- **Setup chicken-and-egg**: Family creation flow: create family → create default criteria (owner permission) → update user profile with familyId. Security rules must allow owner to create criteria **before** their profile has `familyId` — use `isFamilyOwner(familyId)` check alongside `isFamilyMember(familyId)` in rules.
- **Extension → App integration**: Extension builds URL params and opens `/houses/new?address=...&city=...`. The new house page parses URL params to prefill HouseForm.
- **No ESLint config file**: ESLint rules are defined in `.claude/rules/typescript.md` (project convention doc), not a traditional .eslintrc.
- **Build output committed**: `./build/` directory is in git (intentional for Firebase Hosting). Don't be surprised by it.
- **Test setup**: `vitest-setup.ts` mocks `$app/environment`, `$app/navigation`, `$app/state` globally.

## SVELTE 5 RUNES — MIGRATION REFERENCE

Build fails with `` `$:` is not allowed in runes mode `` if old Svelte 4 syntax is used.

```typescript
// ❌ Svelte 4 (BREAKS BUILD)
$: isOwner = $userProfileStore.profile?.role === "owner";

// ✅ Svelte 5 runes
const isOwner = $derived($userProfileStore.profile?.role === "owner");
```

| Old (`$:`) | New (runes) | Use for |
|------------|-------------|---------|
| `$: x = expr` | `const x = $derived(expr)` | Reactive values |
| `$: { sideEffect() }` | `$effect(() => { sideEffect() })` | Side effects |
| `let x = value` (reactive) | `let x = $state(value)` | Mutable state |

## TESTING PHILOSOPHY

Test **user behavior**, not implementation details. Uses Vitest + `@testing-library/svelte` + `@testing-library/jest-dom` + jsdom.

### Query Priority (use first match)

1. `screen.getByRole('button', { name: 'Add House' })` — accessible roles (best)
2. `screen.getByLabelText('Street Address')` — form labels
3. `screen.getByText('$500,000')` — visible text
4. `screen.getByTestId('complex-widget')` — last resort only

### Anti-Patterns

```typescript
// ❌ BAD — testing implementation details
container.querySelector('.loading-spinner')     // CSS selector
container.querySelector('svg')                  // raw HTML element
expect(component.loading).toBe(false)           // internal state

// ✅ GOOD — testing what users see
screen.getByText('Loading...')
screen.getByRole('button', { name: 'Save' })
screen.queryByText('Loading...')  // assert absence
```

### Mocking

```typescript
// Mock stores — use readable()
vi.mock('$lib/stores/houses-store', () => ({
  housesStore: readable({ houses: [mockHouse], loading: false, error: null })
}));

// Mock services — use vi.fn()
vi.mock('$lib/services/house-service', () => ({
  getHouse: vi.fn().mockResolvedValue(mockHouse),
  deleteHouse: vi.fn().mockResolvedValue(undefined)
}));
```

### Test Quality Heuristic

If you can refactor the component without changing the test, it's a good test. Tests should break when **user experience** breaks, not when internal code is reorganized.
