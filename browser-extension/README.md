# House Evaluator Browser Extension

Automatically extract property data from real estate listing sites and auto-fill the House Evaluator app. Reduce data entry time from 2 minutes to 5 seconds per house!

## Features

- Extract property data from Zillow, Redfin, and Realtor.com
- One-click transfer to House Evaluator app
- Automatic parsing of:
  - Address (street, city, state, ZIP)
  - Price
  - Bedrooms
  - Bathrooms
  - Square footage
  - Lot size
  - Year built
  - Listing URL (automatically captured)

## Installation

### Chrome

1. **Generate Icons** (first time only):
   - Open `icons/icon-generator.html` in your browser
   - Download all three icon sizes and save them to the `icons/` folder
   - Or follow instructions in `icons/README.md` for alternative options

2. **Load Extension**:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `browser-extension/` folder
   - The extension icon should appear in your toolbar

### Firefox

1. **Generate Icons** (same as Chrome step 1 above)

2. **Load Extension**:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Navigate to the `browser-extension/` folder
   - Select the `manifest.json` file
   - The extension will be loaded (note: temporary add-ons are removed when Firefox closes)

## Usage

### Step 1: Browse Listings

Navigate to a property listing page on one of these supported sites:

- **Zillow**: `https://www.zillow.com/homedetails/...`
- **Redfin**: `https://www.redfin.com/...`
- **Realtor.com**: `https://www.realtor.com/...`

Make sure you're on an individual property page, not search results.

### Step 2: Extract Data

1. Click the House Evaluator extension icon in your browser toolbar
2. The popup will show "Extracting property data..."
3. Review the extracted data in the popup

### Step 3: Open in House Evaluator

1. Click the "Open in House Evaluator" button
2. A new tab will open with the House Evaluator app
3. The form will be pre-filled with all extracted data
4. Review the data for accuracy
5. Add any additional notes or photos
6. Click "Add House" to save

### Step 4: Rate the House

After the house is created, you'll be redirected to the house details page where you and your family can rate it.

## Supported Sites

### Zillow.com

- Fully supported for sale and rent listings
- Extracts all standard property fields
- Works with most listing types

### Redfin.com

- Fully supported for sale and rent listings
- Extracts all standard property fields
- Works with most listing types

### Realtor.com

- Fully supported for sale and rent listings
- Extracts all standard property fields
- Works with most listing types

## Configuration

### Changing the Base URL

By default, the extension opens `http://localhost:5173/houses/new` (development mode).

To use the production app instead:

1. Open `popup/popup.js`
2. Change the `BASE_URL` constant:
   ```javascript
   const BASE_URL = "https://house-eval.web.app/houses/new";
   ```
3. Reload the extension in your browser

## Troubleshooting

### "Could not extract data from this page"

**Possible causes:**

- You're on a search results page, not an individual listing
- The listing has incomplete information
- The site has changed its layout (extractors may need updating)

**Solutions:**

- Make sure you're on a property details page (not search results)
- Try refreshing the page and clicking the extension icon again
- Check the browser console for error messages (F12 → Console tab)

### "This site is not yet supported"

The extension only works on Zillow, Redfin, and Realtor.com. Other real estate sites are not currently supported.

### Extension icon not appearing

**Chrome:**

- Check that the extension is enabled in `chrome://extensions`
- Try reloading the extension
- Make sure all required files are present (manifest.json, icons, etc.)

**Firefox:**

- Temporary add-ons are removed when Firefox closes
- Reload the extension from `about:debugging`

### Form fields not pre-filling

1. **Check the URL**: Make sure House Evaluator app is running at `http://localhost:5173`
2. **Check browser console**: Open DevTools (F12) and check for JavaScript errors
3. **Verify URL parameters**: The opened URL should have query parameters like `?address=...&city=...`

### Missing or incorrect data

Some listings may have incomplete information. The extension extracts what's available:

- Missing fields will be left blank in House Evaluator
- Fill them in manually before submitting
- Some sites format data differently (e.g., "2.5 ba" vs "2.5 Baths")

## Development

### File Structure

```
browser-extension/
├── manifest.json           # Extension configuration
├── README.md              # This file
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic and URL generation
├── content-scripts/
│   ├── zillow.js          # Zillow data extractor
│   ├── redfin.js          # Redfin data extractor
│   └── realtor.js         # Realtor.com data extractor
└── icons/
    ├── icon16.png         # 16x16 toolbar icon
    ├── icon48.png         # 48x48 extension page icon
    ├── icon128.png        # 128x128 web store icon
    ├── icon-generator.html # Tool to generate icons
    └── README.md          # Icon instructions
```

