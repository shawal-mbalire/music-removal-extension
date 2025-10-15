// Browser-Specific Testing Configuration
// Supports Chrome, Firefox, Safari, and Edge testing

class BrowserTestConfig {
  constructor() {
    this.browserType = this.detectBrowser();
    this.config = this.getBrowserConfig();
  }

  detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('firefox')) {return 'firefox';}
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {return 'safari';}
    if (userAgent.includes('edge')) {return 'edge';}
    if (userAgent.includes('chrome')) {return 'chrome';}
    return 'unknown';
  }

  getBrowserConfig() {
    const configs = {
      chrome: {
        name: 'Chrome',
        minVersion: '88',
        audioContext: 'AudioContext',
        webAudioSupport: 'full',
        extensionAPI: 'full',
        testTimeout: 5000,
        audioTestDelay: 1000,
        features: ['audioContext', 'webAudio', 'extensionAPI', 'serviceWorker']
      },
      firefox: {
        name: 'Firefox',
        minVersion: '109',
        audioContext: 'AudioContext',
        webAudioSupport: 'full',
        extensionAPI: 'full',
        testTimeout: 6000,
        audioTestDelay: 1500,
        features: ['audioContext', 'webAudio', 'extensionAPI', 'serviceWorker']
      },
      safari: {
        name: 'Safari',
        minVersion: '14',
        audioContext: 'webkitAudioContext',
        webAudioSupport: 'limited',
        extensionAPI: 'partial',
        testTimeout: 8000,
        audioTestDelay: 2000,
        features: ['audioContext', 'webAudio', 'extensionAPI']
      },
      edge: {
        name: 'Edge',
        minVersion: '88',
        audioContext: 'AudioContext',
        webAudioSupport: 'full',
        extensionAPI: 'full',
        testTimeout: 5000,
        audioTestDelay: 1000,
        features: ['audioContext', 'webAudio', 'extensionAPI', 'serviceWorker']
      },
      unknown: {
        name: 'Unknown',
        minVersion: '88',
        audioContext: 'AudioContext',
        webAudioSupport: 'unknown',
        extensionAPI: 'unknown',
        testTimeout: 10000,
        audioTestDelay: 2000,
        features: []
      }
    };

    return configs[this.browserType] || configs.unknown;
  }

  // Browser-specific test configurations
  getTestConfig() {
    return {
      browser: this.config,
      audio: this.getAudioTestConfig(),
      extension: this.getExtensionTestConfig(),
      ui: this.getUITestConfig(),
      performance: this.getPerformanceTestConfig()
    };
  }

  getAudioTestConfig() {
    const baseConfig = {
      sampleRate: 44100,
      bufferSize: 2048,
      testDuration: 5000,
      frequencyRanges: {
        speech: { low: 85, high: 255 },
        music: { low: 20, high: 4000 }
      }
    };

    // Browser-specific audio configurations
    const browserConfigs = {
      chrome: {
        ...baseConfig,
        bufferSize: 2048,
        smoothingFactor: 0.8
      },
      firefox: {
        ...baseConfig,
        bufferSize: 4096,
        smoothingFactor: 0.7
      },
      safari: {
        ...baseConfig,
        bufferSize: 1024,
        smoothingFactor: 0.6,
        testDuration: 3000 // Shorter for Safari
      },
      edge: {
        ...baseConfig,
        bufferSize: 2048,
        smoothingFactor: 0.8
      }
    };

    return browserConfigs[this.browserType] || baseConfig;
  }

  getExtensionTestConfig() {
    return {
      permissions: ['activeTab', 'storage', 'scripting', 'tabCapture'],
      hostPermissions: ['<all_urls>'],
      contentScripts: ['content.js'],
      backgroundScripts: ['background.js'],
      webAccessibleResources: ['videoSelector.js', 'audioProcessor.js'],
      testSites: this.getTestSites()
    };
  }

  getTestSites() {
    return {
      primary: [
        'https://www.youtube.com',
        'https://www.netflix.com',
        'https://www.hulu.com'
      ],
      secondary: [
        'https://www.vimeo.com',
        'https://www.dailymotion.com',
        'https://www.twitch.tv'
      ],
      social: [
        'https://www.facebook.com',
        'https://www.instagram.com',
        'https://www.tiktok.com'
      ]
    };
  }

  getUITestConfig() {
    return {
      popupSize: { width: 400, height: 600 },
      colorScheme: 'light',
      animations: true,
      accessibility: true,
      responsive: true
    };
  }

  getPerformanceTestConfig() {
    const baseConfig = {
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxCpuUsage: 30, // 30%
      maxLatency: 100, // 100ms
      frameRate: 60
    };

    // Browser-specific performance thresholds
    const browserConfigs = {
      chrome: {
        ...baseConfig,
        maxMemoryUsage: 80 * 1024 * 1024, // 80MB
        maxLatency: 80
      },
      firefox: {
        ...baseConfig,
        maxMemoryUsage: 120 * 1024 * 1024, // 120MB
        maxLatency: 120
      },
      safari: {
        ...baseConfig,
        maxMemoryUsage: 150 * 1024 * 1024, // 150MB
        maxLatency: 150,
        frameRate: 30 // Safari may have lower frame rates
      },
      edge: {
        ...baseConfig,
        maxMemoryUsage: 80 * 1024 * 1024, // 80MB
        maxLatency: 80
      }
    };

    return browserConfigs[this.browserType] || baseConfig;
  }

  // Browser-specific test methods
  async runBrowserTests() {
    console.log(`🧪 Running tests for ${this.config.name} (${this.browserType})`);

    const results = {
      browser: this.config.name,
      version: this.getBrowserVersion(),
      tests: {}
    };

    // Run browser-specific tests
    results.tests.audio = await this.testAudioFeatures();
    results.tests.extension = await this.testExtensionFeatures();
    results.tests.ui = await this.testUIFeatures();
    results.tests.performance = await this.testPerformance();

    return results;
  }

  async testAudioFeatures() {
    const tests = {
      audioContext: false,
      webAudio: false,
      mediaElementSource: false,
      analyser: false,
      filters: false
    };

    try {
      // Test AudioContext creation
      const AudioContextClass = window[this.config.audioContext];
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        tests.audioContext = true;

        // Test Web Audio API features
        if (audioContext.createAnalyser) {
          tests.analyser = true;
        }

        if (audioContext.createBiquadFilter) {
          tests.filters = true;
        }

        if (audioContext.createMediaElementSource) {
          tests.mediaElementSource = true;
        }

        tests.webAudio = tests.analyser && tests.filters && tests.mediaElementSource;

        // Cleanup
        if (audioContext.state !== 'closed') {
          await audioContext.close();
        }
      }
    } catch (error) {
      console.error('Audio feature test failed:', error);
    }

    return tests;
  }

  async testExtensionFeatures() {
    const tests = {
      chromeRuntime: false,
      chromeStorage: false,
      chromeTabs: false,
      serviceWorker: false
    };

    try {
      // Test Chrome extension APIs
      if (typeof chrome !== 'undefined') {
        tests.chromeRuntime = !!chrome.runtime;
        tests.chromeStorage = !!chrome.storage;
        tests.chromeTabs = !!chrome.tabs;
        tests.serviceWorker = !!chrome.serviceWorker;
      }
    } catch (error) {
      console.error('Extension feature test failed:', error);
    }

    return tests;
  }

  async testUIFeatures() {
    const tests = {
      cssGrid: false,
      flexbox: false,
      animations: false,
      webFonts: false,
      localStorage: false
    };

    try {
      // Test CSS features
      const testElement = document.createElement('div');
      testElement.style.display = 'grid';
      tests.cssGrid = testElement.style.display === 'grid';

      testElement.style.display = 'flex';
      tests.flexbox = testElement.style.display === 'flex';

      // Test animations
      testElement.style.animation = 'test 1s';
      tests.animations = testElement.style.animation !== '';

      // Test web fonts
      tests.webFonts = 'fonts' in document;

      // Test localStorage
      tests.localStorage = 'localStorage' in window;

    } catch (error) {
      console.error('UI feature test failed:', error);
    }

    return tests;
  }

  async testPerformance() {
    const tests = {
      memoryUsage: 0,
      cpuUsage: 0,
      latency: 0,
      frameRate: 0
    };

    try {
      // Test memory usage (if available)
      if ('memory' in performance) {
        tests.memoryUsage = performance.memory.usedJSHeapSize;
      }

      // Test frame rate
      let frameCount = 0;
      const startTime = performance.now();

      const measureFrameRate = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(measureFrameRate);
        } else {
          tests.frameRate = frameCount;
        }
      };

      requestAnimationFrame(measureFrameRate);

      // Wait for frame rate measurement
      await new Promise(resolve => setTimeout(resolve, 1100));

    } catch (error) {
      console.error('Performance test failed:', error);
    }

    return tests;
  }

  getBrowserVersion() {
    const userAgent = navigator.userAgent;
    const versionMatch = userAgent.match(/(chrome|firefox|safari|edge)\/(\d+)/i);
    return versionMatch ? versionMatch[2] : 'unknown';
  }

  // Browser-specific recommendations
  getRecommendations() {
    const recommendations = {
      chrome: {
        status: 'excellent',
        notes: 'Full feature support, best performance',
        suggestions: []
      },
      firefox: {
        status: 'very-good',
        notes: 'Good support with some audio processing differences',
        suggestions: ['May need user interaction for audio context']
      },
      safari: {
        status: 'good',
        notes: 'Limited support, requires user interaction',
        suggestions: [
          'Audio context requires user interaction',
          'Some features may not work as expected',
          'Consider using manual video selection'
        ]
      },
      edge: {
        status: 'excellent',
        notes: 'Similar to Chrome performance',
        suggestions: []
      }
    };

    return recommendations[this.browserType] || recommendations.chrome;
  }

  // Generate test report
  generateReport(testResults) {
    const recommendations = this.getRecommendations();

    return {
      browser: this.config.name,
      version: this.getBrowserVersion(),
      status: recommendations.status,
      testResults,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in test suite
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserTestConfig;
}
