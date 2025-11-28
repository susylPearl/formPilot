// Content Script - Runs on web pages
// Form Field Detection and Autofill Engine

class FormFieldDetector {
  constructor() {
    this.fields = [];
  }

  // Scan page for all form fields
  scanFields() {
    this.fields = [];

    // Find all input elements
    const inputs = document.querySelectorAll("input, textarea, select");

    inputs.forEach((input, index) => {
      // Skip hidden and disabled fields
      if (
        input.type === "hidden" ||
        input.disabled ||
        input.style.display === "none"
      ) {
        return;
      }

      const field = this.extractFieldInfo(input, index);
      if (field) {
        this.fields.push(field);
      }
    });

    return this.fields;
  }

  // Extract comprehensive field information
  extractFieldInfo(element, index) {
    const field = {
      selector: this.generateSelector(element, index),
      type: element.type || element.tagName.toLowerCase(),
      name: element.name || "",
      id: element.id || "",
      label: this.findLabel(element),
      placeholder: element.placeholder || "",
      required: element.required || element.hasAttribute("aria-required"),
      value: element.value || "",
      options: this.extractOptions(element),
      index: index,
    };

    return field;
  }

  // Generate unique selector for field
  generateSelector(element, index) {
    // Prefer ID
    if (element.id) {
      return `#${element.id}`;
    }

    // Prefer name
    if (element.name) {
      const nameSelector = `[name="${element.name}"]`;
      const matches = document.querySelectorAll(nameSelector);
      if (matches.length === 1) {
        return nameSelector;
      }
      // If multiple, add index
      return `${nameSelector}:nth-of-type(${
        Array.from(matches).indexOf(element) + 1
      })`;
    }

    // Fallback to tag + index
    return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
  }

  // Find associated label text
  findLabel(element) {
    // Check for explicit label association
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return this.cleanText(label.textContent);
      }
    }

    // Check for parent label
    let parent = element.parentElement;
    while (parent && parent.tagName !== "BODY") {
      if (parent.tagName === "LABEL") {
        return this.cleanText(parent.textContent);
      }
      parent = parent.parentElement;
    }

    // Check for nearby text (aria-label, title, etc.)
    if (element.getAttribute("aria-label")) {
      return element.getAttribute("aria-label");
    }

    if (element.title) {
      return element.title;
    }

    // Check for preceding text nodes or labels
    const prevSibling = element.previousElementSibling;
    if (
      prevSibling &&
      (prevSibling.tagName === "LABEL" ||
        prevSibling.classList.contains("label"))
    ) {
      return this.cleanText(prevSibling.textContent);
    }

    // Check for parent container with label class
    const labelContainer = element.closest(
      '.form-group, .field, .input-group, [class*="label"]'
    );
    if (labelContainer) {
      const labelEl = labelContainer.querySelector(
        'label, .label, [class*="label"]'
      );
      if (labelEl) {
        return this.cleanText(labelEl.textContent);
      }
    }

    return "";
  }

  // Clean text content
  cleanText(text) {
    return text ? text.trim().replace(/\s+/g, " ").substring(0, 100) : "";
  }

  // Extract options for select elements
  extractOptions(element) {
    if (element.tagName !== "SELECT") {
      return [];
    }

    const options = [];
    Array.from(element.options).forEach((option) => {
      options.push({
        value: option.value,
        text: option.text,
      });
    });

    return options;
  }
}

class FormFiller {
  constructor() {
    this.highlightStyle = null;
  }

  // Preview fill - highlight fields
  previewFill(mappings) {
    this.clearPreview();

    Object.keys(mappings).forEach((selector) => {
      try {
        const element = document.querySelector(selector);
        if (element) {
          this.highlightElement(element, mappings[selector].value);
        }
      } catch (error) {
        console.warn("Could not preview field:", selector, error);
      }
    });
  }

