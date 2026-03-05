# Rating Scale Migration: -5..5 → 0..5

## TL;DR

> **Quick Summary**: Migrate the rating scale from -5 to 5 → 0 to 5 in a non-breaking way. Existing Firestore ratings stay untouched and are normalized on read. New ratings use the 0-5 scale natively with a `scaleVersion` field for differentiation.
> 
> **Deliverables**:
> - Updated RATING constants (MIN: 0, MAX: 5)
> - `scaleVersion` field on Rating type
> - Normalization function with tests for converting old scores on read
> - Updated rating form (slider 0-5, new labels)
> - Updated rating display (gradient colors, no +/- signs)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2 → Tasks 3 & 4 (parallel) → Task 5

---

## Context

### Original Request
User's kids don't like the -5 to 5 rating scale and want 0 to 5 instead. Must be non-breaking — existing house ratings on the old scale still work, but all new ratings use 0-5.

### Interview Summary
**Key Discussions**:
- **Old ratings handling**: Normalize on read using `(oldScore + 5) / 2`. No Firestore data migration.
- **Scale semantics**: 0 = Poor, 5 = Excellent. Simple, no negatives.
- **Color coding**: Gradient — 0-1 = red, 2-3 = neutral/default, 4-5 = green.
- **Default slider**: 0 (kids must actively rate each criterion).
- **Re-rating**: Convert old scores to new scale in the form; saving stores on new scale.
- **Tests**: Yes, key logic only (normalization + scoring).

**Research Findings**:
- 10 files reference the rating system; `calculateOverallScore` is scale-agnostic
- Firestore rules have NO numeric validation — only auth/family checks
- No rating store — ratings fetched on-demand via service functions
- Rating documents at `/families/{familyId}/ratings/{ratingId}`

### Metis Review
**Identified Gaps** (addressed):
- **Normalization produces floats for odd old scores**: `(oldScore + 5) / 2` maps 0 → 2.5. Using `Math.round` for `criteriaScores` (integers for UI) but keeping `overallScore` as float (1 decimal) since it's a weighted average already displayed as decimal.
- **`overallScore` also needs normalization on read**: Same formula applies. Since `calculateOverallScore` is a linear weighted average, normalizing the result is mathematically equivalent to recomputing from normalized inputs.
- **Missing `scaleVersion` detection**: Treat missing/undefined `scaleVersion` as version 1 (old scale). Only `scaleVersion === 2` skips normalization.
- **`BASELINE_LABEL: 'Adequate'` no longer makes sense**: Remove `BASELINE` and `BASELINE_LABEL` from constants since 0 now means "Poor", not "Adequate". No code references `BASELINE` outside the constant definition.

---

## Work Objectives

### Core Objective
Change the rating scale from -5..5 to 0..5 while ensuring backward compatibility with existing Firestore data through read-time normalization.

### Concrete Deliverables
- `src/lib/constants.ts` — Updated RATING constants
- `src/lib/types/rating.ts` — `scaleVersion` field added to Rating interface
- `src/lib/services/normalize-rating-scores.ts` — New normalization function
- `src/lib/services/__tests__/normalize-rating-scores.test.ts` — Tests for normalization
- `src/lib/services/rating-service.ts` — Normalization on reads, `scaleVersion: 2` on writes
- `src/lib/schemas/rating-form-schema.ts` — Auto-updated via constants (verify messages)
- `src/routes/houses/[id]/rate/+page.svelte` — Slider 0-5, updated labels
- `src/routes/houses/[id]/components/ratings-card.svelte` — Gradient colors, updated display

### Definition of Done
- [x] `bun run build` exits with code 0
- [x] `bun run check` exits with code 0
- [x] `bun run test:run` exits with code 0
- [x] New ratings saved with `scaleVersion: 2` and scores in 0-5 range
- [x] Old ratings display correctly with normalized scores

### Must Have
- Non-breaking: existing Firestore data untouched
- `scaleVersion` field to distinguish old vs new ratings
- Read-time normalization for old ratings
- Updated UI (slider, labels, colors)
- Tests for normalization logic

