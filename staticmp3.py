import numpy as np
from scipy.io.wavfile import write
from scipy.signal import butter, filtfilt
from pydub import AudioSegment

# Parameters
sample_rate = 44100  # Samples per second
duration = 1         # Duration in seconds

# Generate random samples
samples = np.random.uniform(low=-1.0, high=1.0, size=int(sample_rate * duration))

# Design a Butterworth band-pass filter
def butter_bandpass(lowcut, highcut, fs, order=4):
    nyquist = 0.5 * fs
    low = lowcut / nyquist
    high = highcut / nyquist
    b, a = butter(order, [low, high], btype='band')
    return b, a

# Apply the band-pass filter
def apply_bandpass_filter(data, lowcut, highcut, fs, order=4):
    b, a = butter_bandpass(lowcut, highcut, fs, order=order)
    y = filtfilt(b, a, data)
    return y

# Define filter parameters
lowcut = 30.0    # Lower cutoff frequency in Hz
highcut = 5000.0 # Upper cutoff frequency in Hz

# Apply the filter to the samples
filtered_samples = apply_bandpass_filter(samples, lowcut, highcut, sample_rate)

# Normalize the filtered samples to prevent clipping
filtered_samples /= np.max(np.abs(filtered_samples))

# Ensure correct data type for WAV file
filtered_samples_int16 = np.int16(filtered_samples * 32767) // 8

# Save as WAV file
write('static.wav', sample_rate, filtered_samples_int16)

# Convert WAV to MP3 using pydub (requires ffmpeg)
sound = AudioSegment.from_wav('static.wav')
sound.export('static.mp3', format='mp3')

print("Filtered audio saved as 'static.wav' and 'static.mp3'")
