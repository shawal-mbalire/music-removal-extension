console.log("Music Removal Extension Loaded");

// Ensure script runs only once
if (window.hasRun) {
  console.log("Script already running, exiting...");
  return;
} 
window.hasRun = true;

// Track toggle state (syncs with storage)
let musicRemovalEnabled = true;

// Find YouTube's video element
function setupAudioProcessing() {
  const video = document.querySelector("video");
  if (!video) {
    console.warn("No video element found!");
    return;
  }

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaElementSource(video);

  // Band-pass filter to keep vocals (300Hz - 3kHz)
  const bandPassFilter = audioContext.createBiquadFilter();
  bandPassFilter.type = "bandpass";
  bandPassFilter.frequency.value = 1000;
  bandPassFilter.Q = 1.5;

  // High-pass filter (removes low-frequency instruments)
  const highPassFilter = audioContext.createBiquadFilter();
  highPassFilter.type = "highpass";
  highPassFilter.frequency.value = 300;

  // Low-pass filter (removes high-frequency instruments)
  const lowPassFilter = audioContext.createBiquadFilter();
  lowPassFilter.type = "lowpass";
  lowPassFilter.frequency.value = 3000;

  // Gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1.0;

  // Analyser for real-time audio analysis
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  // Connect audio processing nodes
  source.connect(highPassFilter);
  highPassFilter.connect(bandPassFilter);
  bandPassFilter.connect(lowPassFilter);
  lowPassFilter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  source.connect(analyser);

  console.log("Audio filtering initialized.");

  function analyzeAudio() {
    analyser.getByteFrequencyData(dataArray);

    if (musicRemovalEnabled) {
      const hasMusic = detectMusic(dataArray);
      gainNode.gain.value = hasMusic ? 0.3 : 1.0; // Reduce music volume
    } else {
      gainNode.gain.value = 1.0; // Full volume if disabled
    }

    requestAnimationFrame(analyzeAudio);
  }

  analyzeAudio();
}

// Function to detect music
function detectMusic(frequencyData) {
  let sum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    sum += frequencyData[i];
  }
  const average = sum / frequencyData.length;
  return average > 50; // Adjust threshold as needed
}

// Handle toggle button events
window.addEventListener("message", function (event) {
  if (event.data.type === "TOGGLE_MUSIC_REMOVAL") {
    musicRemovalEnabled = event.data.enabled;
    console.log("Music Removal Toggled:", musicRemovalEnabled);
  }
});

// Detect YouTube navigation changes and restart the script
const observer = new MutationObserver(() => {
  if (document.querySelector("video")) {
    console.log("YouTube navigation detected. Restarting script...");
    setupAudioProcessing();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Run audio processing initially
setupAudioProcessing();
