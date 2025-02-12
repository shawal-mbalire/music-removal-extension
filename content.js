console.log("Music Removal Extension Loaded");

// Find YouTube's video element once
const video = document.querySelector("video");

if (video) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaElementSource(video);
  
  // Create a gain node (placeholder for future processing)
  const gainNode = audioContext.createGain();
  source.connect(gainNode).connect(audioContext.destination);
  
  console.log("Audio processing initialized.");

  // Set up an analyser for real-time audio analysis
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048; // Controls frequency resolution
  
  // Connect the source to the analyser and then to the destination
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  
  // Create a buffer for the frequency data
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  function analyzeAudio() {
    analyser.getByteFrequencyData(dataArray);
    
    // Check for music frequency patterns
    const hasMusic = detectMusic(dataArray);
    
    if (hasMusic) {
      console.log("Music detected!");
      muteMusic();
    } else {
      unmuteMusic();
    }
    
    requestAnimationFrame(analyzeAudio);
  }
  
  analyzeAudio();
  
  // Function to mute only music (TBD: More advanced processing)
  function muteMusic() {
    video.volume = 0.2; // Lower volume as a placeholder
  }
  
  function unmuteMusic() {
    video.volume = 1.0;
  }
}

// Listen for messages (e.g., to toggle music removal)
window.addEventListener("message", function (event) {
  if (event.data.type === "TOGGLE_MUSIC_REMOVAL") {
    console.log("Music Removal Toggled:", event.data.enabled);
    
    // Future audio processing logic will go here
  }
});

// Function to detect music (basic example)
function detectMusic(frequencyData) {
  let sum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    sum += frequencyData[i];
  }
  const average = sum / frequencyData.length;
  
  // If the average frequency level is above a threshold, assume music is present
  return average > 50; // Tweak this threshold as needed
}
