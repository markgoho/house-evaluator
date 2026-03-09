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
 * Check if an image should be skipped (not the main listing photo)
 * @param {HTMLImageElement} img - The image element to check
 * @returns {boolean} - True if this image should be skipped
 */
function shouldSkipImage(img) {
  if (!img) return true;

  // Check if URL is from Google Maps/Street View
  const src = img.src || '';
  if (src.includes('google.com/maps') || src.includes('googleapis.com/maps') || src.includes('gstatic.com')) {
    return true;
  }

  // Check alt text for unwanted indicators
  const alt = (img.alt || '').toLowerCase();
  if (alt.includes('street view') || alt.includes('google') || alt.includes('agent')) {
    return true;
  }

  // CRITICAL: Check if image is in a recommendation section
  // Walk up the DOM tree checking for these sections
  let parent = img.parentElement;
  for (let i = 0; i < 15 && parent; i++) {
    const className = (parent.className || '').toLowerCase();
    const ariaLabel = (parent.getAttribute('aria-label') || '').toLowerCase();
    const textContent = (parent.textContent || '').toLowerCase();

    // Skip if in ANY recommendation/suggestion section
    if (
      className.includes('nearby') ||
      className.includes('similar') ||
      className.includes('recommend') ||
      className.includes('homes-for-you') ||
      className.includes('homesforyou') ||
      ariaLabel.includes('nearby') ||
      ariaLabel.includes('similar') ||
      ariaLabel.includes('homes for you') ||
      ariaLabel.includes('recommended') ||
      textContent.includes('nearby homes') ||
      textContent.includes('similar homes') ||
      textContent.includes('homes for you')
    ) {
      return true;
    }

    // Skip if in street view or map sections
    if (className.includes('street') || className.includes('map')) {
      return true;
    }

    parent = parent.parentElement;
  }

  // Skip very small images (likely icons)
  if (img.width > 0 && img.width < 100) {
    return true;
  }
  if (img.height > 0 && img.height < 100) {
    return true;
  }

  return false;
}

/**
 * Extract main property image URL from the page
 * @returns {string|null} - Image URL or null
 */
function extractImageUrl() {
  // New strategy: Look specifically for Zillow featured photo URLs
  // Pattern: photos.zillowstatic.com/fp/HASH-cc_ft_DIMENSIONS.webp
  // The /fp/ path indicates "featured photo" (the main listing images)

  const allImages = Array.from(document.querySelectorAll('img'));
  const featuredPhotos = [];

  for (const img of allImages) {
    const src = img.src || '';
    const srcset = img.srcset || '';

    // Check src for featured photo pattern
    if (src.includes('photos.zillowstatic.com/fp/') || src.includes('zillowstatic.com/fp/')) {
      // Extract dimensions from URL (e.g., cc_ft_1536.webp -> 1536)
      const match = src.match(/cc_ft_(\d+)/);
      const size = match ? parseInt(match[1]) : 0;
      featuredPhotos.push({ url: src, size });
    }

    // Check srcset for featured photos
    if (srcset.includes('photos.zillowstatic.com/fp/') || srcset.includes('zillowstatic.com/fp/')) {
      const sources = srcset.split(',').map(s => {
        const parts = s.trim().split(' ');
        const url = parts[0];
        const widthMatch = url.match(/cc_ft_(\d+)/);
        const size = widthMatch ? parseInt(widthMatch[1]) : 0;
        return { url, size };
      });
      featuredPhotos.push(...sources.filter(s => s.url.includes('/fp/')));
    }
  }

  // Return the largest featured photo found
  if (featuredPhotos.length > 0) {
    const largest = featuredPhotos.reduce((max, curr) =>
      curr.size > max.size ? curr : max
    );
    return largest.url;
  }

  // Fallback to old method if no featured photos found
  return null;
}

/**
 * Get the best quality image URL (prefer srcset if available)
 * @param {HTMLImageElement} img - The image element
 * @returns {string} - The best image URL
 */
function getBestImageUrl(img) {
  const srcset = img.srcset;
  if (srcset) {
    // Parse srcset and get the largest image
    const sources = srcset.split(',').map(s => {
      const parts = s.trim().split(' ');
      const url = parts[0];
      const width = parts[1] ? parseInt(parts[1]) : 0;
      return { url, width };
    });
    const largest = sources.reduce((max, curr) =>
      curr.width > max.width ? curr : max
    );
    return largest.url;
  }
  return img.src;
}

/**
 * Extract structured property data from Zillow's SSR JSON payload
 * Falls back gracefully if the JSON structure isn't found
 * @returns {Object|null} - Extracted SSR data or null
 */
function extractFromSSRPayload() {
  try {
    const scripts = document.querySelectorAll('script[type="application/json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        if (data.props && data.props.pageProps && data.props.pageProps.componentProps) {
          const cache = JSON.parse(data.props.pageProps.componentProps.gdpClientCache);
          const keys = Object.keys(cache);
          for (const key of keys) {
            if (key.includes('Priority')) {
              const property = cache[key].property;
              if (property) {
                return {
                  zestimate: typeof property.zestimate === 'number' ? property.zestimate : null,
                  lastSoldPrice: typeof property.lastSoldPrice === 'number' ? property.lastSoldPrice : null,
                  lastSoldDate: typeof property.dateSoldString === 'string' ? property.dateSoldString : null,
                };
              }
            }
          }
        }
      } catch (_parseError) {
        // Skip scripts that don't match expected structure
      }
    }
  } catch (_outerError) {
    console.warn("Could not extract SSR payload data");
  }
  return null;
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

    // Extract tax assessed value — look for "Tax assessed value: $XXX,XXX"
    let taxAssessedValue = null;
    const taxAssessedText = findTextByPattern(/Tax\s+assessed\s+value/i);
    if (taxAssessedText) {
      const taxMatch = taxAssessedText.match(/\$\s*([\d,]+)/);
      if (taxMatch) {
        taxAssessedValue = Number.parseInt(taxMatch[1].replace(/,/g, ""), 10);
      }
    }

    // Extract reference data from SSR JSON payload
    const ssrData = extractFromSSRPayload();

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
      imageUrl: extractImageUrl(),
      taxAssessedValue: taxAssessedValue,
      zestimate: ssrData ? ssrData.zestimate : null,
      lastSoldPrice: ssrData ? ssrData.lastSoldPrice : null,
      lastSoldDate: ssrData ? ssrData.lastSoldDate : null,
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
