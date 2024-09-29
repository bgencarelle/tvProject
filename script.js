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
var maxChannel = 57; // Updated to match the total number of channels
var channelDisplayTimeout; // Timeout for hiding channel display
var inputBufferTimeout; // Timeout reference for input buffer reset

var inputBuffer = ''; // Input buffer for number entry simulation
var isSwitching = false; // Flag to indicate if a channel switch is in progress

// Variable to hold the camera stream
var cameraStream = null; // Holds the MediaStream from the camera

// Start time reference
var startTime = Date.now(); // Record the start time when the page loads

// Channel sources mapping is now defined in video_filenames.js
// Ensure that video_filenames.js is loaded before script.js in index.html

// Load the initial channel when the window loads
window.onload = function() {
    loadChannel(channelNumber);
    updateChannelDisplay(); // Initialize channel display
};

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

// Attach timeupdate event listener to update timestamp
videoPlayer.addEventListener('timeupdate', updateTimestamp);

// Event listener for keyboard controls, including number input simulation
document.addEventListener('keydown', function(event) {
    if (isSwitching) {
        // Ignore inputs during channel switching
        return;
    }

    // Handle ArrowUp and ArrowDown for channel navigation
    if (event.key === 'ArrowUp') {
        var newChannelNumber = channelNumber + 1;
        if (newChannelNumber > maxChannel) newChannelNumber = minChannel; // Loop back to minChannel
        switchChannel(newChannelNumber);
    } else if (event.key === 'ArrowDown') {
        var newChannelNumber = channelNumber - 1;
        if (newChannelNumber < minChannel) newChannelNumber = maxChannel; // Loop back to maxChannel
        switchChannel(newChannelNumber);
    }
    // Handle number keys for channel selection
    else if (event.key >= '0' && event.key <= '9') {
        // Append the digit to the input buffer
        inputBuffer += event.key;
        // Update the channel display to show the entered digit(s)
        updateChannelDisplay();

        // Clear any existing input buffer timeout
        clearTimeout(inputBufferTimeout);

        // Set a new timeout to reset the input buffer after 2 seconds
        inputBufferTimeout = setTimeout(function() {
            // Reset the input buffer
            inputBuffer = '';
            // Update the channel display to show the current channel
            updateChannelDisplay();
        }, 2000); // 2000ms = 2 seconds

        // If two digits have been entered, attempt to switch channel after 125ms delay
        if (inputBuffer.length === 2) {
            // Capture the desired channel and reset the input buffer
            let desiredChannel = parseInt(inputBuffer, 10);
            inputBuffer = '';

            // Clear the input buffer timeout as we've already entered two digits
            clearTimeout(inputBufferTimeout);

            // Introduce a 125ms delay before switching channels
            setTimeout(function() {
                if (desiredChannel >= minChannel && desiredChannel <= maxChannel) {
                    switchChannel(desiredChannel);
                } else {
                    // Provide feedback for invalid channel
                    console.warn(`Invalid channel: ${desiredChannel}. Staying on channel ${channelNumber}.`);
                    // Flash the channel display with 'Invalid' message
                    channelCounter.textContent = 'Invalid';
                    // Optional: You can add a CSS class for flashing effect
                    setTimeout(function() {
                        // Revert back to current channel display after flashing
                        var formattedChannel = channelNumber.toString().padStart(2, '0');
                        channelCounter.textContent = 'CH ' + formattedChannel;
                        resetChannelDisplayTimeout();
                    }, 500); // Display 'Invalid' for 500ms
                }
            }, 125);
        }
    }
    // Ignore other keys
});

// Function to update channel display with leading zeros
function updateChannelDisplay() {
    if (inputBuffer.length === 0) {
        // Format channelNumber with leading zero if it's a single digit
        var formattedChannel = channelNumber.toString().padStart(2, '0');
        channelCounter.textContent = 'CH ' + formattedChannel;
    } else {
        // Format inputBuffer with leading zero if it's a single digit
        var formattedInput = inputBuffer.padStart(2, '0');
        channelCounter.textContent = 'CH ' + formattedInput;
    }
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
        if (source === 'ccd') {
            // Handle 'ccd' channel by accessing the camera
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                    .then(function(stream) {
                        cameraStream = stream;
                        videoPlayer.srcObject = stream;
                        videoPlayer.play();
                    })
                    .catch(function(err) {
                        console.error('Error accessing camera:', err);
                        // Optionally, display an error message to the user
                    });
            } else {
                console.error('getUserMedia not supported in this browser.');
                // Optionally, display an error message to the user
            }
        } else {
            // Handle regular video channels
            // If a camera stream is active, stop it before loading a new video
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
                videoPlayer.srcObject = null;
            }

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
        }
    } else {
        console.error('No video source found for channel', channelNum);
    }
}

// Function to switch channels with fade effect, static sound, and black screens
function switchChannel(newChannelNumber) {
    if (isSwitching) {
        // If a switch is already in progress, ignore new switch requests
        return;
    }

    isSwitching = true; // Set the flag to indicate switching has started

    channelNumber = newChannelNumber;
    updateChannelDisplay();

    // Show black overlay
    showBlackOverlay();

    // After 10ms, show static overlay and play static sound
    setTimeout(function() {
        hideBlackOverlay();
        showStaticOverlay();

        // Pause the current video or camera stream
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

                // Reset the switching flag after 500ms delay to allow new inputs
                setTimeout(function() {
                    isSwitching = false; // Allow new inputs after switch completion
                }, 500); // 500ms delay before accepting new inputs

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

// Cleanup camera stream on page unload
window.addEventListener('beforeunload', function() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
});
