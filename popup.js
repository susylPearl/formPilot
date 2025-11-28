// Popup UI Logic
let detectedFields = [];
let userData = {};
let fieldMappings = {};

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  initializeTabs();
  initializeEventListeners();
  loadSavedProfiles();
  loadStoredData();

  // Initialize AI matcher
  await initializeAI();
});

// Initialize AI matcher
async function initializeAI() {
  const statusEl = document.getElementById("aiStatusText");
  const statusContainer = document.getElementById("aiStatus");
  if (!statusEl || !statusContainer) return;

  try {
    statusEl.textContent = "Loading AI model...";
    statusEl.style.color = "#4a4a4a";

    const loaded = await aiMatcher.loadModel();

    if (loaded) {
      statusEl.textContent = "✓ AI Enabled (Hybrid Mode)";
      statusEl.style.color = "#34a853";
    } else {
      // Hide status when AI is unavailable
      statusContainer.style.display = "none";
    }
  } catch (error) {
    console.error("AI initialization error:", error);
    // Hide status on error
    statusContainer.style.display = "none";
  }
}

// Tab switching
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(`${targetTab}-tab`).classList.add("active");
    });
  });
}

// Event listeners
function initializeEventListeners() {
  document.getElementById("scanFields").addEventListener("click", scanFields);
  document
    .getElementById("loadSampleData")
    .addEventListener("click", loadSampleData);
  document.getElementById("clearData").addEventListener("click", clearData);
  document.getElementById("autoMap").addEventListener("click", autoMapFields);
  document.getElementById("previewFill").addEventListener("click", previewFill);
  document.getElementById("executeFill").addEventListener("click", executeFill);
  document.getElementById("saveProfile").addEventListener("click", saveProfile);
  document
    .getElementById("deleteProfile")
    .addEventListener("click", deleteProfile);
  document
    .getElementById("savedProfiles")
    .addEventListener("change", loadProfile);

  // Auto-save user data
  document.getElementById("userDataInput").addEventListener("input", (e) => {
    try {
      userData = JSON.parse(e.target.value);
      saveStoredData();
    } catch (err) {
      // Invalid JSON, ignore
    }
  });
}

// Check if URL is valid for content script injection
function isValidUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    // Block chrome://, edge://, extension://, about:, etc.
    const invalidSchemes = [
      "chrome:",
      "edge:",
      "chrome-extension:",
      "moz-extension:",
      "about:",
    ];
    return !invalidSchemes.some((scheme) => urlObj.protocol.startsWith(scheme));
  } catch {
    return false;
  }
}

// Inject content script if needed
async function ensureContentScript(tabId) {
  try {
    // Try to send a ping message to see if content script is loaded
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded, try to inject it
          // Note: This only works if scripting permission is available
          if (chrome.scripting && chrome.scripting.executeScript) {
            chrome.scripting.executeScript(
              {
                target: { tabId: tabId },
                files: ["content.js"],
              },
              () => {
                if (chrome.runtime.lastError) {
                  console.warn(
                    "Could not inject content script:",
                    chrome.runtime.lastError.message
                  );
                  resolve(false);
                } else {
                  // Wait a bit for script to initialize
                  setTimeout(() => {
                    // Verify it's loaded
                    chrome.tabs.sendMessage(
                      tabId,
                      { action: "ping" },
                      (pingResponse) => {
                        resolve(!chrome.runtime.lastError && pingResponse);
                      }
                    );
                  }, 200);
                }
              }
            );
          } else {
            // Scripting API not available, content script should load automatically
            // Wait a moment and try again
            setTimeout(() => {
              chrome.tabs.sendMessage(
                tabId,
                { action: "ping" },
                (pingResponse) => {
                  resolve(!chrome.runtime.lastError && pingResponse);
                }
              );
            }, 500);
          }
        } else {
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error("Error ensuring content script:", error);
    return false;
  }
}

// Scan form fields on current page
async function scanFields() {
  showStatus("Scanning page for form fields...", "info");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Check if URL is valid
    if (!isValidUrl(tab.url)) {
      showStatus(
        "Cannot scan this page. Please navigate to a regular webpage.",
        "error"
      );
      return;
    }

    // Ensure content script is loaded
    const scriptReady = await ensureContentScript(tab.id);
    if (!scriptReady) {
      showStatus(
        "Failed to load content script. Please refresh the page and try again.",
        "error"
      );
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "scanFields" }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus(
          "Error: " +
            chrome.runtime.lastError.message +
            ". Try refreshing the page.",
          "error"
        );
        return;
      }

      if (response && response.success) {
        detectedFields = response.fields;
        displayFields();
        showStatus(`Found ${detectedFields.length} form fields`, "success");

        // Auto-map if user data exists
        if (Object.keys(userData).length > 0) {
          autoMapFields();
        }
      } else {
        showStatus("No form fields found on this page", "error");
      }
    });
  } catch (error) {
    showStatus("Error scanning fields: " + error.message, "error");
  }
}

