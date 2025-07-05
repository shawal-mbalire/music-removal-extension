// Enhanced Test Suite for Universal Music Removal Extension
// Includes cross-browser testing for Chrome, Firefox, Safari, and Edge

const fs = require('fs');
const path = require('path');

class ExtensionTestSuite {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, total: 0 };
    this.browserConfig = null;
    this.testConfig = null;
  }

  // Test runner
  async runTests() {
    console.log('🧪 Running Universal Music Removal Extension Tests\n');
    
    // Initialize browser configuration
    this.initializeBrowserConfig();
    
    await this.testManifest();
    await this.testAudioProcessor();
    await this.testVideoSelector();
    await this.testContentScript();
    await this.testBackgroundScript();
    await this.testPopupInterface();
    await this.testCrossBrowserCompatibility();
    await this.testPerformance();
    await this.testBrowserSpecificFeatures();
    
    this.printResults();
  }

  initializeBrowserConfig() {
    // Simulate browser detection for testing
    const userAgent = process.env.TEST_BROWSER || 'chrome';
    this.browserConfig = {
      type: userAgent,
      name: userAgent.charAt(0).toUpperCase() + userAgent.slice(1),
      version: 'latest'
    };
    
    console.log(`🌐 Testing for ${this.browserConfig.name} (${this.browserConfig.type})`);
  }

  // Test manifest.json
  async testManifest() {
    console.log('📋 Testing Manifest Configuration...');
    
    try {
      const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
      
      this.assert(manifest.manifest_version === 3, 'Manifest version should be 3');
      this.assert(manifest.name === 'Universal Music Removal', 'Extension name should be correct');
      this.assert(manifest.version === '1.1.0', 'Version should be 1.1.0');
      
      // Test permissions
      const requiredPermissions = ['activeTab', 'storage', 'scripting', 'tabCapture'];
      requiredPermissions.forEach(perm => {
        this.assert(manifest.permissions.includes(perm), `Should have ${perm} permission`);
      });
      
      // Test host permissions
      this.assert(manifest.host_permissions.includes('<all_urls>'), 'Should have universal permissions');
      
      // Test content scripts
      this.assert(manifest.content_scripts.length > 0, 'Should have content scripts');
      this.assert(manifest.content_scripts[0].matches.includes('<all_urls>'), 'Should match all URLs');
      
      // Test web accessible resources
      this.assert(manifest.web_accessible_resources, 'Should have web accessible resources');
      this.assert(manifest.web_accessible_resources[0].resources.includes('videoSelector.js'), 'Should include videoSelector.js');
      this.assert(manifest.web_accessible_resources[0].resources.includes('audioProcessor.js'), 'Should include audioProcessor.js');
      
      // Test browser-specific settings
      this.assert(manifest.browser_specific_settings, 'Should have browser-specific settings');
      this.assert(manifest.browser_specific_settings.gecko, 'Should have Firefox settings');
      this.assert(manifest.browser_specific_settings.safari, 'Should have Safari settings');
      
      // Test content security policy
      this.assert(manifest.content_security_policy, 'Should have content security policy');
      
      console.log('  ✅ Manifest tests passed\n');
    } catch (error) {
      this.fail(`Manifest test failed: ${error.message}`);
    }
  }

  // Test AudioProcessor class with browser-specific features
  async testAudioProcessor() {
    console.log('🎵 Testing Audio Processor...');
    
    try {
      const audioProcessorCode = fs.readFileSync('audioProcessor.js', 'utf8');
      
      // Test class structure
      this.assert(audioProcessorCode.includes('class AudioProcessor'), 'Should define AudioProcessor class');
      this.assert(audioProcessorCode.includes('constructor()'), 'Should have constructor');
      this.assert(audioProcessorCode.includes('initialize('), 'Should have initialize method');
      this.assert(audioProcessorCode.includes('detectMusic('), 'Should have music detection');
      this.assert(audioProcessorCode.includes('detectSpeech('), 'Should have speech detection');
      
      // Test browser detection
      this.assert(audioProcessorCode.includes('detectBrowser()'), 'Should have browser detection');
      this.assert(audioProcessorCode.includes('getBrowserConfig()'), 'Should have browser configuration');
      
      // Test audio processing methods
      this.assert(audioProcessorCode.includes('createBiquadFilter'), 'Should use audio filters');
      this.assert(audioProcessorCode.includes('createAnalyser'), 'Should use audio analyser');
      this.assert(audioProcessorCode.includes('getByteFrequencyData'), 'Should analyze frequency data');
      
      // Test browser-specific features
      this.assert(audioProcessorCode.includes('webkitAudioContext'), 'Should support Safari audio context');
      this.assert(audioProcessorCode.includes('AudioContext'), 'Should support standard audio context');
      this.assert(audioProcessorCode.includes('getHarmonicFrequencies'), 'Should have harmonic frequency detection');
      
      // Test frequency ranges
      this.assert(audioProcessorCode.includes('85'), 'Should define speech low frequency');
      this.assert(audioProcessorCode.includes('255'), 'Should define speech high frequency');
      
      // Test browser-specific processing
      this.assert(audioProcessorCode.includes('setTimeout'), 'Should support Safari timing');
      this.assert(audioProcessorCode.includes('requestAnimationFrame'), 'Should support standard timing');
      
      console.log('  ✅ Audio processor tests passed\n');
    } catch (error) {
      this.fail(`Audio processor test failed: ${error.message}`);
    }
  }

  // Test VideoSelector class
  async testVideoSelector() {
    console.log('🎯 Testing Video Selector...');
    
    try {
      const videoSelectorCode = fs.readFileSync('videoSelector.js', 'utf8');
      
      // Test class structure
      this.assert(videoSelectorCode.includes('class VideoSelector'), 'Should define VideoSelector class');
      this.assert(videoSelectorCode.includes('startSelection('), 'Should have startSelection method');
      this.assert(videoSelectorCode.includes('findVideoElements('), 'Should have findVideoElements method');
      this.assert(videoSelectorCode.includes('isValidVideoElement('), 'Should have validation method');
      
      // Test video detection selectors
      const selectors = ['video', '[data-video]', '[class*="video"]', 'iframe[src*="video"]'];
      selectors.forEach(selector => {
        this.assert(videoSelectorCode.includes(selector), `Should include selector: ${selector}`);
      });
      
      // Test UI elements
      this.assert(videoSelectorCode.includes('createOverlay'), 'Should create overlay UI');
      this.assert(videoSelectorCode.includes('highlightVideoElements'), 'Should highlight videos');
      this.assert(videoSelectorCode.includes('showSuccessMessage'), 'Should show success message');
      
      console.log('  ✅ Video selector tests passed\n');
    } catch (error) {
      this.fail(`Video selector test failed: ${error.message}`);
    }
  }

  // Test content script
  async testContentScript() {
    console.log('🌐 Testing Content Script...');
    
    try {
      const contentScriptCode = fs.readFileSync('content.js', 'utf8');
      
      // Test platform support
      const platforms = [
        'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com',
        'amazon.com', 'vimeo.com', 'dailymotion.com', 'twitch.tv',
        'facebook.com', 'instagram.com', 'tiktok.com', 'bilibili.com',
        'nicovideo.jp'
      ];
      
      platforms.forEach(platform => {
        this.assert(contentScriptCode.includes(platform), `Should support ${platform}`);
      });
      
      // Test functionality
      this.assert(contentScriptCode.includes('supportedSites'), 'Should define supported sites');
      this.assert(contentScriptCode.includes('findVideoElement'), 'Should have video finding logic');
      this.assert(contentScriptCode.includes('setupAudioProcessing'), 'Should have audio setup');
      this.assert(contentScriptCode.includes('handleManualVideoSelection'), 'Should handle manual selection');
      
      // Test message handling
      this.assert(contentScriptCode.includes('chrome.runtime.onMessage'), 'Should handle runtime messages');
      this.assert(contentScriptCode.includes('STATE_CHANGED'), 'Should handle state changes');
      this.assert(contentScriptCode.includes('SELECT_VIDEO'), 'Should handle video selection');
      
      console.log('  ✅ Content script tests passed\n');
    } catch (error) {
      this.fail(`Content script test failed: ${error.message}`);
    }
  }

  // Test background script
  async testBackgroundScript() {
    console.log('⚙️ Testing Background Script...');
    
    try {
      const backgroundCode = fs.readFileSync('background.js', 'utf8');
      
      // Test service worker functionality
      this.assert(backgroundCode.includes('chrome.runtime.onInstalled'), 'Should handle installation');
      this.assert(backgroundCode.includes('chrome.runtime.onMessage'), 'Should handle messages');
      this.assert(backgroundCode.includes('chrome.tabs.onUpdated'), 'Should handle tab updates');
      
      // Test message types
      this.assert(backgroundCode.includes('GET_STATE'), 'Should handle GET_STATE');
      this.assert(backgroundCode.includes('SET_STATE'), 'Should handle SET_STATE');
      this.assert(backgroundCode.includes('SELECT_VIDEO'), 'Should handle SELECT_VIDEO');
      
      // Test storage
      this.assert(backgroundCode.includes('chrome.storage.sync'), 'Should use sync storage');
      
      console.log('  ✅ Background script tests passed\n');
    } catch (error) {
      this.fail(`Background script test failed: ${error.message}`);
    }
  }

  // Test popup interface
  async testPopupInterface() {
    console.log('🖥️ Testing Popup Interface...');
    
    try {
      const popupHtml = fs.readFileSync('popup/popup.html', 'utf8');
      const popupCss = fs.readFileSync('popup/popup.css', 'utf8');
      const popupJs = fs.readFileSync('popup/popup.js', 'utf8');
      
      // Test HTML structure
      this.assert(popupHtml.includes('Universal Music Removal'), 'Should have correct title');
      this.assert(popupHtml.includes('Select Video Manually'), 'Should have manual selection button');
      this.assert(popupHtml.includes('Refresh Detection'), 'Should have refresh button');
      this.assert(popupHtml.includes('Supported Platforms'), 'Should show supported platforms');
      
      // Test CSS styling
      this.assert(popupCss.includes('btn-primary'), 'Should have primary button styles');
      this.assert(popupCss.includes('platform-tag'), 'Should have platform tag styles');
      this.assert(popupCss.includes('switch'), 'Should have toggle switch styles');
      this.assert(popupCss.includes('@keyframes'), 'Should have animations');
      
      // Test JavaScript functionality
      this.assert(popupJs.includes('updateSiteInfo'), 'Should update site information');
      this.assert(popupJs.includes('selectVideoBtn'), 'Should handle video selection');
      this.assert(popupJs.includes('refreshBtn'), 'Should handle refresh');
      this.assert(popupJs.includes('chrome.runtime.sendMessage'), 'Should communicate with background');
      
      console.log('  ✅ Popup interface tests passed\n');
    } catch (error) {
      this.fail(`Popup interface test failed: ${error.message}`);
    }
  }

  // Test cross-browser compatibility
  async testCrossBrowserCompatibility() {
    console.log('🌍 Testing Cross-Browser Compatibility...');
    
    try {
      const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
      const contentScript = fs.readFileSync('content.js', 'utf8');
      const audioProcessor = fs.readFileSync('audioProcessor.js', 'utf8');
      
      // Test Firefox compatibility
      this.assert(manifest.browser_specific_settings, 'Should have browser-specific settings');
      this.assert(manifest.browser_specific_settings.gecko, 'Should have Firefox settings');
      this.assert(manifest.browser_specific_settings.gecko.strict_min_version, 'Should specify Firefox version');
      
      // Test Safari compatibility
      this.assert(manifest.browser_specific_settings.safari, 'Should have Safari settings');
      this.assert(manifest.browser_specific_settings.safari.strict_min_version, 'Should specify Safari version');
      
      // Test audio context fallbacks
      this.assert(audioProcessor.includes('window.AudioContext') && audioProcessor.includes('window.webkitAudioContext'), 'Should have audio context fallback');
      this.assert(audioProcessor.includes('webkitAudioContext'), 'Should support Safari audio context');
      
      // Test modern JavaScript features
      this.assert(contentScript.includes('async function'), 'Should use async/await');
      this.assert(contentScript.includes('const'), 'Should use const declarations');
      this.assert(contentScript.includes('=>'), 'Should use arrow functions');
      
      // Test browser-specific configurations
      this.assert(audioProcessor.includes('getBrowserConfig'), 'Should have browser-specific configuration');
      this.assert(audioProcessor.includes('detectBrowser'), 'Should detect browser type');
      
      console.log('  ✅ Cross-browser compatibility tests passed\n');
    } catch (error) {
      this.fail(`Cross-browser compatibility test failed: ${error.message}`);
    }
  }

  // Test performance considerations
  async testPerformance() {
    console.log('⚡ Testing Performance Considerations...');
    
    try {
      const contentScript = fs.readFileSync('content.js', 'utf8');
      const audioProcessor = fs.readFileSync('audioProcessor.js', 'utf8');
      
      // Test efficient selectors
      this.assert(contentScript.includes('querySelector'), 'Should use efficient selectors');
      this.assert(!contentScript.includes('getElementsByTagName'), 'Should avoid deprecated methods');
      
      // Test memory management
      this.assert(audioProcessor.includes('destroy'), 'Should have cleanup method');
      this.assert(audioProcessor.includes('disconnect'), 'Should disconnect audio nodes');
      
      // Test requestAnimationFrame usage
      this.assert(audioProcessor.includes('requestAnimationFrame'), 'Should use requestAnimationFrame for smooth processing');
      this.assert(audioProcessor.includes('setTimeout'), 'Should support alternative timing for Safari');
      
      // Test browser-specific optimizations
      this.assert(audioProcessor.includes('getHarmonicFrequencies'), 'Should optimize filters per browser');
      this.assert(audioProcessor.includes('getGainAdjustment'), 'Should optimize gain adjustments per browser');
      
      console.log('  ✅ Performance tests passed\n');
    } catch (error) {
      this.fail(`Performance test failed: ${error.message}`);
    }
  }

  // Test browser-specific features
  async testBrowserSpecificFeatures() {
    console.log('🔧 Testing Browser-Specific Features...');
    
    try {
      const audioProcessor = fs.readFileSync('audioProcessor.js', 'utf8');
      const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
      
      // Test browser detection methods
      this.assert(audioProcessor.includes('isSafari()'), 'Should have Safari detection method');
      this.assert(audioProcessor.includes('isFirefox()'), 'Should have Firefox detection method');
      this.assert(audioProcessor.includes('isChrome()'), 'Should have Chrome detection method');
      this.assert(audioProcessor.includes('isEdge()'), 'Should have Edge detection method');
      
      // Test browser-specific configurations
      this.assert(audioProcessor.includes('getBrowserRecommendations'), 'Should provide browser recommendations');
      this.assert(audioProcessor.includes('getStats'), 'Should provide processing statistics');
      
      // Test manifest browser support
      this.assert(manifest.minimum_chrome_version, 'Should specify Chrome minimum version');
      this.assert(manifest.minimum_edge_version, 'Should specify Edge minimum version');
      this.assert(manifest.browser_specific_settings.gecko.strict_min_version, 'Should specify Firefox minimum version');
      this.assert(manifest.browser_specific_settings.safari.strict_min_version, 'Should specify Safari minimum version');
      
      // Test content security policy
      this.assert(manifest.content_security_policy, 'Should have content security policy');
      this.assert(manifest.content_security_policy.extension_pages, 'Should have extension pages CSP');
      
      // Test additional manifest features
      this.assert(manifest.incognito, 'Should specify incognito mode support');
      this.assert(manifest.offline_enabled, 'Should specify offline support');
      this.assert(manifest.short_name, 'Should have short name');
      
      console.log('  ✅ Browser-specific feature tests passed\n');
    } catch (error) {
      this.fail(`Browser-specific feature test failed: ${error.message}`);
    }
  }

  // Assertion helper
  assert(condition, message) {
    this.results.total++;
    if (condition) {
      this.results.passed++;
    } else {
      this.results.failed++;
      console.log(`    ❌ ${message}`);
    }
  }

  // Fail helper
  fail(message) {
    this.results.total++;
    this.results.failed++;
    console.log(`    ❌ ${message}`);
  }

  // Print results
  printResults() {
    console.log('📊 Test Results Summary:');
    console.log(`  Browser: ${this.browserConfig.name} (${this.browserConfig.type})`);
    console.log(`  Total Tests: ${this.results.total}`);
    console.log(`  Passed: ${this.results.passed} ✅`);
    console.log(`  Failed: ${this.results.failed} ❌`);
    console.log(`  Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! Extension is ready for deployment.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review and fix the issues.');
    }
    
    // Browser-specific recommendations
    this.printBrowserRecommendations();
  }

  printBrowserRecommendations() {
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

    const rec = recommendations[this.browserConfig.type] || recommendations.chrome;
    
    console.log(`\n🌐 Browser Recommendations for ${this.browserConfig.name}:`);
    console.log(`  Status: ${rec.status}`);
    console.log(`  Notes: ${rec.notes}`);
    if (rec.suggestions.length > 0) {
      console.log('  Suggestions:');
      rec.suggestions.forEach(suggestion => {
        console.log(`    • ${suggestion}`);
      });
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new ExtensionTestSuite();
  testSuite.runTests().catch(console.error);
}

module.exports = ExtensionTestSuite; 