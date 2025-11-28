# Permissions Justification

This document explains why FormPilot requires each permission and how they are used to provide the form autofill functionality.

## Current Permissions

### 1. `activeTab`

**Purpose**: Access the currently active browser tab

**Why it's needed**:

- FormPilot needs to scan the active webpage to detect form fields
- The extension must read the DOM structure to identify input fields, textareas, and select elements
- Required to fill form fields on the current page

**How it's used**:

- When you click "Scan Current Page", the extension reads the page's HTML structure
- Form field detection analyzes labels, placeholders, and field attributes
- Form filling directly interacts with form elements on the active tab

**Privacy**: Only accesses the tab when you explicitly interact with the extension (clicking buttons). Does not access tabs in the background.

---

### 2. `storage`

**Purpose**: Store user data and profiles locally in the browser

**Why it's needed**:

- Save your personal data profiles (name, email, phone, etc.)
- Remember field mappings for future use
- Store preferences and settings

**How it's used**:

- Saves data profiles you create (e.g., "Work Profile", "Personal Profile")
- Stores your form data temporarily while using the extension
- Remembers field mappings between sessions

**Privacy**: All data is stored locally in your browser. No data is sent to external servers. Data is only accessible by you on your device.

---

### 3. `scripting`

**Purpose**: Programmatically inject content scripts into web pages

**Why it's needed**:

- Ensures the content script loads reliably on all web pages
- Handles cases where content scripts don't load automatically
- Provides fallback injection when needed

**How it's used**:

- Injects `content.js` into the active tab when needed
- Ensures form detection and filling functionality works consistently
- Handles edge cases where automatic content script injection fails

**Privacy**: Only injects scripts into tabs you're actively using. Scripts run in isolated contexts and cannot access your browsing history or other tabs.

---

### 4. `host_permissions: ["<all_urls>"]`

**Purpose**: Work on any website with forms

**Why it's needed**:

- FormPilot is designed to work on any website, not just specific domains
- Users need to fill forms on various sites (contact forms, registration, checkout, etc.)
- Cannot predict which websites users will visit

**How it's used**:

- Allows content script to run on any webpage
- Enables form detection and filling across all websites
- No restrictions on where the extension can operate

**Privacy**:

- Content scripts only run when you explicitly use the extension
- All processing happens locally in your browser
- No data is transmitted to external servers
- The extension only reads form fields you choose to scan

---

## What We DON'T Do

FormPilot does **NOT**:

- ❌ Access your browsing history
- ❌ Track which websites you visit
- ❌ Send data to external servers
- ❌ Access other browser tabs without your interaction
- ❌ Read or modify data outside of form fields
- ❌ Access your passwords or saved credentials
- ❌ Monitor your keystrokes or other input
- ❌ Access your files or downloads

---

## Privacy Commitment

**All processing is local**:

- Form detection happens in your browser
- AI matching runs client-side using TensorFlow.js
- Data never leaves your device

**User control**:

- You choose when to scan fields
- You review and edit mappings before filling
- You control what data is stored in profiles

**Transparency**:

- Open source code for review
- Clear explanation of all permissions
- No hidden functionality

---

## Comparison with Similar Extensions

Most form autofill extensions require similar permissions:

- **Password managers**: Require `activeTab` and `storage` (and often more)
- **Form fillers**: Need `activeTab`, `storage`, and `host_permissions`
- **Data managers**: Require `storage` for local data

FormPilot uses the **minimum permissions** necessary for its functionality.

---

## Security Best Practices

1. **Principle of Least Privilege**: Only requests permissions absolutely necessary
2. **Local Processing**: All AI and matching happens client-side
3. **No External Calls**: No API requests to external servers
4. **User Consent**: Explicit user action required for all operations
5. **Data Isolation**: Content scripts run in isolated contexts

---

## Questions or Concerns?

If you have questions about any permission or how your data is handled, please review the source code or contact the development team.

**Last Updated**: 2024
