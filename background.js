// Background Service Worker
// Handles extension lifecycle and storage

chrome.runtime.onInstalled.addListener(() => {
  console.log("FormPilot – Your Smart AI Form Assistant installed");
});

// Optional: Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Popup handles UI, but we can add additional logic here if needed
});
