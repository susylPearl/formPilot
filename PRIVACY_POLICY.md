# Privacy Policy for FormPilot – Your Smart AI Form Assistant

**Last Updated**: November 2025

## Introduction

FormPilot ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our browser extension.

## Data Collection and Storage

### What Data We Collect

FormPilot collects and stores the following data **locally on your device**:

1. **Form Data Profiles**: Personal information you choose to save (name, email, phone, address, etc.)
2. **Field Mappings**: Your preferences for how data maps to form fields
3. **Extension Settings**: User preferences and configuration

### How Data is Stored

- All data is stored **locally in your browser** using Chrome's local storage API
- Data is stored on **your device only** and never transmitted to external servers
- You can delete all stored data at any time by clearing the extension's storage

## Data Usage

### How We Use Your Data

1. **Form Filling**: Your saved data is used to automatically fill web forms when you choose to use this feature
2. **Field Matching**: Data is used to intelligently match your information to form fields
3. **Profile Management**: Stored profiles allow you to quickly switch between different sets of information

### What We DON'T Do

We **DO NOT**:
- ❌ Send your data to external servers
- ❌ Share your data with third parties
- ❌ Track your browsing behavior
- ❌ Access websites you visit without your explicit action
- ❌ Collect analytics or usage statistics
- ❌ Store your data in cloud services
- ❌ Access your passwords or saved credentials
- ❌ Read or modify data outside of form fields

## AI Processing

### Client-Side AI

FormPilot uses **TensorFlow.js** and **Universal Sentence Encoder** for semantic matching:
- All AI processing happens **entirely in your browser**
- No data is sent to external AI services or APIs
- Model files are loaded from CDN but processing is local
- Your form data never leaves your device during AI matching

## Permissions

### Required Permissions

FormPilot requires the following permissions:

1. **`activeTab`**: Access the currently active browser tab
   - Used only when you explicitly click "Scan Current Page" or "Fill Form"
   - Does not access tabs in the background

2. **`storage`**: Store data locally in your browser
   - Used to save your profiles and preferences
   - All data remains on your device

3. **`scripting`**: Inject content scripts into web pages
   - Used to detect and fill form fields
   - Only runs when you actively use the extension

4. **`host_permissions: ["<all_urls>"]`**: Work on any website
   - Required to function on any website with forms
   - Only accesses pages when you explicitly use the extension

For detailed justification of each permission, see [PERMISSIONS_JUSTIFICATION.md](PERMISSIONS_JUSTIFICATION.md).

## Third-Party Services

### CDN Resources

FormPilot loads the following resources from CDNs:
- **TensorFlow.js**: From `cdn.jsdelivr.net` - for AI functionality
- **Universal Sentence Encoder**: From `cdn.jsdelivr.net` - for semantic matching

These are open-source libraries used for local processing only. No data is sent to these CDNs.

## Data Security

### Security Measures

- All data is stored locally using browser's secure storage APIs
- No network transmission of personal data
- Content scripts run in isolated contexts
- No external API calls with your data

### Your Control

You have full control over your data:
- **View**: Check your saved profiles in the extension popup
- **Edit**: Modify or delete any profile at any time
- **Delete**: Clear all data by removing the extension or clearing storage
- **Export**: Copy your data from the JSON input field

## Children's Privacy

FormPilot is not intended for children under 13. We do not knowingly collect personal information from children.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Updating the "Last Updated" date at the top of this policy
- Posting the new Privacy Policy in the extension repository

## Your Rights

You have the right to:
- **Access**: View all data stored by the extension
- **Delete**: Remove all stored data at any time
- **Control**: Choose what data to save and use
- **Opt-out**: Stop using the extension and remove it

## Data Deletion

To delete all data stored by FormPilot:
1. Open Chrome Extensions page (`chrome://extensions/`)
2. Find "FormPilot – Your Smart AI Form Assistant"
3. Click "Remove" to uninstall the extension
4. All locally stored data will be deleted

Alternatively, you can clear individual profiles using the extension's interface.

## Contact Information

If you have questions about this Privacy Policy or our data practices, please:
- Review the source code in the extension repository
- Check the [PERMISSIONS_JUSTIFICATION.md](PERMISSIONS_JUSTIFICATION.md) document
- Contact the development team through the repository

## Compliance

This extension complies with:
- **GDPR**: All data processing is local, user-controlled, and transparent
- **CCPA**: No data is sold or shared with third parties
- **Chrome Web Store Policies**: Follows all required privacy and security guidelines

## Open Source

FormPilot is open source. You can review the code to verify our privacy practices. All processing happens locally in your browser as described in this policy.

---

**Summary**: FormPilot stores your data locally on your device only. We never send your data to external servers, track your browsing, or share your information with third parties. All AI processing happens in your browser. You have full control over your data and can delete it at any time.