// Display detected fields
function displayFields() {
  const fieldsList = document.getElementById("fieldsList");

  if (detectedFields.length === 0) {
    fieldsList.innerHTML = '<p class="empty-state">No fields detected</p>';
    return;
  }

  fieldsList.innerHTML = detectedFields
    .map(
      (field, index) => `
    <div class="field-item">
      <div class="field-label">${
        field.label || field.placeholder || "Unlabeled Field"
      }</div>
      <div class="field-info">
        <span>Type: ${field.type}</span>
        <span>Name: ${field.name || "N/A"}</span>
        <span>ID: ${field.id || "N/A"}</span>
        ${field.required ? '<span style="color: #EA4335;">Required</span>' : ""}
      </div>
    </div>
  `
    )
    .join("");
}

// Load sample data
function loadSampleData() {
  const sampleData = {
    full_name: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    address: "123 Main Street, City, State 12345",
    company: "Acme Corporation",
    date_of_birth: "1990-01-01",
    website: "https://example.com",
    job_title: "Software Engineer",
    country: "United States",
    city: "New York",
    zip_code: "10001",
  };

  document.getElementById("userDataInput").value = JSON.stringify(
    sampleData,
    null,
    2
  );
  userData = sampleData;
  saveStoredData();
  showStatus("Sample data loaded", "success");
}

// Clear data
function clearData() {
  document.getElementById("userDataInput").value = "";
  userData = {};
  fieldMappings = {};
  displayMappings();
  showStatus("Data cleared", "info");
}

// Auto-map fields using hybrid semantic matching (rules + AI)
async function autoMapFields() {
  if (detectedFields.length === 0) {
    showStatus("Please scan fields first", "error");
    return;
  }

  if (Object.keys(userData).length === 0) {
    showStatus("Please provide your data first", "error");
    return;
  }

  fieldMappings = {};
  let ruleMatches = 0;
  let aiMatches = 0;
  let noMatches = 0;

  showStatus("Mapping fields (hybrid AI + rules)...", "info");

  // Map each field using hybrid approach
  for (const field of detectedFields) {
    // Try rule-based matching first (fast)
    const ruleMatch = findBestMatchRuleBased(field, userData);

    let bestMatch = ruleMatch;
    let matchMethod = "rules";

    // If rule-based match is weak or doesn't exist, try AI
    if ((!ruleMatch || ruleMatch.score < 0.7) && aiMatcher.isAvailable()) {
      try {
        const aiMatch = await aiMatcher.findBestMatchAI(field, userData);

        // Use AI match if it's better than rule match
        if (aiMatch && (!ruleMatch || aiMatch.score > ruleMatch.score)) {
          bestMatch = aiMatch;
          matchMethod = "AI";
          aiMatches++;
        } else if (ruleMatch) {
          ruleMatches++;
        } else {
          noMatches++;
        }
      } catch (error) {
        console.error("AI matching error:", error);
        // Fallback to rule match if AI fails
        if (ruleMatch) {
          bestMatch = ruleMatch;
          ruleMatches++;
        } else {
          noMatches++;
        }
      }
    } else if (ruleMatch) {
      ruleMatches++;
    } else {
      noMatches++;
    }

    if (bestMatch) {
      fieldMappings[field.selector] = {
        dataKey: bestMatch.key,
        value: bestMatch.value,
        field: field,
        method: matchMethod,
        score: bestMatch.score || 1.0,
      };
    }
  }

  displayMappings();

  const matchSummary = [];
  if (ruleMatches > 0) matchSummary.push(`${ruleMatches} rule-based`);
  if (aiMatches > 0) matchSummary.push(`${aiMatches} AI-powered`);
  if (noMatches > 0) matchSummary.push(`${noMatches} unmatched`);

  showStatus(
    `Mapped ${Object.keys(fieldMappings).length} fields (${matchSummary.join(
      ", "
    )})`,
    "success"
  );
}

