import { ComputedFontInfo, ExtensionMessage } from './content/types';

// Store the last detected font information
let lastDetectedFont: ComputedFontInfo | null = null;

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
  // Open the popup
  chrome.action.openPopup();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_FONT_INFO') {
    sendResponse(lastDetectedFont);
  }
});
