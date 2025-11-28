# FormPilot – Your Smart AI Form Assistant

FormPilot is your smart AI form assistant that automatically detects and fills web forms using intelligent semantic matching. The extension analyzes form fields, understands their meaning, and maps them to your provided data automatically.

## Features

- 🔍 **Automatic Form Detection**: Scans web pages and identifies all form fields
- 🧠 **Semantic Matching**: Intelligently maps your data to form fields using AI-powered analysis
- 📝 **Sequential Filling**: Fills forms in natural order (top to bottom, left to right)
- 👁️ **Preview Mode**: Preview what will be filled before executing
- 💾 **Profile Management**: Save and load multiple data profiles
- 🔒 **Privacy First**: All data stays local in your browser
- ⚡ **Lightweight**: No external API calls, runs entirely client-side

## Installation

### Chrome/Edge

1. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the folder containing this extension
5. The extension icon should appear in your toolbar

### Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file

## Usage

1. **Provide Your Data**:

   - Click the extension icon
   - Go to the "Your Data" tab
   - Enter your data as JSON (or click "Load Sample Data")
   - Example:
     ```json
     {
       "full_name": "John Doe",
       "email": "john@example.com",
       "phone": "1234567890",
       "address": "123 Main St",
       "company": "Acme Inc"
     }
     ```

2. **Scan Form Fields**:

   - Navigate to a webpage with a form
   - Open the extension popup
   - Go to "Detected Fields" tab
   - Click "🔍 Scan Current Page"

3. **Review Mappings**:

   - Go to "Mapping" tab
   - Review how your data maps to form fields
   - Edit mappings manually if needed
   - Click "🔄 Auto-Map Fields" to remap

4. **Fill the Form**:
   - Click "👁️ Preview" to see what will be filled (optional)
   - Click "✅ Fill Form" to execute
   - Confirm the action

## How It Works

### Form Field Detection

The extension scans the DOM for:

- `<input>` elements (text, email, tel, date, checkbox, radio, etc.)
- `<textarea>` elements
- `<select>` dropdowns

For each field, it extracts:

- Label text (from `<label>` tags, aria-labels, nearby text)
- Placeholder text
- Input type and attributes
- Field name and ID
- Required status

### Semantic Matching (Hybrid AI + Rules)

The matching engine uses a **hybrid approach** combining fast rule-based matching with AI-powered semantic understanding:

#### Rule-Based Matching (Primary - Fast)

1. **Exact Match**: Direct string matching between field labels and data keys
2. **Partial Match**: Word-by-word matching
3. **Type-Based Matching**: Email fields match email data, phone fields match phone data
4. **Keyword Matching**: Recognizes common variations (e.g., "full_name" → "name", "fullname")
5. **Common Mappings**: Handles standard field variations

#### AI-Powered Matching (Fallback - Intelligent)

- Uses **TensorFlow.js Universal Sentence Encoder** for semantic similarity
- Activates when rule-based matching has low confidence (< 0.7)
- Understands context and meaning, not just keywords
- Handles edge cases and unusual field names
- Works entirely client-side (privacy-preserving)

**How it works:**

1. Rule-based matching runs first (handles 80-90% of cases instantly)
2. If confidence is low, AI semantic matching is used
3. Best match is selected based on similarity scores
4. UI shows which method was used (🤖 AI or ⚡ Rules)

### Form Filling

Fields are filled sequentially:

1. Determines fill order (top to bottom, left to right)
2. Fills each field with appropriate method:
   - Text inputs: Simulates typing
   - Dropdowns: Matches by value or text
   - Checkboxes/Radios: Sets checked state
   - Dates: Formats appropriately
3. Triggers necessary DOM events for form validation

## File Structure

```
.
├── manifest.json          # Extension configuration
├── popup.html            # Extension UI
├── popup.css             # UI styling
├── popup.js              # UI logic and hybrid matching
├── ai-matcher.js         # AI-powered semantic matching (TensorFlow.js)
├── content.js            # Form detection and filling engine
├── background.js         # Background service worker
├── icons/                # Extension icons
└── README.md            # This file
```

## Technical Details

- **Manifest Version**: 3 (Chrome Extension Manifest V3)
- **Permissions**:

  - `activeTab`: Access current tab
  - `storage`: Save user data and profiles
  - `scripting`: Inject content scripts when needed
  - `<all_urls>`: Work on any website

📋 **See [PERMISSIONS_JUSTIFICATION.md](PERMISSIONS_JUSTIFICATION.md) for detailed explanation of why each permission is needed and how your privacy is protected.**

- **AI-Powered**: Uses TensorFlow.js Universal Sentence Encoder for semantic matching
- **Hybrid Approach**: Combines fast rule-based matching with AI for best accuracy
- **Client-Side AI**: All AI processing happens in your browser (privacy-preserving)
- **Client-Side Only**: All processing happens in the browser

## Privacy & Security

- ✅ All data stored locally in browser storage
- ✅ No external API calls
- ✅ No data transmission
- ✅ Works offline
- ✅ Open source code for transparency

## Limitations

- Works best with standard HTML forms
- May have issues with heavily JavaScript-rendered forms
- Some sites may block programmatic form filling
- Complex custom form components may not be detected

## Troubleshooting

**Fields not detected?**

- Make sure the form is fully loaded
- Some sites use custom form components that may not be detected
- Try refreshing the page and scanning again

**Mappings incorrect?**

- Use the "Mapping" tab to manually adjust mappings
- Ensure your data keys are descriptive (e.g., "full_name" instead of "fn")
- Check that field labels are visible on the page

**Form not filling?**

- Some sites validate input in real-time - try filling slower
- Check browser console for errors
- Ensure fields are not disabled or hidden

## Future Enhancements

Potential improvements:

- Support for file uploads
- Multi-step form navigation
- Form validation handling
- Custom field type detection
- Integration with password managers
- Form templates for common sites

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

---

**Note**: This extension is for legitimate use cases like filling your own information on forms. Always respect website terms of service and use responsibly.
