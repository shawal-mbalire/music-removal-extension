console.log("Music Removal Extension Loaded");

// Find YouTube's video element once
const video = document.querySelector("video");

if (video) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaElementSource(video);

  // Band-pass filter to isolate vocal frequencies (300Hz - 3kHz)
  const bandPassFilter = audioContext.createBiquadFilter();
  bandPassFilter.type = "bandpass";
  bandPassFilter.frequency.value = 1000; // Center frequency for vocals
  bandPassFilter.Q = 1.5; // Adjust to fine-tune

  // High-pass filter to remove low-frequency instruments
  const highPassFilter = audioContext.createBiquadFilter();
  highPassFilter.type = "highpass";
  highPassFilter.frequency.value = 300; // Cutoff at 300Hz

  // Low-pass filter to remove high-frequency instruments
  const lowPassFilter = audioContext.createBiquadFilter();
  lowPassFilter.type = "lowpass";
  lowPassFilter.frequency.value = 3000; // Cutoff at 3kHz

  // Gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1.0; // Default volume

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

    // Detect presence of music
    const hasMusic = detectMusic(dataArray);

    if (hasMusic) {
      console.log("Music detected! Attenuating...");
      gainNode.gain.value = 0.3; // Reduce volume when music is detected
    } else {
      gainNode.gain.value = 1.0; // Restore full volume for vocals
    }

    requestAnimationFrame(analyzeAudio);
  }

  analyzeAudio();
}

// Function to detect music presence
function detectMusic(frequencyData) {
  let sum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    sum += frequencyData[i];
  }
  const average = sum / frequencyData.length;
  return average > 50; // Adjust threshold as needed
}

// Listen for messages (toggle feature)
window.addEventListener("message", function (event) {
  if (event.data.type === "TOGGLE_MUSIC_REMOVAL") {
    console.log("Music Removal Toggled:", event.data.enabled);
  }
});
