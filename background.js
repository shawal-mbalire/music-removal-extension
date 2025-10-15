// Background service worker for Universal Music Removal Extension

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Universal Music Removal Extension installed');
  // Set default state
  chrome.storage.sync.set({ musicRemovalEnabled: true });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_STATE') {
    chrome.storage.sync.get(['musicRemovalEnabled'], (result) => {
      sendResponse({ enabled: result.musicRemovalEnabled !== false });
    });
    return true; // Keep message channel open for async response
  }

  if (request.type === 'SET_STATE') {
    chrome.storage.sync.set({ musicRemovalEnabled: request.enabled });
    // Notify all tabs about state change
    chrome.tabs.query({ url: ['<all_urls>'] }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'STATE_CHANGED',
          enabled: request.enabled
        }).catch(() => {
          // Tab might not be ready, ignore errors
        });
      });
    });
    sendResponse({ success: true });
  }

  if (request.type === 'SELECT_VIDEO') {
    // Forward video selection request to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SELECT_VIDEO'
        }).catch(() => {
          // Tab might not be ready, ignore errors
        });
      }
    });
    sendResponse({ success: true });
  }
});

// Handle tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Check if this is a video platform
    const videoPlatforms = [
      'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com',
      'amazon.com', 'vimeo.com', 'dailymotion.com', 'twitch.tv',
      'facebook.com', 'instagram.com', 'tiktok.com', 'bilibili.com',
      'nicovideo.jp'
    ];

    const isVideoPlatform = videoPlatforms.some(platform =>
      tab.url && tab.url.includes(platform)
    );

    if (isVideoPlatform || tab.url) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(() => {
        // Script might already be injected, ignore errors
      });
    }
  }
});

// Handle extension icon click for quick access
chrome.action.onClicked.addListener((tab) => {
  // Open popup or toggle state
  chrome.storage.sync.get(['musicRemovalEnabled'], (result) => {
    const currentState = result.musicRemovalEnabled !== false;
    const newState = !currentState;

    chrome.storage.sync.set({ musicRemovalEnabled: newState });

    // Notify content script
    chrome.tabs.sendMessage(tab.id, {
      type: 'STATE_CHANGED',
      enabled: newState
    }).catch(() => {
      // Tab might not be ready, ignore errors
    });
  });
});
