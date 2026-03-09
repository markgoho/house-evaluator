/**
 * House Evaluator Helper - Popup Script
 * Handles the extension popup UI and communication with content scripts
 */

// Use deployed app (change to localhost:5173 for local development)
const BASE_URL = "https://house-eval.web.app/houses/new";

// Format field names for display
const FIELD_LABELS = {
  address: "Street Address",
  city: "City",
  state: "State",
  zipCode: "ZIP Code",
  price: "Price",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  squareFeet: "Square Feet",
  lotSize: "Lot Size",
  yearBuilt: "Year Built",
  listingUrl: "Listing URL",
  imageUrl: "Property Photo",
  zestimate: "Zestimate",
  lastSoldPrice: "Last Sold Price",
  lastSoldDate: "Last Sold Date",
  taxAssessedValue: "Tax Assessed Value",
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
    case "price":
    case "zestimate":
    case "lastSoldPrice":
    case "taxAssessedValue":
      return `$${value.toLocaleString()}`;
    case "squareFeet":
    case "lotSize":
      return `${value.toLocaleString()} sq ft`;
    case "bathrooms":
      return value % 1 === 0 ? value.toString() : value.toFixed(1);
    case "listingUrl":
      // Truncate long URLs
      return value.length > 50 ? value.substring(0, 47) + "..." : value;
    case "imageUrl":
      // Show indicator instead of full URL
      return "[Image Available]";
    default:
      return value.toString();
  }
}

/**
 * Show the loading state
 */
function showLoading() {
  hideAllSections();
  document.getElementById("loading").classList.remove("hidden");
}

/**
 * Show extracted data section
 * @param {Object} data - Extracted property data
 */
function showExtractedData(data) {
  hideAllSections();

  const container = document.getElementById("extracted-data");
  container.classList.remove("hidden");

  const dataList = document.getElementById("data-list");
  dataList.innerHTML = "";

  // Display extracted fields
  let hasData = false;
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== "") {
      hasData = true;
      const li = document.createElement("li");

      const label = document.createElement("span");
      label.className = "field-label";
      label.textContent = FIELD_LABELS[key] || key;

      const valueSpan = document.createElement("span");
      valueSpan.className = "field-value";
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
  document.getElementById("open-app").addEventListener("click", () => {
    const params = new URLSearchParams();

    // Add all non-null fields to URL params
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && value !== "") {
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
  document.getElementById("error").classList.remove("hidden");
}

/**
 * Show unsupported site message
 */
function showUnsupported() {
  hideAllSections();
  document.getElementById("unsupported").classList.remove("hidden");
}

/**
 * Show refresh needed message
 */
function showRefreshNeeded() {
  hideAllSections();
  const section = document.getElementById("refresh-needed");
  section.classList.remove("hidden");

  // Set up refresh button (remove old listeners first)
  const btn = document.getElementById("refresh-page");
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);

  newBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
        window.close();
      }
    });
  });
}

/**
 * Hide all sections
 */
function hideAllSections() {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("extracted-data").classList.add("hidden");
  document.getElementById("error").classList.add("hidden");
  document.getElementById("unsupported").classList.add("hidden");
  document.getElementById("refresh-needed").classList.add("hidden");
}

/**
 * Check if current tab is on a supported site
 * @param {string} url - Tab URL
 * @returns {boolean} - True if supported
 */
function isSupportedSite(url) {
  return (
    url.includes("zillow.com") ||
    url.includes("redfin.com") ||
    url.includes("realtor.com")
  );
}

/**
 * Try to inject content script manually and retry extraction
 * @param {Object} tab - Chrome tab object
 */
async function tryInjectContentScript(tab) {
  try {
    // Determine which content script to inject based on URL
    let scriptFile;
    if (tab.url.includes("zillow.com")) {
      scriptFile = "content-scripts/zillow.js";
    } else if (tab.url.includes("redfin.com")) {
      scriptFile = "content-scripts/redfin.js";
    } else if (tab.url.includes("realtor.com")) {
      scriptFile = "content-scripts/realtor.js";
    } else {
      showError();
      return;
    }

    // Inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [scriptFile],
    });

    // Wait a moment for script to initialize
    setTimeout(() => {
      // Retry data extraction
      chrome.tabs.sendMessage(tab.id, { action: "extractData" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          // If injection still didn't work, show refresh message
          showRefreshNeeded();
          return;
        }

        if (response.address) {
          showExtractedData(response);
        } else {
          showError();
        }
      });
    }, 100);
  } catch (error) {
    console.error("Failed to inject content script:", error);
    showRefreshNeeded();
  }
}

/**
 * Main initialization function
 */
async function init() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

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
    chrome.tabs.sendMessage(tab.id, { action: "extractData" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);

        // If content script not found, try to inject it
        if (chrome.runtime.lastError.message.includes("Receiving end does not exist")) {
          tryInjectContentScript(tab);
        } else {
          showError();
        }
        return;
      }

      if (response && response.address) {
        showExtractedData(response);
      } else {
        showError();
      }
    });
  } catch (error) {
    console.error("Error:", error);
    showError();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
