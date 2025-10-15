// Universal Music Removal Content Script
// Handles video detection and audio processing across multiple platforms

console.log('Universal Music Removal Extension Loaded');

// Global state
let audioProcessor = null;
let videoSelector = null;
let isEnabled = true;
let currentVideo = null;
let isProcessing = false;
const supportedSites = {
  'youtube.com': {
    selectors: ['video', '#movie_player video', '.html5-video-player video', 'ytd-player video'],
    name: 'YouTube'
  },
  'netflix.com': {
    selectors: ['video', '[data-uia="video-player"] video', '.VideoPlayer video'],
    name: 'Netflix'
  },
  'hulu.com': {
    selectors: ['video', '.video-player video', '[data-testid="video-player"] video'],
    name: 'Hulu'
  },
  'disneyplus.com': {
    selectors: ['video', '.video-player video', '[data-testid="video"]'],
    name: 'Disney+'
  },
  'amazon.com': {
    selectors: ['video', '.video-player video', '[data-testid="video-player"] video'],
    name: 'Amazon Prime'
  },
  'vimeo.com': {
    selectors: ['video', '.vp-video video', '[data-testid="video-player"] video'],
    name: 'Vimeo'
  },
  'dailymotion.com': {
    selectors: ['video', '.dmp_Video video', '[data-testid="video"]'],
    name: 'Dailymotion'
  },
  'twitch.tv': {
    selectors: ['video', '.video-player video', '[data-testid="video-player"] video'],
    name: 'Twitch'
  },
  'facebook.com': {
    selectors: ['video', '.video-player video', '[data-testid="video"]'],
    name: 'Facebook'
  },
  'instagram.com': {
    selectors: ['video', '.video-player video', '[data-testid="video"]'],
    name: 'Instagram'
  },
  'tiktok.com': {
    selectors: ['video', '.video-player video', '[data-testid="video"]'],
    name: 'TikTok'
  },
  'bilibili.com': {
    selectors: ['video', '.video-player video', '[data-testid="video"]'],
    name: 'Bilibili'
  },
  'nicovideo.jp': {
    selectors: ['video', '.video-player video', '[data-testid="video"]'],
    name: 'Niconico'
  }
};

// Load required scripts
async function loadScripts() {
  try {
    // Load audio processor
    const audioScript = document.createElement('script');
    audioScript.src = chrome.runtime.getURL('audioProcessor.js');
    audioScript.onload = () => console.log('Audio processor loaded successfully');
    document.head.appendChild(audioScript);

    // Load video selector
    const selectorScript = document.createElement('script');
    selectorScript.src = chrome.runtime.getURL('videoSelector.js');
    selectorScript.onload = () => {
      console.log('Video selector loaded successfully');
      videoSelector = new window.VideoSelector();
    };
    document.head.appendChild(selectorScript);

  } catch (error) {
    console.error('Error loading scripts:', error);
  }
}

// Initialize video processing
async function initializeVideoProcessing() {
  if (isProcessing) {return;}

  const video = findVideoElement();
  if (!video) {
    console.log('No video element found, waiting...');
    return;
  }

  if (video === currentVideo) {
    console.log('Video already being processed');
    return;
  }

  currentVideo = video;
  isProcessing = true;

  try {
    // Wait for video to be ready
    if (video.readyState < 2) {
      video.addEventListener('loadeddata', () => setupAudioProcessing(video), { once: true });
    } else {
      await setupAudioProcessing(video);
    }
  } catch (error) {
    console.error('Failed to initialize video processing:', error);
    isProcessing = false;
  }
}