// Rule-based matching (fast, handles most cases)
function findBestMatchRuleBased(field, userData) {
  const fieldText =
    `${field.label} ${field.placeholder} ${field.name} ${field.id}`.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;
  const threshold = 0.3; // Minimum similarity threshold

  // Field type specific keywords
  const typeKeywords = {
    email: ["email", "e-mail", "mail"],
    phone: ["phone", "tel", "mobile", "cell"],
    date: ["date", "birth", "dob", "birthday"],
    number: ["number", "zip", "postal", "code"],
    text: ["name", "address", "company", "city", "country", "website", "title"],
  };

  for (const [key, value] of Object.entries(userData)) {
    const keyLower = key.toLowerCase();
    let score = 0;

    // Exact match
    if (fieldText.includes(keyLower) || keyLower.includes(fieldText.trim())) {
      score = 0.9;
    }

    // Partial word match
    const keyWords = keyLower.split("_");
    keyWords.forEach((word) => {
      if (fieldText.includes(word) && word.length > 2) {
        score = Math.max(score, 0.6);
      }
    });

    // Type-based matching
    if (
      field.type === "email" &&
      (keyLower.includes("email") || keyLower.includes("mail"))
    ) {
      score = Math.max(score, 0.8);
    }
    if (
      field.type === "tel" &&
      (keyLower.includes("phone") || keyLower.includes("tel"))
    ) {
      score = Math.max(score, 0.8);
    }
    if (
      field.type === "date" &&
      (keyLower.includes("date") || keyLower.includes("birth"))
    ) {
      score = Math.max(score, 0.8);
    }

    // Keyword matching
    Object.entries(typeKeywords).forEach(([type, keywords]) => {
      if (field.type === type || field.type === "text") {
        keywords.forEach((keyword) => {
          if (keyLower.includes(keyword) && fieldText.includes(keyword)) {
            score = Math.max(score, 0.7);
          }
        });
      }
    });

    // Levenshtein-like similarity for common variations
    const commonMappings = {
      full_name: ["name", "fullname", "full name"],
      email: ["email", "e-mail", "mail"],
      phone: ["phone", "telephone", "tel", "mobile"],
      address: ["address", "street", "location"],
      company: ["company", "organization", "org", "employer"],
      date_of_birth: ["dob", "birthdate", "birth date", "date of birth"],
      zip_code: ["zip", "postal", "postcode", "zipcode"],
    };

    if (commonMappings[key]) {
      commonMappings[key].forEach((variant) => {
        if (fieldText.includes(variant)) {
          score = Math.max(score, 0.85);
        }
      });
    }

    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = { key, value, score: bestScore, method: "rules" };
    }
  }

  return bestMatch;
}

// Legacy function name for backward compatibility
function findBestMatch(field, userData) {
  return findBestMatchRuleBased(field, userData);
}

