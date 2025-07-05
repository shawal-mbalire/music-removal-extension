// Video Selector Component
// Allows users to manually select video elements for music removal

class VideoSelector {
  constructor() {
    this.isSelecting = false;
    this.highlightedElements = [];
    this.selectedVideo = null;
    this.overlay = null;
    this.instructions = null;
    this.callback = null;
  }

  startSelection(callback) {
    this.callback = callback;
    this.isSelecting = true;
    this.createOverlay();
    this.addEventListeners();
    this.highlightVideoElements();
    console.log('Video selection mode activated');
  }

  stopSelection() {
    this.isSelecting = false;
    this.removeOverlay();
    this.removeEventListeners();
    this.removeHighlights();
    console.log('Video selection mode deactivated');
  }

  createOverlay() {
    // Create overlay for instructions
    this.overlay = document.createElement('div');
    this.overlay.id = 'music-removal-selector-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999999;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create instructions
    this.instructions = document.createElement('div');
    this.instructions.style.cssText = `
      background: #2c3e50;
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      pointer-events: auto;
      max-width: 400px;
    `;
    this.instructions.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #3498db;">🎵 Select Video for Music Removal</h3>
      <p style="margin: 0 0 15px 0;">Click on any video element to select it for music removal processing.</p>
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #bdc3c7;">Press ESC to cancel</p>
      <button id="cancel-selection" style="
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      ">Cancel</button>
    `;

    this.overlay.appendChild(this.instructions);
    document.body.appendChild(this.overlay);

    // Add cancel button listener
    document.getElementById('cancel-selection').addEventListener('click', () => {
      this.stopSelection();
    });
  }

  removeOverlay() {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
      this.instructions = null;
    }
  }

  highlightVideoElements() {
    const videos = this.findVideoElements();
    
    videos.forEach((video, index) => {
      const highlight = document.createElement('div');
      highlight.className = 'music-removal-video-highlight';
      highlight.style.cssText = `
        position: absolute;
        border: 3px solid #3498db;
        background: rgba(52, 152, 219, 0.2);
        border-radius: 5px;
        pointer-events: none;
        z-index: 999998;
        transition: all 0.2s ease;
        box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
      `;
      
      // Position the highlight
      const rect = video.getBoundingClientRect();
      highlight.style.top = rect.top + 'px';
      highlight.style.left = rect.left + 'px';
      highlight.style.width = rect.width + 'px';
      highlight.style.height = rect.height + 'px';
      
      // Add hover effect
      highlight.addEventListener('mouseenter', () => {
        highlight.style.borderColor = '#e74c3c';
        highlight.style.background = 'rgba(231, 76, 60, 0.3)';
        highlight.style.boxShadow = '0 0 15px rgba(231, 76, 60, 0.7)';
      });
      
      highlight.addEventListener('mouseleave', () => {
        highlight.style.borderColor = '#3498db';
        highlight.style.background = 'rgba(52, 152, 219, 0.2)';
        highlight.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.5)';
      });
      
      // Add click handler
      highlight.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectVideo(video);
      });
      
      document.body.appendChild(highlight);
      this.highlightedElements.push(highlight);
    });

    // Update highlights on scroll/resize
    window.addEventListener('scroll', this.updateHighlights.bind(this));
    window.addEventListener('resize', this.updateHighlights.bind(this));
  }

  updateHighlights() {
    const videos = this.findVideoElements();
    
    this.highlightedElements.forEach((highlight, index) => {
      if (videos[index]) {
        const rect = videos[index].getBoundingClientRect();
        highlight.style.top = rect.top + 'px';
        highlight.style.left = rect.left + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
      }
    });
  }

  removeHighlights() {
    this.highlightedElements.forEach(highlight => {
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
    });
    this.highlightedElements = [];
    
    // Remove event listeners
    window.removeEventListener('scroll', this.updateHighlights.bind(this));
    window.removeEventListener('resize', this.updateHighlights.bind(this));
  }

  findVideoElements() {
    // Find all video elements with various selectors
    const selectors = [
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

    const videos = [];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.isValidVideoElement(element) && !videos.includes(element)) {
          videos.push(element);
        }
      });
    });

    return videos;
  }

  isValidVideoElement(element) {
    // Check if element is a valid video element
    if (element.tagName === 'VIDEO') {
      return true;
    }
    
    if (element.tagName === 'IFRAME') {
      const src = element.src || '';
      return src.includes('video') || src.includes('player') || src.includes('embed');
    }
    
    if (element.tagName === 'EMBED' || element.tagName === 'OBJECT') {
      const type = element.type || '';
      return type.includes('video') || type.includes('application/x-shockwave-flash');
    }
    
    // Check for video-related attributes
    const hasVideoAttr = element.hasAttribute('data-video') || 
                        element.hasAttribute('data-player') ||
                        element.className.includes('video') ||
                        element.id.includes('video') ||
                        element.className.includes('player') ||
                        element.id.includes('player');
    
    return hasVideoAttr;
  }

  selectVideo(video) {
    this.selectedVideo = video;
    this.stopSelection();
    
    if (this.callback) {
      this.callback(video);
    }
    
    // Show success message
    this.showSuccessMessage(video);
  }

  showSuccessMessage(video) {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 1000000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    `;
    
    message.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">✅</span>
        <div>
          <div style="font-weight: bold;">Video Selected!</div>
          <div style="font-size: 12px; opacity: 0.8;">Music removal will be applied to this video</div>
        </div>
      </div>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(message);
    
    // Remove message after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 3000);
  }

  addEventListeners() {
    // Add ESC key listener
    this.escListener = (e) => {
      if (e.key === 'Escape') {
        this.stopSelection();
      }
    };
    document.addEventListener('keydown', this.escListener);
    
    // Add click outside listener
    this.clickOutsideListener = (e) => {
      if (e.target === this.overlay) {
        this.stopSelection();
      }
    };
    document.addEventListener('click', this.clickOutsideListener);
  }

  removeEventListeners() {
    if (this.escListener) {
      document.removeEventListener('keydown', this.escListener);
      this.escListener = null;
    }
    
    if (this.clickOutsideListener) {
      document.removeEventListener('click', this.clickOutsideListener);
      this.clickOutsideListener = null;
    }
  }

  getSelectedVideo() {
    return this.selectedVideo;
  }

  isSelectionActive() {
    return this.isSelecting;
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoSelector;
} else {
  window.VideoSelector = VideoSelector;
} 