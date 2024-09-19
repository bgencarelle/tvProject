import numpy as np
from scipy.io.wavfile import write

# Parameters
sample_rate = 11025  # Samples per second
duration = 1         # Duration in seconds

# Generate random samples
samples = np.random.uniform(low=-1.0, high=1.0, size=int(sample_rate * duration))

# Ensure correct data type
samples = np.int16(samples * 32767) // 2

# Save as WAV file
write('static.wav', sample_rate, samples)

# Convert WAV to MP3 using pydub (requires ffmpeg)
from pydub import AudioSegment
sound = AudioSegment.from_wav('static.wav')
sound.export('static.mp3', format='mp3')
