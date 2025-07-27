import { ComputedFontInfo, ExtensionMessage } from './content/types';

// Store the last detected font information
let lastDetectedFont: ComputedFontInfo | null = null;

// Listen for extension icon click to inject content script
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    // Inject CSS first
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['styles.css'],
    });

    // Then inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/main.js'],
    });

    // Optionally show a message to user about how to use the extension
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'static/icon128.png',
      title: 'FindFont Activated',
      message: 'Select text on the page to identify fonts',
    });
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === 'FONT_DETECTED') {
      lastDetectedFont = message.fontInfo;

      // Show notification
      chrome.notifications.create(
        {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Find Font',
          message: `Font: ${message.fontInfo.fontFamily}\nClick to view details`,
        },
        (notificationId) => {
          // Store the font info for when the notification is clicked
          chrome.storage.local.set({ [notificationId]: message.fontInfo });
        }
      );
    }
  }
);

// Listen for notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Clear the stored font info
  chrome.storage.local.remove(notificationId);

  // Open the popup
  chrome.action.openPopup();
});

chrome.notifications.onClosed.addListener((notificationId) => {
  chrome.storage.local.remove(notificationId);
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_FONT_INFO') {
    sendResponse(lastDetectedFont);
  }
});
