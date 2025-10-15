// Enhanced Audio Processor with Cross-Browser Compatibility
// Supports Chrome, Firefox, Safari, and Edge

class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.source = null;
    this.analyser = null;
    this.gainNode = null;
    this.worklet = null;
    this.isProcessing = false;
    this.musicThreshold = 0.6;
    this.speechFrequencies = {
      low: 85,    // Hz - lowest speech frequency
      high: 255   // Hz - highest speech frequency
    };
    this.musicPatterns = {
      bass: { low: 20, high: 150 },
      mid: { low: 150, high: 800 },
      treble: { low: 800, high: 4000 }
    };

    // Browser detection and configuration
    this.browserType = this.detectBrowser();
    this.config = this.getBrowserConfig();
    this.processingStats = {
      framesProcessed: 0,
      musicDetected: 0,
      averageMusicLevel: 0,
      browserType: this.browserType
    };
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
        audioContextType: 'AudioContext',
        preferredSampleRate: 44100,
        bufferSize: 2048,
        smoothingFactor: 0.8,
        enableWorklet: true,
        latencyHint: 'interactive'
      },
      firefox: {
        audioContextType: 'AudioContext',
        preferredSampleRate: 48000,
        bufferSize: 4096,
        smoothingFactor: 0.7,
        enableWorklet: false,
        latencyHint: 'balanced'
      },
      safari: {
        audioContextType: 'webkitAudioContext',
        preferredSampleRate: 44100,
        bufferSize: 1024,
        smoothingFactor: 0.6,
        enableWorklet: false,
        latencyHint: 'balanced'
      },
      edge: {
        audioContextType: 'AudioContext',
        preferredSampleRate: 44100,
        bufferSize: 2048,
        smoothingFactor: 0.8,
        enableWorklet: true,
        latencyHint: 'interactive'
      },
      unknown: {
        audioContextType: 'AudioContext',
        preferredSampleRate: 44100,
        bufferSize: 2048,
        smoothingFactor: 0.8,
        enableWorklet: false,
        latencyHint: 'balanced'
      }
    };

    return configs[this.browserType] || configs.unknown;
  }

  async initialize(videoElement) {
    try {
      console.log(`Initializing AudioProcessor for ${this.browserType}`);

      // Create audio context with proper fallback support
      let AudioContextClass = null;

      // Try standard AudioContext first
      if (window.AudioContext) {
        AudioContextClass = window.AudioContext;
      } else if (window.webkitAudioContext) {
        // Fallback for Safari and older browsers
        AudioContextClass = window.webkitAudioContext;
      } else {
        throw new Error('AudioContext not supported in this browser');
      }

      // Create audio context with browser-specific settings
      this.audioContext = new AudioContextClass({
        sampleRate: this.config.preferredSampleRate,
        latencyHint: this.config.latencyHint
      });

      // Resume context if suspended (required for Safari and user interaction)
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
        } catch (resumeError) {
          console.warn('Failed to resume audio context, will retry on user interaction:', resumeError);
          // Set up user interaction listener for Safari
          const resumeOnInteraction = async () => {
            try {
              await this.audioContext.resume();
              document.removeEventListener('click', resumeOnInteraction);
              document.removeEventListener('touchstart', resumeOnInteraction);
              console.log('Audio context resumed on user interaction');
            } catch (error) {
              console.error('Failed to resume audio context on user interaction:', error);
            }
          };
          document.addEventListener('click', resumeOnInteraction, { once: true });
          document.addEventListener('touchstart', resumeOnInteraction, { once: true });
        }
      }

      // Validate video element
      if (!videoElement || !videoElement.src) {
        throw new Error('Invalid video element provided');
      }

      // Create media element source with error handling
      try {
        this.source = this.audioContext.createMediaElementSource(videoElement);
      } catch (sourceError) {
        console.error('Failed to create media element source:', sourceError);
        throw new Error('Cannot create audio source from video element');
      }

      // Create analyser with browser-specific settings
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.bufferSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingFactor;

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

      // Create filters for speech enhancement
      this.createSpeechFilters();

      // Connect audio nodes
      this.connectNodes();

      // Start processing
      this.isProcessing = true;
      this.processAudio();

      console.log(`Audio processor initialized successfully for ${this.browserType}`);
      return true;
    } catch (error) {
      console.error(`Failed to initialize audio processor for ${this.browserType}:`, error);
      return false;
    }
  }

  createSpeechFilters() {
    // High-pass filter to remove low-frequency noise and bass
    this.highPassFilter = this.audioContext.createBiquadFilter();
    this.highPassFilter.type = 'highpass';
    this.highPassFilter.frequency.value = 80;
    this.highPassFilter.Q = 1.0;

    // Low-pass filter to remove high-frequency noise
    this.lowPassFilter = this.audioContext.createBiquadFilter();
    this.lowPassFilter.type = 'lowpass';
    this.lowPassFilter.frequency.value = 8000;
    this.lowPassFilter.Q = 1.0;

    // Notch filter to reduce common music frequencies
    this.notchFilter = this.audioContext.createBiquadFilter();
    this.notchFilter.type = 'notch';
    this.notchFilter.frequency.value = 440; // A4 note
    this.notchFilter.Q = 10;

    // Additional notch filters for harmonic frequencies (browser-specific)
    this.harmonicFilters = [];
    const harmonicFrequencies = this.getHarmonicFrequencies();

    harmonicFrequencies.forEach(freq => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'notch';
      filter.frequency.value = freq;
      filter.Q = 5.0;
      this.harmonicFilters.push(filter);
    });

    // Compressor to normalize speech levels
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
  }

  getHarmonicFrequencies() {
    // Browser-specific harmonic frequencies
    const baseFrequencies = [110, 220, 440, 880, 1760]; // A2 to A6

    if (this.browserType === 'safari') {
      // Safari: fewer filters for better performance
      return baseFrequencies.slice(1, 4);
    } else if (this.browserType === 'firefox') {
      // Firefox: more filters for better music detection
      return [...baseFrequencies, 55, 3520];
    } else {
      // Chrome/Edge: standard set
      return baseFrequencies;
    }
  }

  connectNodes() {
    // Connect source through processing chain
    let currentNode = this.source;

    // Connect through main filters
    currentNode.connect(this.highPassFilter);
    currentNode = this.highPassFilter;

    currentNode.connect(this.lowPassFilter);
    currentNode = this.lowPassFilter;

    currentNode.connect(this.notchFilter);
    currentNode = this.notchFilter;

    // Connect through harmonic filters
    this.harmonicFilters.forEach(filter => {
      currentNode.connect(filter);
      currentNode = filter;
    });

    // Connect through compressor and gain
    currentNode.connect(this.compressor);
    this.compressor.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Connect analyser for monitoring (parallel connection)
    this.source.connect(this.analyser);
  }

  processAudio() {
    if (!this.isProcessing) {return;}

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    const analyzeFrame = () => {
      if (!this.isProcessing) {return;}

      try {
        // Check if audio context is still valid
        if (!this.audioContext || this.audioContext.state === 'closed') {
          console.warn('Audio context is closed, stopping processing');
          this.isProcessing = false;
          return;
        }

        // Get frequency and time domain data with error handling
        try {
          this.analyser.getByteFrequencyData(dataArray);
          this.analyser.getByteTimeDomainData(timeDataArray);
        } catch (dataError) {
          console.warn('Failed to get audio data, retrying:', dataError);
          // Continue processing with previous data
        }

        // Analyze audio characteristics
        const musicScore = this.detectMusic(dataArray, timeDataArray);
        const speechScore = this.detectSpeech(dataArray, timeDataArray);

        // Validate scores
        if (isNaN(musicScore) || isNaN(speechScore)) {
          console.warn('Invalid audio scores detected, using defaults');
          this.updateStats(0, 0);
          this.adjustGain(0, 0);
        } else {
          // Update processing statistics
          this.updateStats(musicScore, speechScore);

          // Adjust gain based on analysis
          this.adjustGain(musicScore, speechScore);
        }

        // Continue processing with browser-specific timing
        if (this.browserType === 'safari') {
          // Safari: use setTimeout for better performance
          setTimeout(analyzeFrame, 16); // ~60fps
        } else {
          // Other browsers: use requestAnimationFrame
          requestAnimationFrame(analyzeFrame);
        }
      } catch (error) {
        console.error('Error in audio processing frame:', error);

        // Attempt recovery
        this.attemptRecovery();

        // Continue processing if possible
        if (this.isProcessing) {
          if (this.browserType === 'safari') {
            setTimeout(analyzeFrame, 100); // Slower retry
          } else {
            requestAnimationFrame(analyzeFrame);
          }
        }
      }
    };

    analyzeFrame();
  }

  attemptRecovery() {
    try {
      // Reset scores to prevent cascading errors
      this.lastMusicScore = 0;
      this.lastSpeechScore = 0;
      this.lastGain = 0.5;

      // Reset gain to safe default
      if (this.gainNode && this.audioContext && this.audioContext.state !== 'closed') {
        this.gainNode.gain.setTargetAtTime(0.5, this.audioContext.currentTime, 0.1);
      }

      console.log('Audio processing recovery attempted');
    } catch (recoveryError) {
      console.error('Failed to recover audio processing:', recoveryError);
      this.isProcessing = false;
    }
  }

  detectMusic(frequencyData, timeData) {
    let musicScore = 0;
    const bufferLength = frequencyData.length;
    let harmonicCount = 0;
    let rhythmicPatterns = 0;
    let bassContent = 0;
    let trebleContent = 0;

    // Analyze frequency patterns characteristic of music
    for (let i = 0; i < bufferLength; i++) {
      const frequency = i * this.audioContext.sampleRate / (2 * bufferLength);
      const amplitude = frequencyData[i] / 255;

      // Check for harmonic patterns (music characteristic)
      if (this.isHarmonicFrequency(frequency)) {
        musicScore += amplitude * 2.5;
        harmonicCount++;
      }

      // Check for bass content (common in music)
      if (frequency >= this.musicPatterns.bass.low && frequency <= this.musicPatterns.bass.high) {
        bassContent += amplitude;
      }

      // Check for treble content (instruments, vocals)
      if (frequency >= this.musicPatterns.treble.low && frequency <= this.musicPatterns.treble.high) {
        trebleContent += amplitude;
      }

      // Check for rhythmic patterns in time domain
      if (i < timeData.length) {
        const timeAmplitude = Math.abs(timeData[i] - 128) / 128;
        if (timeAmplitude > 0.3) {
          musicScore += timeAmplitude * 0.8;
          rhythmicPatterns++;
        }
      }
    }

    // Enhanced scoring based on multiple factors
    const harmonicRatio = harmonicCount / bufferLength;
    const rhythmicRatio = rhythmicPatterns / bufferLength;
    const bassRatio = bassContent / bufferLength;
    const trebleRatio = trebleContent / bufferLength;

    // Weighted scoring system
    let finalScore = musicScore / bufferLength;

    // Boost score if we detect strong harmonic patterns
    if (harmonicRatio > 0.1) {
      finalScore *= 1.5;
    }

    // Boost score if we detect rhythmic patterns
    if (rhythmicRatio > 0.05) {
      finalScore *= 1.3;
    }

    // Boost score if we have balanced bass and treble (typical of music)
    if (bassRatio > 0.1 && trebleRatio > 0.1) {
      finalScore *= 1.2;
    }

    // Normalize and apply smoothing
    finalScore = Math.min(finalScore, 1.0);

    // Apply exponential smoothing for stability
    const alpha = 0.1;
    this.lastMusicScore = this.lastMusicScore || 0;
    finalScore = this.lastMusicScore * (1 - alpha) + finalScore * alpha;
    this.lastMusicScore = finalScore;

    return finalScore;
  }

  detectSpeech(frequencyData, timeData) {
    let speechScore = 0;
    const bufferLength = frequencyData.length;
    let speechFreqCount = 0;
    let formantCount = 0;
    let silenceCount = 0;

    // Focus on speech frequency range (85-255 Hz) and formants
    for (let i = 0; i < bufferLength; i++) {
      const frequency = i * this.audioContext.sampleRate / (2 * bufferLength);
      const amplitude = frequencyData[i] / 255;

      // Primary speech frequencies (85-255 Hz)
      if (frequency >= this.speechFrequencies.low && frequency <= this.speechFrequencies.high) {
        speechScore += amplitude * 2.0;
        speechFreqCount++;
      }

      // Formant frequencies (speech characteristics)
      const formantFrequencies = [500, 1500, 2500, 3500]; // F1, F2, F3, F4
      formantFrequencies.forEach(formant => {
        if (Math.abs(frequency - formant) < 100) {
          speechScore += amplitude * 1.5;
          formantCount++;
        }
      });

      // Check for silence (speech pauses)
      if (amplitude < 0.1) {
        silenceCount++;
      }
    }

    // Enhanced speech scoring
    const speechRatio = speechFreqCount / bufferLength;
    const formantRatio = formantCount / bufferLength;
    const silenceRatio = silenceCount / bufferLength;

    let finalScore = speechScore / bufferLength;

    // Boost score if we detect strong speech frequencies
    if (speechRatio > 0.05) {
      finalScore *= 1.8;
    }

    // Boost score if we detect formants (characteristic of speech)
    if (formantRatio > 0.02) {
      finalScore *= 1.4;
    }

    // Moderate boost for natural speech pauses
    if (silenceRatio > 0.1 && silenceRatio < 0.8) {
      finalScore *= 1.1;
    }

    // Normalize and apply smoothing
    finalScore = Math.min(finalScore, 1.0);

    // Apply exponential smoothing for stability
    const alpha = 0.1;
    this.lastSpeechScore = this.lastSpeechScore || 0;
    finalScore = this.lastSpeechScore * (1 - alpha) + finalScore * alpha;
    this.lastSpeechScore = finalScore;

    return finalScore;
  }

  isHarmonicFrequency(frequency) {
    // Check if frequency is close to common musical notes
    const musicalNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C4 to B4
    const tolerance = this.browserType === 'safari' ? 15 : 10; // Safari: more tolerance

    return musicalNotes.some(note =>
      Math.abs(frequency - note) < tolerance ||
      Math.abs(frequency - note * 2) < tolerance ||
      Math.abs(frequency - note / 2) < tolerance
    );
  }

  adjustGain(musicScore, speechScore) {
    // Browser-specific gain adjustment
    const gainAdjustment = this.getGainAdjustment(musicScore, speechScore);

    if (this.browserType === 'safari') {
      // Safari: smoother transitions
      this.gainNode.gain.setTargetAtTime(gainAdjustment, this.audioContext.currentTime, 0.2);
    } else {
      // Other browsers: faster transitions
      this.gainNode.gain.setTargetAtTime(gainAdjustment, this.audioContext.currentTime, 0.1);
    }
  }

  getGainAdjustment(musicScore, speechScore) {
    // Enhanced gain adjustment with more sophisticated logic

    // Calculate the ratio of music to speech
    const musicSpeechRatio = musicScore / (speechScore + 0.1); // Avoid division by zero

    // Base gain calculation
    let baseGain = 1.0;

    if (musicScore > this.musicThreshold) {
      if (speechScore < 0.2) {
        // High music, very low speech - aggressive reduction
        baseGain = 0.05;
      } else if (speechScore < 0.4) {
        // High music, low speech - significant reduction
        baseGain = 0.15;
      } else if (speechScore < 0.6) {
        // High music, moderate speech - moderate reduction
        baseGain = 0.35;
      } else {
        // High music, high speech - light reduction
        baseGain = 0.6;
      }
    } else if (speechScore > 0.6) {
      // High speech, low music - maintain good volume
      baseGain = 0.9;
    } else if (speechScore > 0.3) {
      // Moderate speech - moderate volume
      baseGain = 0.7;
    } else {
      // Low speech and music - default volume
      baseGain = 0.5;
    }

    // Apply dynamic adjustment based on music-speech ratio
    if (musicSpeechRatio > 3.0) {
      // Very high music ratio - more aggressive reduction
      baseGain *= 0.7;
    } else if (musicSpeechRatio > 1.5) {
      // High music ratio - moderate reduction
      baseGain *= 0.85;
    } else if (musicSpeechRatio < 0.5) {
      // Low music ratio - boost speech
      baseGain *= 1.1;
    }

    // Apply smoothing to prevent jarring changes
    const alpha = 0.05; // Very slow smoothing for stability
    this.lastGain = this.lastGain || baseGain;
    const smoothedGain = this.lastGain * (1 - alpha) + baseGain * alpha;
    this.lastGain = smoothedGain;

    // Ensure gain stays within reasonable bounds
    return Math.max(0.01, Math.min(1.0, smoothedGain));
  }

  updateStats(musicScore, speechScore) {
    this.processingStats.framesProcessed++;

    if (musicScore > this.musicThreshold) {
      this.processingStats.musicDetected++;
    }

    // Update average music level with smoothing
    const alpha = 0.01;
    this.processingStats.averageMusicLevel =
      this.processingStats.averageMusicLevel * (1 - alpha) + musicScore * alpha;
  }

  getStats() {
    return {
      ...this.processingStats,
      sampleRate: this.audioContext?.sampleRate || 0,
      isProcessing: this.isProcessing,
      browserRecommendations: this.getBrowserRecommendations()
    };
  }

  getBrowserRecommendations() {
    const recommendations = {
      chrome: {
        performance: 'Excellent',
        features: 'Full support',
        notes: 'Best performance and feature support'
      },
      firefox: {
        performance: 'Very Good',
        features: 'Full support',
        notes: 'Slightly different audio processing behavior'
      },
      safari: {
        performance: 'Good',
        features: 'Limited support',
        notes: 'May require user interaction to start audio processing'
      },
      edge: {
        performance: 'Excellent',
        features: 'Full support',
        notes: 'Similar to Chrome performance'
      }
    };

    return recommendations[this.browserType] || recommendations.chrome;
  }

  setEnabled(enabled) {
    if (enabled) {
      this.gainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.1);
    } else {
      this.gainNode.gain.setTargetAtTime(0.0, this.audioContext.currentTime, 0.1);
    }
  }

  destroy() {
    this.isProcessing = false;

    // Disconnect all audio nodes
    if (this.source) {
      this.source.disconnect();
    }

    if (this.analyser) {
      this.analyser.disconnect();
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
    }

    // Disconnect filters
    [this.highPassFilter, this.lowPassFilter, this.notchFilter, this.compressor].forEach(node => {
      if (node) {node.disconnect();}
    });

    this.harmonicFilters.forEach(filter => {
      filter.disconnect();
    });

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    console.log(`AudioProcessor destroyed for ${this.browserType}`);
  }

  // Browser-specific utility methods
  isSafari() {
    return this.browserType === 'safari';
  }

  isFirefox() {
    return this.browserType === 'firefox';
  }

  isChrome() {
    return this.browserType === 'chrome';
  }

  isEdge() {
    return this.browserType === 'edge';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioProcessor;
} else {
  window.AudioProcessor = AudioProcessor;
}
