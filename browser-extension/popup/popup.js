/**
 * House Evaluator Helper - Popup Script
 * Handles the extension popup UI and communication with content scripts
 */

const BASE_URL = 'http://localhost:5173/houses/new';

// Format field names for display
const FIELD_LABELS = {
  address: 'Street Address',
  city: 'City',
  state: 'State',
  zipCode: 'ZIP Code',
  price: 'Price',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  squareFeet: 'Square Feet',
  lotSize: 'Lot Size',
  yearBuilt: 'Year Built',
  listingUrl: 'Listing URL'
};

/**
 * Format value for display
 * @param {string} key - Field key
 * @param {any} value - Field value
 * @returns {string} - Formatted value
 */
function formatValue(key, value) {
  if (value === null || value === undefined) return null;

  switch (key) {
    case 'price':
      return `$${value.toLocaleString()}`;
    case 'squareFeet':
    case 'lotSize':
      return `${value.toLocaleString()} sq ft`;
    case 'bathrooms':
      return value % 1 === 0 ? value.toString() : value.toFixed(1);
    case 'listingUrl':
      // Truncate long URLs
      return value.length > 50 ? value.substring(0, 47) + '...' : value;
    default:
      return value.toString();
  }
}

/**
 * Show the loading state
 */
function showLoading() {
  hideAllSections();
  document.getElementById('loading').classList.remove('hidden');
}

/**
 * Show extracted data section
 * @param {Object} data - Extracted property data
 */
function showExtractedData(data) {
  hideAllSections();

  const container = document.getElementById('extracted-data');
  container.classList.remove('hidden');

  const dataList = document.getElementById('data-list');
  dataList.innerHTML = '';

  // Display extracted fields
  let hasData = false;
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      hasData = true;
      const li = document.createElement('li');

      const label = document.createElement('span');
      label.className = 'field-label';
      label.textContent = FIELD_LABELS[key] || key;

      const valueSpan = document.createElement('span');
      valueSpan.className = 'field-value';
      valueSpan.textContent = formatValue(key, value);

      li.appendChild(label);
      li.appendChild(valueSpan);
      dataList.appendChild(li);
    }
  }

  if (!hasData) {
    showError();
    return;
  }

  // Set up button to open House Evaluator
  document.getElementById('open-app').addEventListener('click', () => {
    const params = new URLSearchParams();

    // Add all non-null fields to URL params
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    }

    const url = `${BASE_URL}?${params.toString()}`;
    chrome.tabs.create({ url });
  });
}

/**
 * Show error state
 */
function showError() {
  hideAllSections();
  document.getElementById('error').classList.remove('hidden');
}

/**
 * Show unsupported site message
 */
function showUnsupported() {
  hideAllSections();
  document.getElementById('unsupported').classList.remove('hidden');
}

/**
 * Hide all sections
 */
function hideAllSections() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('extracted-data').classList.add('hidden');
  document.getElementById('error').classList.add('hidden');
  document.getElementById('unsupported').classList.add('hidden');
}

/**
 * Check if current tab is on a supported site
 * @param {string} url - Tab URL
 * @returns {boolean} - True if supported
 */
function isSupportedSite(url) {
  return (
    url.includes('zillow.com') ||
    url.includes('redfin.com') ||
    url.includes('realtor.com')
  );
}

/**
 * Main initialization function
 */
async function init() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      showError();
      return;
    }

    // Check if on supported site
    if (!isSupportedSite(tab.url)) {
      showUnsupported();
      return;
    }

    // Show loading
    showLoading();

    // Request data extraction from content script
    chrome.tabs.sendMessage(tab.id, { action: 'extractData' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        showError();
        return;
      }

      if (response && response.address) {
        showExtractedData(response);
      } else {
        showError();
      }
    });
  } catch (error) {
    console.error('Error:', error);
    showError();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
