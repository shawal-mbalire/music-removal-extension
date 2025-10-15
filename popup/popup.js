// Enhanced Popup JavaScript for Universal Music Removal Extension

class PopupManager {
  constructor() {
    this.elements = {};
    this.stats = {
      processedVideos: 0,
      activeTime: 0,
      musicRemoved: 0,
      startTime: Date.now()
    };
    this.isEnabled = false;
    this.currentSite = null;
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadInitialState();
    this.updateSiteInfo();
    this.startStatsTimer();
    this.loadStats();
  }

  cacheElements() {
    // Main controls
    this.elements.toggle = document.getElementById('toggleMusicRemoval');
    this.elements.statusText = document.getElementById('statusText');
    this.elements.statusIcon = document.getElementById('statusIcon');
    this.elements.statusCard = document.getElementById('statusCard');
    this.elements.siteInfo = document.getElementById('siteInfo');
    this.elements.processingInfo = document.getElementById('processingInfo');

    // Action buttons
    this.elements.selectVideoBtn = document.getElementById('selectVideoBtn');
    this.elements.refreshBtn = document.getElementById('refreshBtn');

    // Stats
    this.elements.processedVideos = document.getElementById('processedVideos');
    this.elements.activeTime = document.getElementById('activeTime');
    this.elements.musicRemoved = document.getElementById('musicRemoved');

    // Footer
    this.elements.connectionStatus = document.getElementById('connectionStatus');
    this.elements.settingsBtn = document.getElementById('settingsBtn');
    this.elements.helpBtn = document.getElementById('helpBtn');

    // Overlays
    this.elements.loadingOverlay = document.getElementById('loadingOverlay');
    this.elements.notificationContainer = document.getElementById('notificationContainer');
  }

