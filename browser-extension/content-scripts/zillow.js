/**
 * Zillow Property Data Extractor
 * Extracts property information from Zillow listing pages
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
 * Example: "123 Main St, San Francisco, CA 94102"
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
 * Find text in all elements using pattern matching
 * @param {RegExp} pattern - Pattern to match
 * @returns {string|null} - Matched text or null
 */
function findTextByPattern(pattern) {
  const allElements = Array.from(document.querySelectorAll("*"));
  for (const element of allElements) {
    if (element.children.length === 0) {
      const text = element.textContent.trim();
      if (pattern.test(text)) {
        return text;
      }
    }
  }
  return null;
}

/**
 * Find all text matches in elements and return the largest number
 * Useful when multiple elements contain the same type of data
 * @param {RegExp} pattern - Pattern to match
 * @param {RegExp} extractPattern - Pattern to extract the number
 * @returns {number|null} - Largest number found or null
 */
function findLargestNumber(pattern, extractPattern) {
  const allElements = Array.from(document.querySelectorAll("*"));
  let largestNum = null;

  for (const element of allElements) {
    if (element.children.length === 0) {
      const text = element.textContent.trim();
      if (pattern.test(text)) {
        const match = text.match(extractPattern);
        if (match) {
          const num = Number.parseInt(match[1].replace(/,/g, ""), 10);
          if (largestNum === null || num > largestNum) {
            largestNum = num;
          }
        }
      }
    }
  }
  return largestNum;
}

/**
 * Extract property data from Zillow listing page
 * @returns {Object} - Extracted property data
 */
function extractZillowData() {
  try {
    // Extract full address from h1 tag
    const fullAddress = extractText("h1");
    const addressParts = parseAddress(fullAddress);

    // Extract price using data-testid
    const price = extractNumber('[data-testid="price"]');

    // Extract bedrooms - look for "Bedrooms: X" pattern
    let bedrooms = null;
    const bedroomsText = findTextByPattern(/^Bedrooms?:\s*\d+$/i);
    if (bedroomsText) {
      const match = bedroomsText.match(/\d+/);
      if (match) bedrooms = Number.parseInt(match[0], 10);
    }

    // Extract bathrooms - look for "Bathrooms: X" pattern
    let bathrooms = null;
    const bathroomsText = findTextByPattern(/^Bathrooms?:\s*\d+\.?\d*$/i);
    if (bathroomsText) {
      const match = bathroomsText.match(/\d+\.?\d*/);
      if (match) bathrooms = Number.parseFloat(match[0]);
    }

    // Extract square feet - find the largest sqft value on the page
    // (handles cases where multiple elements show square footage)
    const squareFeet = findLargestNumber(
      /\d{1,3}(?:,\d{3})*\s*sqft/i,
      /(\d{1,3}(?:,\d{3})*)\s*sqft/i,
    );

    // Extract lot size - look for "Lot:" or "Lot size:" followed by value
    let lotSize = null;
    const lotText = findTextByPattern(/^Lot(\s+size)?:\s*[\d,]+/i);
    if (lotText) {
      const match = lotText.match(/\d{1,3}(,\d{3})*/);
      if (match) lotSize = Number.parseInt(match[0].replace(/,/g, ""), 10);
    }

    // Extract year built - look for "Built in" or "Year built:" followed by year
    let yearBuilt = null;
    const yearText = findTextByPattern(/Built\s+in|Year\s+built/i);
    if (yearText) {
      const match = yearText.match(/\b(19|20)\d{2}\b/);
      if (match) yearBuilt = Number.parseInt(match[0], 10);
    }

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
    console.error("Error extracting Zillow data:", error);
    return null;
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    const data = extractZillowData();
    sendResponse(data);
  }
  return true; // Keep message channel open for async response
});
