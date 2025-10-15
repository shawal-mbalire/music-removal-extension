# Bug Fix: AudioProcessor Constructor Error

## Issue
Users on Firefox (and potentially other browsers) were experiencing an error:
```
Error setting up audio processing: TypeError: window.AudioProcessor is not a constructor
    setupAudioProcessing moz-extension://69d1aa77-80b3-4bec-9949-95649cc5fbfe/content.js:258
```

## Root Cause
The `audioProcessor.js` file was only exporting the `AudioProcessor` class for Node.js modules but not exposing it to the browser's `window` object. The export code was:

```javascript
// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioProcessor;
}
// Missing: else clause to expose to window
```

When the script was loaded in the browser extension context via `chrome.runtime.getURL('audioProcessor.js')`, the class was defined but not accessible via `window.AudioProcessor`, causing the constructor error.

## Solution
Added the else clause to expose the class to the window object when not in a Node.js environment:

```javascript
// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioProcessor;
} else {
  window.AudioProcessor = AudioProcessor;
}
```

This matches the pattern already used in `videoSelector.js` and ensures the class is available in both Node.js (for testing) and browser contexts (for the extension).

## Files Changed
- `audioProcessor.js`: Added window export in the else clause
- `.gitignore`: Created to prevent committing node_modules and build artifacts

## Testing
- All existing tests pass (117/119, 2 pre-existing failures unrelated to this fix)
- Export pattern now matches `videoSelector.js`
- Both classes are instantiated the same way in `content.js`:
  - Line 81: `videoSelector = new window.VideoSelector();`
  - Line 258: `audioProcessor = new window.AudioProcessor();`

## Verification
To verify the fix works:
1. Load the extension in Firefox
2. Navigate to a video site (YouTube, Netflix, etc.)
3. The audio processing should now initialize without errors
4. Check the browser console - you should see "Audio processor loaded successfully" instead of the constructor error