### Must NOT Have (Guardrails)
- DO NOT create a Firestore data migration script — normalization is read-time only
- DO NOT modify `calculateOverallScore` logic — only update its comment
- DO NOT add numeric validation to Firestore security rules
- DO NOT add `scaleVersion` to the Zod form schema — it's service-layer, not user input
- DO NOT add normalization logic in Svelte components — centralize in service layer
- DO NOT add per-criterion score display in ratings-card
- DO NOT add user-facing migration tooltips or explanations
- DO NOT change `CRITERION_WEIGHT` constants
- DO NOT touch the browser extension
- DO NOT add per-notch labels to the slider — only min/current/max

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: YES (key logic only — normalization and scoring)
- **Framework**: Vitest

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

Every task includes specific Bash-based verification commands. The normalization function gets dedicated Vitest tests. Final verification uses `bun run build`, `bun run check`, and `bun run test:run`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Constants + Types (foundation)

Wave 2 (After Wave 1):
└── Task 2: Service Layer — normalization function + integration + tests

Wave 3 (After Wave 2):
├── Task 3: Rate Page UI (input side)
└── Task 4: Ratings Display (output side)

Wave 4 (After Wave 3):
└── Task 5: Final verification + build
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4 | None (foundation) |
| 2 | 1 | 3, 4 | None (service changes needed first) |
| 3 | 2 | 5 | 4 |
| 4 | 2 | 5 | 3 |
| 5 | 3, 4 | None (final) | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended |
|------|-------|-------------|
| 1 | 1 | quick — small constants/types changes |
| 2 | 2 | unspecified-high — core logic + tests |
| 3 | 3, 4 | parallel, both quick/unspecified-low |
| 4 | 5 | quick — build verification |

---

## TODOs

- [x] 1. Update Constants and Types (Foundation)

  **What to do**:
  - Update `RATING` in `src/lib/constants.ts`:
    - `MIN: 0` (was -5)
    - `MAX: 5` (unchanged)
    - Remove `BASELINE: 0` (no longer needed — 0 now means "Poor", not "Adequate")
    - Remove `BASELINE_LABEL: 'Adequate'` (no longer needed)
    - `MIN_LABEL: 'Poor'` (unchanged)
    - `MAX_LABEL: 'Excellent'` (unchanged)
  - Update `Rating` interface in `src/lib/types/rating.ts`:
    - Add optional field: `scaleVersion?: number`
    - Update comment on line 8: change "(-5 to +5, with 0 as baseline)" to "(0 to 5, with 0 as poor and 5 as excellent)"
    - Update comment on line 10: change "(-5 to +5)" to "(0 to 5)"
  - Verify no other code references `RATING.BASELINE` or `RATING.BASELINE_LABEL`:
    - Run: `grep -r "RATING.BASELINE" src/` — should return only the constant definition (now removed). If any code references it, update that code.

  **Must NOT do**:
  - DO NOT change `CRITERION_WEIGHT` constants
  - DO NOT update the Zod schema directly (it auto-updates from RATING constants)
  - DO NOT add `scaleVersion` to `RatingInput` or `RatingUpdate` types — it's set by the service layer, not by callers

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, focused changes to 2 files (constants + types). No complex logic.
  - **Skills**: []
    - No special skills needed for constant/type updates.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 3, 4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/lib/constants.ts:29-39` — Current RATING constant definition with MIN: -5, MAX: 5, BASELINE: 0. Change MIN to 0, remove BASELINE and BASELINE_LABEL.
  - `src/lib/types/rating.ts:1-15` — Current Rating interface. Add `scaleVersion?: number` field after `updatedAt`. Update comments on lines 8 and 10.

  **API/Type References**:
  - `src/lib/types/rating.ts:17-23` — `RatingInput` and `RatingUpdate` derived types. `RatingInput` omits `id | overallScore | createdAt | updatedAt`. Since `scaleVersion` is NOT in the Omit list, it WILL appear in `RatingInput` — but we want it set only by the service. Make `scaleVersion` optional on `Rating` so it doesn't need to be provided in `RatingInput`. The Omit will pass through the optional field harmlessly since callers won't provide it (TypeScript allows omitting optional fields).

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: RATING constants are correctly updated
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -A6 "RATING = {" src/lib/constants.ts
      2. Assert: Output contains "MIN: 0"
      3. Assert: Output contains "MAX: 5"
      4. Assert: Output does NOT contain "BASELINE"
      5. Assert: Output does NOT contain "-5"
    Expected Result: Constants reflect new 0-5 scale with no BASELINE
    Evidence: grep output

  Scenario: Rating type has scaleVersion field
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep "scaleVersion" src/lib/types/rating.ts
      2. Assert: Output contains "scaleVersion?: number" (optional field)
    Expected Result: scaleVersion is an optional number field on Rating
    Evidence: grep output

  Scenario: No code references removed BASELINE constant
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -r "RATING.BASELINE" src/ --include="*.ts" --include="*.svelte"
      2. Assert: No matches found (exit code 1)
    Expected Result: No remaining references to BASELINE
    Evidence: grep output

  Scenario: TypeScript compiles without errors
    Tool: Bash
    Preconditions: Task 1 changes applied
    Steps:
      1. bun run check
      2. Assert: Exit code 0
    Expected Result: No type errors introduced
    Evidence: Command output
  ```

  **Commit**: YES
  - Message: `refactor(rating): update constants and types for 0-5 scale`
  - Files: `src/lib/constants.ts`, `src/lib/types/rating.ts`
  - Pre-commit: `bun run check`