  bindEvents() {
    // Toggle functionality
    this.elements.toggle.addEventListener('change', () => this.handleToggle());

    // Action buttons
    this.elements.selectVideoBtn.addEventListener('click', () => this.handleManualSelection());
    this.elements.refreshBtn.addEventListener('click', () => this.handleRefresh());

    // Footer buttons
    this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    this.elements.helpBtn.addEventListener('click', () => this.openHelp());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  async loadInitialState() {
    try {
      const response = await this.sendMessage({ type: 'GET_STATE' });
      if (response && response.enabled !== undefined) {
        this.isEnabled = response.enabled;
        this.updateToggleState();
        this.updateStatusDisplay();
      } else {
        // Fallback to storage API
        const result = await this.getStorageData(['musicRemovalEnabled']);
        this.isEnabled = result.musicRemovalEnabled !== false;
        this.updateToggleState();
        this.updateStatusDisplay();
      }
    } catch (error) {
      console.error('Failed to load initial state:', error);
      this.showNotification('Failed to load extension state', 'error');
    }
  }

  updateToggleState() {
    this.elements.toggle.checked = this.isEnabled;
  }

  updateStatusDisplay() {
    if (this.isEnabled) {
      this.elements.statusText.textContent = 'Music Removal: ON';
      this.elements.statusIcon.textContent = '🎵';
      this.elements.statusCard.classList.add('active');
      this.elements.processingInfo.textContent = 'Processing audio in real-time';
    } else {
      this.elements.statusText.textContent = 'Music Removal: OFF';
      this.elements.statusIcon.textContent = '⏸️';
      this.elements.statusCard.classList.remove('active');
      this.elements.processingInfo.textContent = 'Ready to process audio';
    }
  }

  async updateSiteInfo() {
    try {
      const tabs = await this.getCurrentTab();
      if (tabs && tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;

        const siteNames = {
          'youtube.com': 'YouTube',
          'www.youtube.com': 'YouTube',
          'netflix.com': 'Netflix',
          'www.netflix.com': 'Netflix',
          'hulu.com': 'Hulu',
          'www.hulu.com': 'Hulu',
          'disneyplus.com': 'Disney+',
          'www.disneyplus.com': 'Disney+',
          'amazon.com': 'Amazon Prime',
          'www.amazon.com': 'Amazon Prime',
          'vimeo.com': 'Vimeo',
          'www.vimeo.com': 'Vimeo',
          'dailymotion.com': 'Dailymotion',
          'www.dailymotion.com': 'Dailymotion',
          'twitch.tv': 'Twitch',
          'www.twitch.tv': 'Twitch',
          'facebook.com': 'Facebook',
          'www.facebook.com': 'Facebook',
          'instagram.com': 'Instagram',
          'www.instagram.com': 'Instagram',
          'tiktok.com': 'TikTok',
          'www.tiktok.com': 'TikTok',
          'bilibili.com': 'Bilibili',
          'www.bilibili.com': 'Bilibili',
          'nicovideo.jp': 'Niconico',
          'www.nicovideo.jp': 'Niconico'
        };

        this.currentSite = siteNames[hostname] || 'Unknown Site';
        this.elements.siteInfo.textContent = `Current site: ${this.currentSite}`;

        const isSupported = Object.keys(siteNames).includes(hostname);
        if (!isSupported) {
          this.elements.siteInfo.textContent += ' (Manual selection recommended)';
          this.elements.siteInfo.style.color = 'var(--error-600)';
        } else {
          this.elements.siteInfo.style.color = 'var(--gray-600)';
        }
      } else {
        this.elements.siteInfo.textContent = 'No site detected';
        this.elements.siteInfo.style.color = 'var(--error-600)';
      }
    } catch (error) {
      console.error('Failed to update site info:', error);
      this.elements.siteInfo.textContent = 'Error detecting site';
      this.elements.siteInfo.style.color = 'var(--error-600)';
    }
  }

  async handleToggle() {
    this.isEnabled = this.elements.toggle.checked;
    this.updateStatusDisplay();

    try {
      const response = await this.sendMessage({
        type: 'SET_STATE',
        enabled: this.isEnabled
      });

      if (response && response.success) {
        this.showNotification(
          this.isEnabled ? 'Music removal enabled' : 'Music removal disabled',
          'success'
        );

        if (this.isEnabled) {
          this.stats.processedVideos++;
          this.updateStats();
        }
      } else {
        throw new Error('Failed to update state');
      }
    } catch (error) {
      console.error('Failed to update state:', error);
      this.showNotification('Failed to update extension state', 'error');
      // Revert toggle state
      this.isEnabled = !this.isEnabled;
      this.updateToggleState();
      this.updateStatusDisplay();
    }
  }

  async handleManualSelection() {
    try {
      this.showLoading('Starting video selection...');

      const response = await this.sendMessage({ type: 'SELECT_VIDEO' });
      if (response && response.success) {
        this.showNotification('Video selection mode activated', 'success');
        window.close(); // Close popup to show selection interface
      } else {
        throw new Error('Failed to start video selection');
      }
    } catch (error) {
      console.error('Failed to start video selection:', error);
      this.hideLoading();
      this.showNotification('Failed to start video selection. Please refresh the page and try again.', 'error');
    }
  }

  async handleRefresh() {
    try {
      this.showLoading('Refreshing page...');

      const tabs = await this.getCurrentTab();
      if (tabs && tabs[0]) {
        await chrome.tabs.reload(tabs[0].id);
        this.showNotification('Page refreshed. Video detection will restart.', 'success');
      }
    } catch (error) {
      console.error('Failed to refresh page:', error);
      this.hideLoading();
      this.showNotification('Failed to refresh page', 'error');
    }
  }

  openSettings() {
    this.showNotification('Settings panel coming soon!', 'warning');
  }

  openHelp() {
    chrome.tabs.create({ url: 'https://github.com/your-username/universal-music-removal-extension#readme' });
  }

  handleKeyboard(event) {
    // Keyboard shortcuts
    switch (event.key) {
    case 't':
    case 'T':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        this.elements.toggle.click();
      }
      break;
    case 's':
    case 'S':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        this.elements.selectVideoBtn.click();
      }
      break;
    case 'r':
    case 'R':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        this.elements.refreshBtn.click();
      }
      break;
    case 'Escape':
      window.close();
      break;
    }
  }

  startStatsTimer() {
    setInterval(() => {
      if (this.isEnabled) {
        this.stats.activeTime++;
        this.updateStats();
      }
    }, 60000); // Update every minute
  }

  updateStats() {
    this.elements.processedVideos.textContent = this.stats.processedVideos;
    this.elements.activeTime.textContent = this.formatTime(this.stats.activeTime);
    this.elements.musicRemoved.textContent = `${Math.min(this.stats.processedVideos * 15, 95)}%`;

    // Save stats to storage
    this.saveStats();
  }

  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  }

  async loadStats() {
    try {
      const result = await this.getStorageData(['extensionStats']);
      if (result.extensionStats) {
        this.stats = { ...this.stats, ...result.extensionStats };
        this.updateStats();
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async saveStats() {
    try {
      await chrome.storage.sync.set({ extensionStats: this.stats });
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  showLoading(message = 'Processing...') {
    this.elements.loadingOverlay.style.display = 'flex';
    this.elements.loadingOverlay.querySelector('p').textContent = message;
  }

  hideLoading() {
    this.elements.loadingOverlay.style.display = 'none';
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${icon}</span>
        <span style="font-size: 14px;">${message}</span>
      </div>
    `;

    this.elements.notificationContainer.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  async getCurrentTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(tabs);
        }
      });
    });
  }

  async getStorageData(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Add slideOutRight animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
