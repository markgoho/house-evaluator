# BROWSER EXTENSION — Chrome MV3 Listing Scraper

Scrapes property data from real estate sites and opens `/houses/new` with URL params to prefill the form.

## ARCHITECTURE

```
popup/popup.js          # Entry point: detects site, sends extractData message, builds URL
content-scripts/
  zillow.js             # DOM scraper for Zillow (most complex — image extraction)
  redfin.js             # DOM scraper for Redfin
  realtor.js            # DOM scraper for Realtor.com
```

**Flow**: User clicks extension icon → `popup.js` sends `{ action: "extractData" }` message to content script → content script scrapes DOM → returns data object → popup builds URL params → opens `BASE_URL?address=...&city=...` in new tab.

## RUNTIME

- Plain JavaScript — no build step, no TypeScript, no bundler
- Chrome MV3 (`manifest_version: 3`)
- Permissions: `activeTab`, `scripting` (for manual injection fallback)
- Content scripts auto-injected on `zillow.com`, `redfin.com`, `realtor.com`

## CONTENT SCRIPT PATTERN

All three extractors share the same structure:

1. Helper functions: `extractText(selector)`, `extractNumber(selector)`, `parseAddress(fullAddress)`
2. Main `extract{Site}Data()` function — returns `{ address, city, state, zipCode, price, bedrooms, bathrooms, squareFeet, lotSize, yearBuilt, listingUrl, imageUrl? }`
3. Message listener: `chrome.runtime.onMessage.addListener` responding to `"extractData"`

**Helpers are duplicated** across all three files (no shared module — MV3 content scripts are isolated).

## ZILLOW-SPECIFIC COMPLEXITY

### Image Extraction (`shouldSkipImage` + `extractImageUrl`)

Zillow's image extraction is non-trivial due to recommendation sections. The `shouldSkipImage()` function walks up 15 parent elements checking for:
- Google Maps/Street View URLs
- Classes/aria-labels containing: `nearby`, `similar`, `recommend`, `homes-for-you`
- Text content containing: `nearby homes`, `similar homes`, `homes for you`
- Images < 100px (icons)

`extractImageUrl()` targets Zillow's featured photo URL pattern: `photos.zillowstatic.com/fp/HASH-cc_ft_DIMENSIONS.webp`. Selects the largest dimension available.

### Data Extraction

Uses pattern matching (`findTextByPattern`, `findLargestNumber`) instead of CSS selectors for bedrooms, bathrooms, sqft. This is more resilient to Zillow's frequent DOM restructuring.

## POPUP (`popup.js`)

- `BASE_URL` constant: currently `https://house-eval.web.app/houses/new` (production). Change to `http://localhost:5173/houses/new` for dev.
- `isSupportedSite(url)`: checks for zillow/redfin/realtor in URL
- Fallback injection: if content script isn't loaded (tab opened before extension installed), `tryInjectContentScript()` uses `chrome.scripting.executeScript` to inject manually

## ADDING A NEW SITE

1. Create `content-scripts/{site}.js` following existing pattern
2. Add `matches` entry in `manifest.json` under `content_scripts`
3. Add `host_permissions` entry in `manifest.json`
4. Add site detection in `popup.js` `isSupportedSite()` and `tryInjectContentScript()`
5. **Bump version in `manifest.json`**

## VERSION MANAGEMENT

**ALWAYS bump `manifest.json` version** on any extension change. Follow semver:

| Bump | When | Example |
|------|------|---------|
| **Patch** (1.1.X) | Bug fixes, selector updates, error handling tweaks | `1.1.5` → `1.1.6` |
| **Minor** (1.X.0) | New features, new site support, image extraction | `1.1.6` → `1.2.0` |
| **Major** (X.0.0) | Breaking changes, data format changes | `1.2.0` → `2.0.0` |

Why: Chrome Web Store requires version bumps for updates. Users can identify their version for debugging.

## CRITICAL RULES

- Extractors use `null` (not `undefined`) for missing values — this is intentional for `chrome.runtime.sendMessage` serialization
- `return true` in message listener keeps the async channel open — do not remove
- Redfin/Realtor extractors do NOT extract images (only Zillow does)