### How It Works

1. **Content Scripts**: Injected into supported real estate sites
   - Parse the DOM to extract property data
   - Use site-specific CSS selectors
   - Listen for messages from the popup

2. **Popup**: User interface shown when clicking extension icon
   - Detects if current site is supported
   - Sends extraction request to content script
   - Displays extracted data
   - Builds URL with query parameters
   - Opens House Evaluator in new tab

3. **House Evaluator Integration**: URL parameters pre-fill form
   - App parses query parameters on page load
   - Validates and sanitizes input
   - Populates form fields via Svelte reactivity

### Updating Extractors

If a real estate site changes its layout:

1. Open the site's listing page
2. Right-click → Inspect Element
3. Find the new selectors for each data field
4. Update the corresponding content script (`zillow.js`, `redfin.js`, or `realtor.js`)
5. Reload the extension in your browser
6. Test the extraction

### Adding New Sites

To add support for a new real estate site:

1. Create a new content script in `content-scripts/` (e.g., `trulia.js`)
2. Implement extraction logic following existing patterns
3. Add the new site to `manifest.json`:
   ```json
   {
     "matches": ["*://*.trulia.com/*"],
     "js": ["content-scripts/trulia.js"]
   }
   ```
4. Add host permissions:
   ```json
   "host_permissions": [
     "*://*.trulia.com/*"
   ]
   ```
5. Update `popup.js` to recognize the new site in `isSupportedSite()`
6. Test thoroughly

## Privacy & Permissions

The extension requires minimal permissions:

- **activeTab**: Access the current tab to extract listing data
- **scripting**: Inject content scripts into supported sites
- **host_permissions**: Access Zillow, Redfin, and Realtor.com pages

**Data handling:**

- All data extraction happens locally in your browser
- No data is sent to external servers
- Data is only transferred to your local House Evaluator app via URL parameters
- No tracking or analytics

## Known Limitations

1. **Site Layout Changes**: Real estate sites frequently update their designs. Extractors may need periodic updates.
2. **Incomplete Listings**: Some listings don't include all fields (especially lot size and year built).
3. **Temporary Firefox Installation**: Firefox requires reloading the extension each session.
4. **Manual Testing Required**: The extension must be tested on actual listing pages after installation.
5. **No Automatic Updates**: As an unpacked extension, updates must be manually applied.

## Roadmap / Future Enhancements

Potential improvements for future versions:

- [ ] **Options Page**: Configure base URL without editing code
- [ ] **More Sites**: Add Trulia, Homes.com, etc.
- [ ] **Keyboard Shortcut**: Trigger extraction with Alt+H
- [ ] **Auto-Extract Mode**: Automatically extract on page load (optional)
- [ ] **Data Validation**: Warn if extracted data looks suspicious
- [ ] **Photo Extraction**: Copy listing photos to clipboard
- [ ] **Chrome Web Store**: Publish for easy installation
- [ ] **Auto-Update Extractors**: Fetch extractor rules from remote config
- [ ] **Export to CSV**: Bulk export extracted listings
- [ ] **Comparison Mode**: Extract and compare multiple properties

## Testing Checklist

Before considering the extension production-ready:

### Chrome Testing

- [ ] Load extension in Chrome
- [ ] Test on Zillow listing
- [ ] Test on Redfin listing
- [ ] Test on Realtor.com listing
- [ ] Verify form pre-fills correctly
- [ ] Submit form and verify house creation
- [ ] Test with missing data (e.g., no lot size)
- [ ] Test error handling (non-listing pages)

### Firefox Testing

- [ ] Load extension in Firefox
- [ ] Repeat all Chrome tests above

### Edge Cases

- [ ] Listing with special characters in address
- [ ] Listing with no price (e.g., "Contact for price")
- [ ] Listing with incomplete data
- [ ] Very long addresses or notes
- [ ] Non-standard formats (e.g., "Studio" instead of "0 beds")

## Contributing

To contribute improvements:

1. Test your changes on multiple listing pages
2. Update this README if adding new features
3. Ensure backward compatibility
4. Document any new configuration options

## License

This extension is part of the House Evaluator project and follows the same license.

## Support

For issues or questions:

1. Check the Troubleshooting section above
2. Review browser console for errors (F12 → Console)
3. Verify you're on a supported listing page
4. Test with a different listing to isolate the issue

---

**Built for House Evaluator** - Making house hunting easier, one click at a time! 🏠