  // Highlight element
  highlightElement(element, value) {
    const originalStyle = {
      outline: element.style.outline,
      backgroundColor: element.style.backgroundColor,
      border: element.style.border,
    };

    element.style.outline = "3px solid #1A73E8";
    element.style.backgroundColor = "#E8F0FE";
    element.style.border = "2px solid #1A73E8";

    // Show value tooltip
    const tooltip = document.createElement("div");
    tooltip.textContent = `Will fill: "${String(value).substring(0, 50)}"`;
    tooltip.style.cssText = `
      position: absolute;
      background: #1A73E8;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      z-index: 10000;
      pointer-events: none;
      white-space: nowrap;
    `;

    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - 25}px`;
    tooltip.style.left = `${rect.left}px`;
    document.body.appendChild(tooltip);

    // Store for cleanup
    if (!this.highlightStyle) {
      this.highlightStyle = new Map();
    }
    this.highlightStyle.set(element, { originalStyle, tooltip });
  }

  // Clear preview highlights
  clearPreview() {
    if (this.highlightStyle) {
      this.highlightStyle.forEach(({ originalStyle, tooltip }, element) => {
        element.style.outline = originalStyle.outline;
        element.style.backgroundColor = originalStyle.backgroundColor;
        element.style.border = originalStyle.border;
        if (tooltip && tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      });
      this.highlightStyle.clear();
    }
  }

  // Fill form fields sequentially
  async fillForm(mappings) {
    this.clearPreview();

    let filledCount = 0;
    const fillOrder = this.determineFillOrder(mappings);

    for (const selector of fillOrder) {
      const mapping = mappings[selector];
      if (!mapping) continue;

      try {
        const element = document.querySelector(selector);
        if (!element) {
          console.warn("Field not found:", selector);
          continue;
        }

        const success = await this.fillField(
          element,
          mapping.value,
          mapping.field
        );
        if (success) {
          filledCount++;
        }

        // Small delay between fields to mimic human typing
        await this.delay(100);
      } catch (error) {
        console.error("Error filling field:", selector, error);
      }
    }

    return filledCount;
  }

  // Determine fill order (top to bottom, left to right)
  determineFillOrder(mappings) {
    const fieldsWithPositions = Object.keys(mappings)
      .map((selector) => {
        try {
          const element = document.querySelector(selector);
          if (!element) return null;

          const rect = element.getBoundingClientRect();
          return {
            selector,
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
          };
        } catch {
          return null;
        }
      })
      .filter((f) => f !== null);

    // Sort by top position, then left position
    fieldsWithPositions.sort((a, b) => {
      if (Math.abs(a.top - b.top) > 50) {
        return a.top - b.top;
      }
      return a.left - b.left;
    });

    return fieldsWithPositions.map((f) => f.selector);
  }

  // Fill a single field
  async fillField(element, value, fieldInfo) {
    if (!value && value !== 0) {
      return false;
    }

    const valueStr = String(value);

    try {
      switch (element.tagName.toLowerCase()) {
        case "input":
          return await this.fillInput(element, valueStr, fieldInfo);
        case "textarea":
          return await this.fillTextarea(element, valueStr);
        case "select":
          return this.fillSelect(element, valueStr, fieldInfo);
        default:
          return false;
      }
    } catch (error) {
      console.error("Error filling field:", error);
      return false;
    }
  }

  // Fill input field
  async fillInput(element, value, fieldInfo) {
    const type = element.type.toLowerCase();

    switch (type) {
      case "checkbox":
        element.checked = Boolean(value);
        this.triggerEvent(element, "change");
        return true;

      case "radio":
        element.checked = true;
        this.triggerEvent(element, "change");
        return true;

      case "date":
      case "datetime-local":
        element.value = this.formatDate(value);
        this.triggerEvent(element, "change");
        return true;

      case "email":
      case "text":
      case "tel":
      case "url":
      case "number":
      case "password":
      default:
        // Simulate typing for better compatibility
        element.focus();
        element.value = "";
        await this.typeText(element, value);
        element.blur();
        this.triggerEvent(element, "input");
        this.triggerEvent(element, "change");
        return true;
    }
  }

  // Fill textarea
  async fillTextarea(element, value) {
    element.focus();
    element.value = "";
    await this.typeText(element, value);
    element.blur();
    this.triggerEvent(element, "input");
    this.triggerEvent(element, "change");
    return true;
  }

  // Fill select dropdown
  fillSelect(element, value, fieldInfo) {
    const valueStr = String(value).toLowerCase();

    // Try exact value match first
    for (const option of element.options) {
      if (option.value === value || option.value.toLowerCase() === valueStr) {
        element.value = option.value;
        this.triggerEvent(element, "change");
        return true;
      }
    }

    // Try text match
    for (const option of element.options) {
      if (
        option.text.toLowerCase().includes(valueStr) ||
        valueStr.includes(option.text.toLowerCase())
      ) {
        element.value = option.value;
        this.triggerEvent(element, "change");
        return true;
      }
    }

    // Try partial match
    for (const option of element.options) {
      const optionText = option.text.toLowerCase();
      if (
        optionText.includes(valueStr.substring(0, 3)) ||
        valueStr.includes(optionText.substring(0, 3))
      ) {
        element.value = option.value;
        this.triggerEvent(element, "change");
        return true;
      }
    }

    return false;
  }

  // Simulate typing text
  async typeText(element, text) {
    for (let i = 0; i < text.length; i++) {
      element.value += text[i];
      this.triggerEvent(element, "input");
      await this.delay(20 + Math.random() * 30); // Random delay 20-50ms
    }
  }

  // Format date value
  formatDate(value) {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      // Try parsing as YYYY-MM-DD
      return value;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Trigger DOM events
  triggerEvent(element, eventType) {
    const event = new Event(eventType, {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  }

  // Delay helper
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize detector and filler
const detector = new FormFieldDetector();
const filler = new FormFiller();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    // Respond to ping to confirm content script is loaded
    sendResponse({ success: true, loaded: true });
    return true;
  } else if (request.action === "scanFields") {
    const fields = detector.scanFields();
    sendResponse({ success: true, fields });
  } else if (request.action === "previewFill") {
    filler.previewFill(request.mappings);
    sendResponse({ success: true });
  } else if (request.action === "fillForm") {
    filler
      .fillForm(request.mappings)
      .then((filledCount) => {
        sendResponse({ success: true, filledCount });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Async response
  }

  return false;
});