---

- [x] 2. Service Layer — Normalization Function + Integration + Tests

  **What to do**:
  - Create `src/lib/services/normalize-rating-scores.ts`:
    - Export a single function `normalizeRatingScores` that takes a `Rating` and returns a `Rating` with normalized scores
    - Logic:
      - If `rating.scaleVersion === 2`, return the rating unchanged
      - Otherwise (missing or `1`), normalize:
        - `criteriaScores`: For each score, apply `Math.round((score + 5) / 2)` (maps -5→0, -3→1, -1→2, 0→3, 1→3, 3→4, 5→5). Use `Math.round` because slider/schema require integers.
        - `overallScore`: Apply `Math.round(((score + 5) / 2) * 10) / 10` (keep 1 decimal precision, same as `calculateOverallScore` rounding)
        - Set `scaleVersion: 2` on the returned object (so subsequent reads don't re-normalize in-memory)
    - Return a new object (don't mutate input)
  - Create `src/lib/services/__tests__/normalize-rating-scores.test.ts`:
    - Test cases:
      - `scaleVersion: 2` ratings pass through unchanged
      - Missing `scaleVersion` triggers normalization
      - `criteriaScores` mapping: -5→0, -3→1, -1→2, 0→3, 1→3, 3→4, 5→5
      - `overallScore` mapping: -5→0, 0→2.5, 5→5, -2.3→1.4
      - Empty `criteriaScores` record → empty record returned
      - All other Rating fields preserved unchanged (id, familyId, etc.)
  - Integrate into `src/lib/services/rating-service.ts`:
    - Import `normalizeRatingScores`
    - In `getRatingsForHouse`: Apply `normalizeRatingScores` to each rating in the returned array (map over results)
    - In `getRatingByUserAndHouse`: Apply `normalizeRatingScores` to the returned rating (if not null)
    - In `createOrUpdateRating`: Add `scaleVersion: 2` to the `ratingData` object (alongside `overallScore` and `updatedAt`)
    - Update comment on line 16: change "Scores range from -5 (poor) to +5 (excellent), with 0 as baseline/adequate" to "Scores range from 0 (poor) to 5 (excellent)"

  **Must NOT do**:
  - DO NOT modify `calculateOverallScore` logic — only update its comment
  - DO NOT add normalization to the write path — only reads
  - DO NOT add `scaleVersion` to the Zod form schema
  - DO NOT put normalization logic in components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core business logic change with test writing. Needs careful attention to edge cases and correct integration into existing service functions.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (solo — service layer must be done before UI changes)
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/services/rating-service.ts:17-34` — `calculateOverallScore` function showing the weighted average pattern. This function's LOGIC stays unchanged; only update its comment on line 16.
  - `src/lib/services/rating-service.ts:36-76` — `createOrUpdateRating` function. Add `scaleVersion: 2` to the `ratingData` object at line 53-57.
  - `src/lib/services/rating-service.ts:78-96` — `getRatingsForHouse` read path. Apply `normalizeRatingScores` to each item in the returned array.
  - `src/lib/services/rating-service.ts:98-128` — `getRatingByUserAndHouse` read path. Apply `normalizeRatingScores` to the returned rating.

  **Test References**:
  - `src/lib/schemas/house-form-schema.test.ts` — Existing test file showing Vitest `describe/it/expect` pattern used in this project. Follow this structure for the new test file.
  - `src/lib/services/__tests__/house-service-integration.test.ts` — Existing test in services `__tests__` directory. Place the new test at `src/lib/services/__tests__/normalize-rating-scores.test.ts`.

  **API/Type References**:
  - `src/lib/types/rating.ts:1-15` — `Rating` interface (after Task 1 updates, includes `scaleVersion?: number`). The normalization function takes and returns this type.

  **WHY Each Reference Matters**:
  - `rating-service.ts` is the ONLY place ratings are read from Firestore. Normalization here guarantees all consumers get normalized data without any component-level logic.
  - The existing test patterns show the project's assertion style and mock approach.
  - `calculateOverallScore` must NOT be modified (scale-agnostic) — only its comment. The normalization function handles the conversion separately.

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: Normalization function exists and exports correctly
    Tool: Bash
    Preconditions: File created
    Steps:
      1. test -f src/lib/services/normalize-rating-scores.ts
      2. Assert: File exists (exit code 0)
      3. grep "export function normalizeRatingScores" src/lib/services/normalize-rating-scores.ts
      4. Assert: Export found
    Expected Result: File exists with correct export
    Evidence: Command output

  Scenario: All normalization tests pass
    Tool: Bash
    Preconditions: Test file created
    Steps:
      1. bun run test:run -- src/lib/services/__tests__/normalize-rating-scores.test.ts
      2. Assert: Exit code 0
      3. Assert: Output shows all tests passing
    Expected Result: All normalization edge cases covered and passing
    Evidence: Test runner output

  Scenario: scaleVersion is written on new ratings
    Tool: Bash
    Preconditions: rating-service.ts updated
    Steps:
      1. grep "scaleVersion" src/lib/services/rating-service.ts
      2. Assert: Output contains "scaleVersion: 2"
    Expected Result: New ratings are tagged with version 2
    Evidence: grep output

  Scenario: Normalization applied to read paths
    Tool: Bash
    Preconditions: rating-service.ts updated
    Steps:
      1. grep "normalizeRatingScores" src/lib/services/rating-service.ts
      2. Assert: At least 2 matches (getRatingsForHouse + getRatingByUserAndHouse)
    Expected Result: Both read paths normalize ratings
    Evidence: grep output

  Scenario: TypeScript compiles and tests pass
    Tool: Bash
    Preconditions: All Task 2 changes applied
    Steps:
      1. bun run check
      2. Assert: Exit code 0
      3. bun run test:run
      4. Assert: Exit code 0
    Expected Result: No type errors, all tests green
    Evidence: Command output
  ```

  **Commit**: YES
  - Message: `feat(rating): add read-time normalization for 0-5 scale migration`
  - Files: `src/lib/services/normalize-rating-scores.ts`, `src/lib/services/__tests__/normalize-rating-scores.test.ts`, `src/lib/services/rating-service.ts`
  - Pre-commit: `bun run check && bun run test:run`

---

- [x] 3. Update Rate Page UI (Input Side)

  **What to do**:
  - Update `src/routes/houses/[id]/rate/+page.svelte`:
    - **Slider attributes** (line ~152-156): Change `min="-5"` to `min="0"` and `max="5"` stays as `"5"`
    - **Description text** (line ~122): Change "Rate each aspect from -5 (poor) to +5 (excellent), with 0 as baseline/adequate" to "Rate each aspect from 0 (poor) to 5 (excellent)"
    - **Slider labels** (lines ~159-169):
      - Change left label from `-5` to `0`
      - Change right label from `+5` to `5`
      - Remove the `+` prefix logic for positive scores. The current-score display should just show the number directly: `{criteriaScores[criterion.id] ?? 0}` (remove the `{#if > 0}` conditional that adds `+`)
    - **Default initialization** (line ~61): `criteriaScores[criterion.id] = 0` — this is already 0, which is correct (0 = Poor on new scale, forces kids to actively rate)
    - **No changes needed to `loadExistingRating`**: Old ratings arrive already normalized from the service layer (Task 2), so the slider just works with values in 0-5 range
  - Import `RATING` constant if not already imported, and use `RATING.MIN`/`RATING.MAX` for slider min/max attributes instead of hardcoded strings. This prevents future drift:
    - `min={RATING.MIN}` and `max={RATING.MAX}`
    - Left label: `{RATING.MIN}` 
    - Right label: `{RATING.MAX}`

  **Must NOT do**:
  - DO NOT add per-notch labels to the slider
  - DO NOT add normalization logic here (it's in the service layer)
  - DO NOT change form submission logic (it already works — service handles `scaleVersion`)
  - DO NOT modify the comments textarea or any non-rating UI

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward template changes — updating HTML attributes, text, and removing conditional display logic.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 4)
  - **Blocks**: Task 5
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/routes/houses/[id]/rate/+page.svelte:149-170` — Current slider implementation with `min="-5"`, `max="5"`, and the `+` prefix display logic in the slider-labels div. Change min to `"0"`, simplify score display.
  - `src/routes/houses/[id]/rate/+page.svelte:122` — Current description text mentioning "-5 (poor) to +5 (excellent)". Update wording.
  - `src/routes/houses/[id]/rate/+page.svelte:59-62` — Default score initialization. Already sets to 0 — no change needed, but verify it's correct for new semantics.

  **API/Type References**:
  - `src/lib/constants.ts:31-39` — RATING constants (after Task 1: MIN=0, MAX=5). Use these in the template instead of hardcoded values.

  **WHY Each Reference Matters**:
  - The slider hardcodes `-5` and `5` — these must change to match the new scale
  - The `+` prefix logic assumes negative numbers are possible — must be removed for a 0-5 only scale
  - Using constants instead of hardcoded values prevents future divergence

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: Slider uses 0-5 range
    Tool: Bash
    Preconditions: Rate page updated
    Steps:
      1. grep 'min=' src/routes/houses/\[id\]/rate/+page.svelte | head -1
      2. Assert: Contains min="0" or min={RATING.MIN}
      3. Assert: Does NOT contain min="-5"
    Expected Result: Slider minimum is 0, not -5
    Evidence: grep output

  Scenario: No +/- sign prefix logic in rate page
    Tool: Bash
    Preconditions: Rate page updated
    Steps:
      1. grep -c "'+'" src/routes/houses/\[id\]/rate/+page.svelte
      2. Assert: 0 matches (no plus prefix string)
    Expected Result: No conditional + sign for positive scores
    Evidence: grep output

  Scenario: Description text updated
    Tool: Bash
    Preconditions: Rate page updated
    Steps:
      1. grep "section-description" src/routes/houses/\[id\]/rate/+page.svelte
      2. Assert: Contains "0 (poor)" and "5 (excellent)"
      3. Assert: Does NOT contain "-5"
    Expected Result: Help text reflects new scale
    Evidence: grep output

  Scenario: Build succeeds
    Tool: Bash
    Preconditions: All Task 3 changes applied
    Steps:
      1. bun run build
      2. Assert: Exit code 0
    Expected Result: No build errors from template changes
    Evidence: Build output
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `feat(rating): update rate page UI for 0-5 scale`
  - Files: `src/routes/houses/[id]/rate/+page.svelte`
  - Pre-commit: `bun run build`

---

- [x] 4. Update Ratings Display (Output Side)

  **What to do**:
  - Update `src/routes/houses/[id]/components/ratings-card.svelte`:
    - **Remove `+` prefix on average score** (line ~48): Change `{averageScore > 0 ? '+' : ''}{averageScore}` to just `{averageScore}`
    - **Remove `+` prefix on individual scores** (line ~90): Change `{rating.overallScore > 0 ? '+' : ''}{rating.overallScore}` to just `{rating.overallScore}`
    - **Replace positive/negative class logic with gradient coloring**:
      - Average score badge (lines ~45-46): Replace `class:positive={averageScore > 0}` and `class:negative={averageScore < 0}` with three-tier gradient:
        - `class:score-low={averageScore < 2}` (0-1.9 = red)
        - `class:score-mid={averageScore >= 2 && averageScore < 4}` (2-3.9 = neutral)
        - `class:score-high={averageScore >= 4}` (4-5 = green)
      - Individual rating scores (lines ~87-88): Same three-tier pattern with `rating.overallScore`
    - **Update CSS classes** (lines ~191-197):
      - Remove `.score-badge.positive` and `.score-badge.negative` styles
      - Add `.score-badge.score-low .score-value { color: var(--color-error); }`
      - Add `.score-badge.score-mid .score-value { color: var(--color-text-primary); }` (default/neutral)
      - Add `.score-badge.score-high .score-value { color: var(--color-success); }`
      - Same for `.rating-score.score-low`, `.rating-score.score-mid`, `.rating-score.score-high`
    - **`/ {RATING.MAX}` display** (line ~49): Already uses `RATING.MAX` constant — auto-updates. No change needed.

  **Must NOT do**:
  - DO NOT add per-criterion score breakdown
  - DO NOT add tooltips explaining scale migration
  - DO NOT modify the `averageScore` computation (it's in `+page.svelte` and works correctly since ratings arrive normalized)
  - DO NOT change the ratings list layout or user avatar display

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward template and CSS changes — updating class conditionals and replacing styles.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 3)
  - **Blocks**: Task 5
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/routes/houses/[id]/components/ratings-card.svelte:42-54` — Current average score badge with `class:positive` and `class:negative` and `+` prefix. Replace with gradient classes and remove prefix.
  - `src/routes/houses/[id]/components/ratings-card.svelte:85-91` — Current individual rating score with same positive/negative pattern. Same changes.
  - `src/routes/houses/[id]/components/ratings-card.svelte:191-197` — CSS for `.score-badge.positive` and `.score-badge.negative`. Replace with `.score-low`, `.score-mid`, `.score-high` classes.
  - `src/routes/houses/[id]/components/ratings-card.svelte:263-269` — CSS for `.rating-score.positive` and `.rating-score.negative`. Same replacement pattern.

  **WHY Each Reference Matters**:
  - The positive/negative class logic assumes 0 is neutral — with 0-5 scale, 0 is the minimum (poor), so the old logic is wrong
  - The `+` prefix adds nothing for a 0-5 scale (no negative numbers)
  - Color gradient provides better UX for an all-positive scale

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: No positive/negative class logic remains
    Tool: Bash
    Preconditions: ratings-card updated
    Steps:
      1. grep -c "class:positive\|class:negative" src/routes/houses/\[id\]/components/ratings-card.svelte
      2. Assert: 0 matches
    Expected Result: Old positive/negative classes removed
    Evidence: grep output

  Scenario: Gradient classes exist
    Tool: Bash
    Preconditions: ratings-card updated
    Steps:
      1. grep -c "score-low\|score-mid\|score-high" src/routes/houses/\[id\]/components/ratings-card.svelte
      2. Assert: At least 6 matches (3 template + 3 CSS minimum)
    Expected Result: New gradient classes applied in template and CSS
    Evidence: grep output

  Scenario: No + sign prefix in display
    Tool: Bash
    Preconditions: ratings-card updated
    Steps:
      1. grep "? '+'" src/routes/houses/\[id\]/components/ratings-card.svelte
      2. Assert: No matches (exit code 1)
    Expected Result: No conditional + sign formatting
    Evidence: grep output

  Scenario: Build succeeds
    Tool: Bash
    Preconditions: All Task 4 changes applied
    Steps:
      1. bun run build
      2. Assert: Exit code 0
    Expected Result: No build errors from template/CSS changes
    Evidence: Build output
  ```

  **Commit**: YES (groups with Task 3)
  - Message: `feat(rating): update rating display with gradient colors for 0-5 scale`
  - Files: `src/routes/houses/[id]/components/ratings-card.svelte`
  - Pre-commit: `bun run build`

---

- [x] 5. Final Verification

  **What to do**:
  - Run full verification suite:
    - `bun run check` — TypeScript type checking
    - `bun run test:run` — All tests including new normalization tests
    - `bun run build` — Full production build
  - Verify end-to-end consistency:
    - Confirm RATING constants are correct
    - Confirm `scaleVersion: 2` is written on creates
    - Confirm normalization is applied on both read paths
    - Confirm no remaining references to old -5/+5 scale in UI
    - Confirm no remaining `BASELINE` references

  **Must NOT do**:
  - DO NOT make code changes in this task — only verify
  - DO NOT deploy to Firebase — this is local verification only

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Run commands and verify output — no code changes.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, solo)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 3, 4

  **References**:

  **Documentation References**:
  - `AGENTS.md` — Commands section lists `bun run check`, `bun run build`, `bun run test:run`

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios (MANDATORY):**

  ```
  Scenario: Full build passes
    Tool: Bash
    Preconditions: All previous tasks completed
    Steps:
      1. bun run check
      2. Assert: Exit code 0
      3. bun run test:run
      4. Assert: Exit code 0
      5. bun run build
      6. Assert: Exit code 0
    Expected Result: Full verification suite passes
    Evidence: Command outputs

  Scenario: No old scale references remain in UI
    Tool: Bash
    Preconditions: All changes applied
    Steps:
      1. grep -rn "\-5" src/routes/ --include="*.svelte" | grep -v "node_modules" | grep -v ".svelte-kit"
      2. Assert: No matches related to rating scale (may have other -5 references like CSS — those are OK)
      3. grep -rn "BASELINE" src/ --include="*.ts" --include="*.svelte" | grep -v "node_modules"
      4. Assert: No matches
    Expected Result: Clean separation from old scale
    Evidence: grep outputs

  Scenario: Verify scaleVersion integration
    Tool: Bash
    Preconditions: All changes applied
    Steps:
      1. grep -rn "scaleVersion" src/ --include="*.ts" --include="*.svelte"
      2. Assert: Found in rating.ts (type definition), normalize-rating-scores.ts (normalization check), rating-service.ts (write + import)
      3. Assert: NOT found in any Svelte components or schema files
    Expected Result: scaleVersion is service-layer only
    Evidence: grep output
  ```

  **Commit**: NO (verification only — no code changes)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `refactor(rating): update constants and types for 0-5 scale` | constants.ts, rating.ts | `bun run check` |
| 2 | `feat(rating): add read-time normalization for 0-5 scale migration` | normalize-rating-scores.ts, normalize-rating-scores.test.ts, rating-service.ts | `bun run check && bun run test:run` |
| 3 | `feat(rating): update rate page UI for 0-5 scale` | rate/+page.svelte | `bun run build` |
| 4 | `feat(rating): update rating display with gradient colors for 0-5 scale` | ratings-card.svelte | `bun run build` |

---

## Success Criteria

### Verification Commands
```bash
bun run check      # Expected: exit code 0
bun run test:run   # Expected: exit code 0, all tests pass
bun run build      # Expected: exit code 0
```

### Final Checklist
- [x] All "Must Have" present:
  - [x] RATING.MIN is 0, RATING.MAX is 5
  - [x] scaleVersion field on Rating type
  - [x] normalizeRatingScores function with tests
  - [x] Normalization on both read paths
  - [x] scaleVersion: 2 on writes
  - [x] Slider range 0-5
  - [x] Gradient color display
- [x] All "Must NOT Have" absent:
  - [x] No data migration script
  - [x] No Firestore rules changes
  - [x] No normalization in components
  - [x] No scaleVersion in Zod schema
  - [x] No +/- sign display logic
  - [x] No BASELINE constant references
- [x] All tests pass
- [x] Build succeeds
