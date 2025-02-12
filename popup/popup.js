document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("toggleMusicRemoval");
    const statusText = document.getElementById("statusText");

    // Load stored setting
    chrome.storage.sync.get(["musicRemovalEnabled"], function (result) {
        toggle.checked = result.musicRemovalEnabled || false;
        statusText.textContent = toggle.checked ? "Music Removal: ON" : "Music Removal: OFF";
    });

    // Toggle functionality
    toggle.addEventListener("change", function () {
        const enabled = toggle.checked;
        chrome.storage.sync.set({ musicRemovalEnabled: enabled });
        statusText.textContent = enabled ? "Music Removal: ON" : "Music Removal: OFF";

        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: toggleMusicRemoval,
                args: [enabled]
            });
        });
    });
});

// Function to send to content script
function toggleMusicRemoval(enabled) {
    window.postMessage({ type: "TOGGLE_MUSIC_REMOVAL", enabled }, "*");
}
