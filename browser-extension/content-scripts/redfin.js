/**
 * Redfin Property Data Extractor
 * Extracts property information from Redfin listing pages
 */

/**
 * Helper function to extract text content from an element
 * @param {string} selector - CSS selector
 * @returns {string|null} - Extracted text or null
 */
function extractText(selector) {
  const element = document.querySelector(selector);
  return element ? element.textContent.trim() : null;
}

/**
 * Helper function to extract numeric value from text
 * @param {string} selector - CSS selector
 * @returns {number|null} - Extracted number or null
 */
function extractNumber(selector) {
  const text = extractText(selector);
  if (!text) return null;

  // Remove non-numeric characters except dots and commas
  const cleaned = text.replace(/[^0-9.,]/g, "");
  const num = cleaned.replace(/,/g, "");

  return num ? Number.parseFloat(num) : null;
}

/**
 * Parse full address into components (street, city, state, ZIP)
 * @param {string} fullAddress - Complete address string
 * @returns {Object} - Parsed address components
 */
function parseAddress(fullAddress) {
  if (!fullAddress) {
    return { address: null, city: null, state: null, zipCode: null };
  }

  // Try to match: street address, city, state ZIP
  const match = fullAddress.match(
    /^([^,]+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/,
  );

  if (match) {
    return {
      address: match[1].trim(),
      city: match[2].trim(),
      state: match[3].trim(),
      zipCode: match[4].trim(),
    };
  }

  // Fallback: return the full address as street address
  return {
    address: fullAddress,
    city: null,
    state: null,
    zipCode: null,
  };
}

/**
 * Extract property data from Redfin listing page
 * @returns {Object} - Extracted property data
 */
function extractRedfinData() {
  try {
    // Extract full address
    const fullAddress =
      extractText(".street-address") ||
      extractText('[class*="address"]') ||
      extractText('h1[class*="full-address"]') ||
      null;

    const addressParts = parseAddress(fullAddress);

    // Extract price - Redfin typically shows price prominently
    const price =
      extractNumber(".statsValue") ||
      extractNumber('[data-rf-test-id="abp-price"] .statsValue') ||
      extractNumber(".price-section .statsValue") ||
      null;

    // Extract bedrooms
    const bedrooms =
      extractNumber(".beds .statsValue") ||
      extractNumber('[data-rf-test-id="abp-beds"] .statsValue') ||
      null;

    // Extract bathrooms
    const bathrooms =
      extractNumber(".baths .statsValue") ||
      extractNumber('[data-rf-test-id="abp-baths"] .statsValue') ||
      null;

    // Extract square feet
    const squareFeet =
      extractNumber('[data-rf-test-id="abp-sqFt"] .statsValue') ||
      extractNumber(".sqft .statsValue") ||
      null;

    // Extract lot size
    const lotSize =
      extractNumber('[data-rf-test-id="abp-lotSize"] .statsValue') ||
      extractNumber(".lot-size .statsValue") ||
      null;

    // Extract year built
    const yearBuilt =
      extractNumber('[data-rf-test-id="abp-yearBuilt"] .statsValue') ||
      extractNumber(".year-built .statsValue") ||
      null;

    return {
      address: addressParts.address,
      city: addressParts.city,
      state: addressParts.state,
      zipCode: addressParts.zipCode,
      price: price,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      squareFeet: squareFeet,
      lotSize: lotSize,
      yearBuilt: yearBuilt,
      listingUrl: window.location.href,
    };
  } catch (error) {
    console.error("Error extracting Redfin data:", error);
    return null;
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    const data = extractRedfinData();
    sendResponse(data);
  }
  return true; // Keep message channel open for async response
});
