# Installation Guide

## Quick Start

### For Chrome/Edge (Chromium-based browsers)

1. **Open Extensions Page**

   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode**

   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**

   - Click "Load unpacked" button
   - Select the folder containing this extension (`/Users/chiran/Desktop/genAI`)
   - The extension should now appear in your extensions list

4. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in the toolbar
   - Find "FormPilot – Your Smart AI Form Assistant"
   - Click the pin icon to keep it visible

### For Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from this directory
4. The extension will be loaded temporarily (reload after browser restart)

## Icon Setup (Optional)

The extension references icon files that need to be created:

1. Create three PNG images:

   - `icons/icon16.png` (16x16 pixels)
   - `icons/icon48.png` (48x48 pixels)
   - `icons/icon128.png` (128x128 pixels)

2. You can:

   - Use an online icon generator (e.g., favicon-generator.org)
   - Create simple icons with any image editor
   - Use placeholder images for testing

3. The extension will work without icons, but Chrome may show warnings.

## Verification

After installation:

1. Navigate to any webpage with a form
2. Click the extension icon in your toolbar
3. You should see the "FormPilot" popup
4. Try clicking "Load Sample Data" to test

## Troubleshooting

**Extension not loading?**

- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check that Developer Mode is enabled
- Look for error messages in the extensions page

**Icons missing?**

- This is normal if you haven't created icon files yet
- The extension will still function
- Create the icon files to remove warnings

**Permission errors?**

- The extension needs permission to access web pages
- Click "Allow" when prompted
- You can manage permissions in `chrome://extensions/`

## First Use

1. Open the extension popup
2. Click "Load Sample Data" to see example data
3. Navigate to a form page (e.g., a contact form)
4. Click "Scan Current Page" in the "Detected Fields" tab
5. Go to "Mapping" tab and click "Auto-Map Fields"
6. Click "Fill Form" to test

Enjoy FormPilot – Your Smart AI Form Assistant! ✈️🚀