// Display field mappings
function displayMappings() {
  const mappingList = document.getElementById("mappingList");

  if (detectedFields.length === 0) {
    mappingList.innerHTML = '<p class="empty-state">Scan fields first</p>';
    return;
  }

  if (Object.keys(userData).length === 0) {
    mappingList.innerHTML =
      '<p class="empty-state">Provide your data first</p>';
    return;
  }

  mappingList.innerHTML = detectedFields
    .map((field) => {
      const mapping = fieldMappings[field.selector];
      const isMapped = mapping !== undefined;
      const mappedValue = mapping ? mapping.value : "";

      const methodBadge =
        isMapped && mapping.method
          ? `<span class="method-badge ${
              mapping.method === "AI" ? "ai-badge" : "rule-badge"
            }">${mapping.method === "AI" ? "🤖 AI" : "⚡ Rules"}</span>`
          : "";

      return `
      <div class="mapping-item ${isMapped ? "mapped" : "unmapped"}">
        <div class="mapping-target">${
          field.label || field.placeholder || "Unlabeled"
        }</div>
        <div class="mapping-arrow">→</div>
        <select class="mapping-select" data-field="${field.selector}">
          <option value="">-- Select Data --</option>
          ${Object.entries(userData)
            .map(
              ([key, value]) =>
                `<option value="${key}" ${
                  mapping && mapping.dataKey === key ? "selected" : ""
                }>${key}</option>`
            )
            .join("")}
        </select>
        ${
          isMapped
            ? `<div class="mapping-value">"${String(mappedValue).substring(
                0,
                25
              )}${
                String(mappedValue).length > 25 ? "..." : ""
              }" ${methodBadge}</div>`
            : ""
        }
      </div>
    `;
    })
    .join("");

  // Add event listeners to select dropdowns
  document.querySelectorAll(".mapping-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const fieldSelector = e.target.dataset.field;
      const selectedKey = e.target.value;

      if (selectedKey) {
        fieldMappings[fieldSelector] = {
          dataKey: selectedKey,
          value: userData[selectedKey],
          field: detectedFields.find((f) => f.selector === fieldSelector),
        };
      } else {
        delete fieldMappings[fieldSelector];
      }

      displayMappings();
    });
  });
}

// Preview fill (highlight fields)
async function previewFill() {
  if (Object.keys(fieldMappings).length === 0) {
    showStatus("No mappings to preview", "error");
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!isValidUrl(tab.url)) {
      showStatus(
        "Cannot preview on this page. Please navigate to a regular webpage.",
        "error"
      );
      return;
    }

    // Ensure content script is loaded
    await ensureContentScript(tab.id);

    chrome.tabs.sendMessage(
      tab.id,
      {
        action: "previewFill",
        mappings: fieldMappings,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          showStatus(
            "Error: " +
              chrome.runtime.lastError.message +
              ". Try refreshing the page.",
            "error"
          );
          return;
        }
        if (response && response.success) {
          showStatus(
            "Preview mode activated - fields highlighted on page",
            "success"
          );
        }
      }
    );
  } catch (error) {
    showStatus("Error previewing: " + error.message, "error");
  }
}

// Execute form fill
async function executeFill() {
  if (Object.keys(fieldMappings).length === 0) {
    showStatus("No mappings to fill", "error");
    return;
  }

  if (!confirm(`Fill ${Object.keys(fieldMappings).length} form fields?`)) {
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!isValidUrl(tab.url)) {
      showStatus(
        "Cannot fill forms on this page. Please navigate to a regular webpage.",
        "error"
      );
      return;
    }

    // Ensure content script is loaded
    await ensureContentScript(tab.id);

    chrome.tabs.sendMessage(
      tab.id,
      {
        action: "fillForm",
        mappings: fieldMappings,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          showStatus(
            "Error: " +
              chrome.runtime.lastError.message +
              ". Try refreshing the page.",
            "error"
          );
          return;
        }
        if (response && response.success) {
          showStatus(
            `Successfully filled ${response.filledCount} fields`,
            "success"
          );
        } else {
          showStatus(
            "Error filling form: " + (response?.error || "Unknown error"),
            "error"
          );
        }
      }
    );
  } catch (error) {
    showStatus("Error: " + error.message, "error");
  }
}

// Profile management
function saveProfile() {
  const profileName = prompt("Enter profile name:");
  if (!profileName) return;

  const profile = {
    name: profileName,
    data: userData,
    timestamp: Date.now(),
  };

  chrome.storage.local.get(["profiles"], (result) => {
    const profiles = result.profiles || [];
    profiles.push(profile);
    chrome.storage.local.set({ profiles }, () => {
      loadSavedProfiles();
      showStatus("Profile saved", "success");
    });
  });
}

function loadProfile() {
  const select = document.getElementById("savedProfiles");
  const selectedIndex = select.selectedIndex;
  if (selectedIndex === 0) return;

  chrome.storage.local.get(["profiles"], (result) => {
    const profiles = result.profiles || [];
    const profile = profiles[selectedIndex - 1];

    if (profile) {
      userData = profile.data;
      document.getElementById("userDataInput").value = JSON.stringify(
        userData,
        null,
        2
      );
      saveStoredData();

      if (detectedFields.length > 0) {
        autoMapFields();
      }

      showStatus("Profile loaded", "success");
    }
  });
}

function deleteProfile() {
  const select = document.getElementById("savedProfiles");
  const selectedIndex = select.selectedIndex;
  if (selectedIndex === 0) return;

  if (!confirm("Delete this profile?")) return;

  chrome.storage.local.get(["profiles"], (result) => {
    const profiles = result.profiles || [];
    profiles.splice(selectedIndex - 1, 1);
    chrome.storage.local.set({ profiles }, () => {
      loadSavedProfiles();
      select.selectedIndex = 0;
      showStatus("Profile deleted", "info");
    });
  });
}

function loadSavedProfiles() {
  chrome.storage.local.get(["profiles"], (result) => {
    const profiles = result.profiles || [];
    const select = document.getElementById("savedProfiles");

    select.innerHTML = '<option value="">Select a saved profile...</option>';
    profiles.forEach((profile, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = profile.name;
      select.appendChild(option);
    });
  });
}

// Storage helpers
function saveStoredData() {
  chrome.storage.local.set({ userData, fieldMappings });
}

function loadStoredData() {
  chrome.storage.local.get(["userData", "fieldMappings"], (result) => {
    if (result.userData) {
      userData = result.userData;
      document.getElementById("userDataInput").value = JSON.stringify(
        userData,
        null,
        2
      );
    }
    if (result.fieldMappings) {
      fieldMappings = result.fieldMappings;
    }
  });
}

// Status message helper
function showStatus(message, type = "info") {
  const statusEl = document.getElementById("statusMessage");
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;

  setTimeout(() => {
    statusEl.className = "status-message";
  }, 5000);
}