// Find video element with platform-specific selectors
function findVideoElement() {
  const currentDomain = window.location.hostname;
  let siteConfig = null;

  // Find matching site configuration
  for (const [domain, config] of Object.entries(supportedSites)) {
    if (currentDomain.includes(domain)) {
      siteConfig = config;
      break;
    }
  }

  // Use platform-specific selectors if available
  if (siteConfig) {
    console.log(`Detected ${siteConfig.name}, using platform-specific selectors`);
    for (const selector of siteConfig.selectors) {
      try {
        const videos = document.querySelectorAll(selector);
        for (const video of videos) {
          if (this.isValidVideoElement(video)) {
            return video;
          }
        }
      } catch (error) {
        console.warn(`Failed to query selector ${selector}:`, error);
      }
    }
  }

  // Fallback to generic video detection with enhanced logic
  console.log('Using enhanced generic video detection');
  const genericSelectors = [
    'video',
    '[data-video]',
    '[class*="video"]',
    '[id*="video"]',
    '[class*="player"]',
    '[id*="player"]',
    'iframe[src*="video"]',
    'iframe[src*="player"]',
    'embed[type="video"]',
    'object[type="video"]'
  ];

  for (const selector of genericSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (this.isValidVideoElement(element)) {
          return element;
        }
      }
    } catch (error) {
      console.warn(`Failed to query selector ${selector}:`, error);
    }
  }

  return null;
}

// Enhanced video element validation
function isValidVideoElement(element) {
  try {
    // Must be an element
    if (!element || !element.tagName) {
      return false;
    }

    // Handle different element types
    if (element.tagName.toLowerCase() === 'video') {
      // Direct video element
      return element.src || element.currentSrc || element.srcObject;
    } else if (element.tagName.toLowerCase() === 'iframe') {
      // Iframe - check if it contains video
      return element.src && (
        element.src.includes('video') ||
        element.src.includes('player') ||
        element.src.includes('embed')
      );
    } else if (element.tagName.toLowerCase() === 'embed' || element.tagName.toLowerCase() === 'object') {
      // Embed/object elements
      return element.src || element.data;
    } else {
      // Other elements - check if they contain video
      const videoChild = element.querySelector('video');
      if (videoChild) {
        return this.isValidVideoElement(videoChild);
      }

      // Check for video-related attributes
      const videoAttrs = ['data-video', 'data-player', 'data-src'];
      return videoAttrs.some(attr => element.hasAttribute(attr));
    }
  } catch (error) {
    console.warn('Error validating video element:', error);
    return false;
  }
}

// Setup audio processing for a video element
async function setupAudioProcessing(video) {
  try {
    // Validate video element
    if (!video || !video.src) {
      console.error('Invalid video element provided');
      return;
    }

    // Wait for video to be ready if needed
    if (video.readyState < 2) {
      console.log('Waiting for video to be ready...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video ready timeout'));
        }, 10000); // 10 second timeout

        const handleReady = () => {
          clearTimeout(timeout);
          resolve();
        };

        video.addEventListener('loadeddata', handleReady, { once: true });
        video.addEventListener('error', () => {
          clearTimeout(timeout);
          reject(new Error('Video failed to load'));
        }, { once: true });
      });
    }

    // Clean up existing processor
    if (audioProcessor) {
      audioProcessor.destroy();
      audioProcessor = null;
    }

    // Create new audio processor
    audioProcessor = new window.AudioProcessor();

    // Initialize with video element
    const success = await audioProcessor.initialize(video);

    if (success) {
      console.log('Audio processing setup complete');
      audioProcessor.setEnabled(isEnabled);

      // Add video event listeners with error handling
      const addVideoListener = (event, handler) => {
        try {
          video.addEventListener(event, handler);
        } catch (error) {
          console.warn(`Failed to add ${event} listener:`, error);
        }
      };

      addVideoListener('play', () => {
        if (audioProcessor && isEnabled) {
          audioProcessor.setEnabled(true);
        }
      });

      addVideoListener('pause', () => {
        if (audioProcessor) {
          audioProcessor.setEnabled(false);
        }
      });

      addVideoListener('ended', () => {
        if (audioProcessor) {
          audioProcessor.setEnabled(false);
        }
      });

      addVideoListener('error', (error) => {
        console.error('Video error detected:', error);
        if (audioProcessor) {
          audioProcessor.setEnabled(false);
        }
      });

      // Monitor for video source changes
      const originalSrc = video.src;
      const checkSrcChange = setInterval(() => {
        if (video.src !== originalSrc) {
          console.log('Video source changed, reinitializing...');
          clearInterval(checkSrcChange);
          handleNavigation();
        }
      }, 2000);

    } else {
      console.error('Failed to initialize audio processor');
      // Retry after a delay
      setTimeout(() => {
        if (video && video.src) {
          console.log('Retrying audio processor initialization...');
          setupAudioProcessing(video);
        }
      }, 3000);
    }
  } catch (error) {
    console.error('Error setting up audio processing:', error);

    // Attempt recovery
    if (video && video.src) {
      console.log('Attempting recovery in 5 seconds...');
      setTimeout(() => {
        setupAudioProcessing(video);
      }, 5000);
    }
  } finally {
    isProcessing = false;
  }
}

