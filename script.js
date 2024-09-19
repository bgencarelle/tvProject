// JavaScript Code

// Get references to elements
var videoPlayer = document.getElementById('videoPlayer');
var timestampDisplay = document.getElementById('timestamp');
var channelCounter = document.getElementById('channelCounter');
var staticOverlay = document.getElementById('staticOverlay');
var blackOverlay = document.getElementById('blackOverlay');
var staticSound = document.getElementById('staticSound');

var channelNumber = 2; // Starting channel number
var minChannel = 2;
var maxChannel = 57; // Total number of channels
var channelDisplayTimeout; // Timeout for hiding channel display

// Start time reference
var startTime = Date.now(); // Record the start time when the page loads

// Channel sources mapping
var channelSources = {};

// Assume videoFilenames is loaded from an external .js file
// var videoFilenames = ['video1.mp4', 'video2.mp4', 'video3.mp4']; // This line is now loaded externally

// Assign videos to channels, reusing videos as necessary
for (var ch = minChannel; ch <= maxChannel; ch++) {
    var index = (ch - minChannel) % videoFilenames.length;
    channelSources[ch] = videoFilenames[index];
}

// Load the initial channel
window.onload = function() {
    loadChannel(channelNumber);
}

// Unmute videos after user interaction
function unmuteVideos() {
    videoPlayer.muted = false;
    staticSound.muted = false; // Unmute the static sound
    document.removeEventListener('click', unmuteVideos);
    document.removeEventListener('keydown', unmuteVideos);
}

// Add event listeners to unmute videos on user interaction
document.addEventListener('click', unmuteVideos);
document.addEventListener('keydown', unmuteVideos);

// Update timestamp display
function updateTimestamp() {
    var currentTime = videoPlayer.currentTime;
    var minutes = Math.floor(currentTime / 60);
    var seconds = Math.floor(currentTime % 60);
    if (seconds < 10) seconds = '0' + seconds;
    timestampDisplay.textContent = minutes + ':' + seconds;
}

// Event listener for keyboard controls
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        var newChannelNumber = channelNumber + 1;
        if (newChannelNumber > maxChannel) newChannelNumber = minChannel; // Loop back to minChannel
        switchChannel(newChannelNumber);
    } else if (event.key === 'ArrowDown') {
        var newChannelNumber = channelNumber - 1;
        if (newChannelNumber < minChannel) newChannelNumber = maxChannel; // Loop back to maxChannel
        switchChannel(newChannelNumber);
    }
});

// Function to update channel display
function updateChannelDisplay() {
    channelCounter.textContent = 'CH ' + channelNumber;
    channelCounter.style.opacity = 1; // Show the channel counter
    resetChannelDisplayTimeout(); // Reset the timer to hide the channel counter
}

// Function to hide the channel display
function hideChannelDisplay() {
    channelCounter.style.opacity = 0; // Hide the channel counter
}

// Function to reset the channel display timeout
function resetChannelDisplayTimeout() {
    // Clear any existing timeout
    clearTimeout(channelDisplayTimeout);
    // Set a new timeout to hide the channel display after 2 seconds
    channelDisplayTimeout = setTimeout(hideChannelDisplay, 2000);
}

// Function to show black overlay
function showBlackOverlay() {
    blackOverlay.classList.add('visible');
}

// Function to hide black overlay
function hideBlackOverlay() {
    blackOverlay.classList.remove('visible');
}

// Function to show static overlay and play static sound
function showStaticOverlay() {
    staticOverlay.classList.add('visible');
    staticSound.currentTime = 0; // Reset the sound to the beginning
    staticSound.play();
}

// Function to hide static overlay and stop static sound
function hideStaticOverlay() {
    staticOverlay.classList.remove('visible');
    staticSound.pause();
}

// Function to load a channel
function loadChannel(channelNum) {
    var source = channelSources[channelNum];
    if (source) {
        videoPlayer.src = source;
        videoPlayer.load();

        // Remove existing timeupdate listener to prevent multiple bindings
        videoPlayer.removeEventListener('timeupdate', updateTimestamp);

        // Attach timeupdate event listener to update timestamp
        videoPlayer.addEventListener('timeupdate', updateTimestamp);

        // Wait for metadata to load to get video duration
        videoPlayer.addEventListener('loadedmetadata', function() {
            var videoDuration = videoPlayer.duration;

            // Calculate elapsed time in seconds
            var elapsedTime = (Date.now() - startTime) / 1000;

            // Set currentTime based on elapsed time modulo video duration
            videoPlayer.currentTime = elapsedTime % videoDuration;

            videoPlayer.play();
        }, { once: true });
    } else {
        console.error('No video source found for channel', channelNum);
    }
}

// Function to switch channels with fade effect, static sound, and black screens
function switchChannel(newChannelNumber) {
    channelNumber = newChannelNumber;
    updateChannelDisplay();

    // Show black overlay
    showBlackOverlay();

    // After 10ms, show static overlay and play static sound
    setTimeout(function() {
        hideBlackOverlay();
        showStaticOverlay();

        // Pause the current video
        videoPlayer.pause();

        // After 500ms (static duration), hide static overlay and stop static sound
        setTimeout(function() {
            hideStaticOverlay();

            // Show black overlay again
            showBlackOverlay();

            // After another 10ms, hide black overlay and proceed with video switch
            setTimeout(function() {
                hideBlackOverlay();

                // Load the new channel
                loadChannel(channelNumber);

                // Update timestamp display will be called after the video starts playing
            }, 10); // 10ms delay for black screen after static
        }, 500); // 500ms delay for static effect
    }, 10); // 10ms delay for black screen before static
}

// Fullscreen handling (double-click to toggle fullscreen)
document.addEventListener('dblclick', function() {
    var elem = document.documentElement;
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        elem.requestFullscreen();
    }
});

// Initialize channel display
updateChannelDisplay();
hideChannelDisplay(); // Hide the channel display initially