// Handle manual video selection
function handleManualVideoSelection(video) {
  console.log('Manual video selection:', video);

  // Clean up existing processor
  if (audioProcessor) {
    audioProcessor.destroy();
    audioProcessor = null;
  }

  currentVideo = video;
  setupAudioProcessing(video);
}

// Start manual video selection mode
function startVideoSelection() {
  if (videoSelector && !videoSelector.isSelectionActive()) {
    videoSelector.startSelection(handleManualVideoSelection);
  }
}

// Handle extension state changes
function handleStateChange(enabled) {
  isEnabled = enabled;
  if (audioProcessor) {
    audioProcessor.setEnabled(enabled);
  }
  console.log('Music removal state changed:', enabled);
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STATE_CHANGED') {
    handleStateChange(message.enabled);
    sendResponse({ success: true });
  } else if (message.type === 'SELECT_VIDEO') {
    startVideoSelection();
    sendResponse({ success: true });
  }
});

// Handle YouTube navigation (SPA behavior)
function handleNavigation() {
  // Reset state for new page
  if (audioProcessor) {
    audioProcessor.destroy();
    audioProcessor = null;
  }
  currentVideo = null;
  isProcessing = false;

  // Wait a bit for new content to load
  setTimeout(() => {
    initializeVideoProcessing();
  }, 1000);
}

// Setup navigation detection
function setupNavigationDetection() {
  // Watch for URL changes
  let currentUrl = window.location.href;

  const checkUrlChange = () => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('Navigation detected');
      handleNavigation();
    }
  };

  // Check for URL changes periodically
  setInterval(checkUrlChange, 1000);

  // Enhanced DOM monitoring for dynamic content
  const observer = new MutationObserver((mutations) => {
    let shouldReinitialize = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this looks like a new video page
            if (node.querySelector && (
              node.querySelector('video') ||
              node.querySelector('[class*="video"]') ||
              node.querySelector('[class*="player"]')
            )) {
              console.log('New video element detected');
              shouldReinitialize = true;
              break;
            }

            // Check if the node itself is a video element
            if (node.tagName && node.tagName.toLowerCase() === 'video') {
              console.log('Direct video element added');
              shouldReinitialize = true;
              break;
            }
          }
        }
      } else if (mutation.type === 'attributes') {
        // Watch for attribute changes that might indicate video loading
        if (mutation.attributeName === 'src' ||
            mutation.attributeName === 'data-src' ||
            mutation.attributeName === 'data-video') {
          console.log('Video source attribute changed');
          shouldReinitialize = true;
        }
      }
    }

    if (shouldReinitialize) {
      // Debounce reinitialization to avoid multiple calls
      clearTimeout(window.reinitTimeout);
      window.reinitTimeout = setTimeout(() => {
        initializeVideoProcessing();
      }, 500);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'data-src', 'data-video']
  });

  // Periodic video detection for missed elements
  setInterval(() => {
    if (!currentVideo && !isProcessing) {
      console.log('Periodic video detection check');
      initializeVideoProcessing();
    }
  }, 5000); // Check every 5 seconds
}

// Get initial state from storage
async function getInitialState() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    handleStateChange(response.enabled);
  } catch (error) {
    console.error('Failed to get initial state:', error);
    handleStateChange(true); // Default to enabled
  }
}

// Initialize extension
async function initialize() {
  console.log('Initializing Universal Music Removal Extension');

  // Get initial state
  await getInitialState();

  // Load required scripts
  await loadScripts();

  // Setup navigation detection
  setupNavigationDetection();

  // Initial video processing attempt
  setTimeout(initializeVideoProcessing, 1000);
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (audioProcessor) {
      audioProcessor.setEnabled(false);
    }
  } else {
    if (audioProcessor && isEnabled) {
      audioProcessor.setEnabled(true);
    }
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (audioProcessor) {
    audioProcessor.destroy();
  }
  if (videoSelector) {
    videoSelector.stopSelection();
  }
});
