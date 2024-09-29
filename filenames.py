import os
from pathlib import Path

def generate_js_video_list(folder_path, output_file='video_filenames.js'):
    """
    Scans the specified folder for .mp4 files and writes their filenames with relative paths
    to a JavaScript file formatted as an array assignment to a variable.
    Additionally, allows the user to specify which channels are 'static noise' and 'ccd camera'.

    :param folder_path: Path to the folder containing the video files.
    :param output_file: Filename for the output JavaScript file that will contain the array and channel mappings.
    """
    # Define channel range
    MIN_CHANNEL = 2
    MAX_CHANNEL = 57
    TOTAL_CHANNELS = MAX_CHANNEL - MIN_CHANNEL + 1

    # Verify the existence of the video folder
    if not os.path.isdir(folder_path):
        print(f"Error: The directory '{folder_path}' does not exist.")
        return

    # Collect all .mp4 files from the directory
    video_files = [file for file in os.listdir(folder_path) if file.lower().endswith('.mp4')]
    if not video_files:
        print("Error: No .mp4 files found in the specified directory.")
        return

    print(f"Found {len(video_files)} video file(s) in '{folder_path}'.")

    # Function to parse user input into a set of valid channel numbers
    def parse_channel_input(prompt):
        while True:
            input_str = input(prompt).strip()
            if not input_str:
                return set()
            try:
                channels = set()
                for part in input_str.split(','):
                    ch = int(part.strip())
                    if MIN_CHANNEL <= ch <= MAX_CHANNEL:
                        channels.add(ch)
                    else:
                        print(f"Warning: Channel {ch} is out of the valid range ({MIN_CHANNEL}-{MAX_CHANNEL}) and will be ignored.")
                return channels
            except ValueError:
                print("Invalid input. Please enter comma-separated numbers (e.g., 5,10,15).")

    # Prompt user for static noise channels
    static_channels = parse_channel_input(
        f"Enter the channel numbers for 'static noise' channels (comma-separated, e.g., 5,10,15). Press Enter to skip: "
    )

    # Prompt user for ccd camera channels
    ccd_channels = parse_channel_input(
        f"Enter the channel numbers for 'ccd camera' channels (comma-separated, e.g., 6,11,16). Press Enter to skip: "
    )

    # Check for overlapping channels
    overlapping_channels = static_channels.intersection(ccd_channels)
    if overlapping_channels:
        print(f"Error: The following channels are assigned to both 'static' and 'ccd': {sorted(overlapping_channels)}")
        print("Please ensure that each channel is assigned to only one type.")
        return

    # Calculate the number of video-assigned channels
    special_channels = len(static_channels) + len(ccd_channels)
    video_assigned_channels = TOTAL_CHANNELS - special_channels

    if video_assigned_channels < 0:
        print("Error: The number of 'static' and 'ccd' channels exceeds the total available channels.")
        return

    print(f"Assigning 'static' to channels: {sorted(static_channels) if static_channels else 'None'}")
    print(f"Assigning 'ccd' to channels: {sorted(ccd_channels) if ccd_channels else 'None'}")
    print(f"Assigning video files to {video_assigned_channels} channel(s).")

    # Assign channels
    channel_sources = {}
    video_index = 0
    for ch in range(MIN_CHANNEL, MAX_CHANNEL + 1):
        if ch in static_channels:
            channel_sources[ch] = 'static'
        elif ch in ccd_channels:
            channel_sources[ch] = 'ccd'
        else:
            # Assign video files cyclically with relative paths using pathlib
            relative_path = Path('video') / video_files[video_index % len(video_files)]
            channel_sources[ch] = relative_path.as_posix()  # Ensure POSIX paths for JS
            video_index += 1

    # Format the videoFilenames array with relative paths
    js_video_filenames = "var videoFilenames = [" + ', '.join(
        f"'{(Path('video') / file).as_posix()}'" for file in video_files
    ) + "];\n"

    # Format the channelSources mapping
    js_channel_sources = "var channelSources = {\n"
    for ch in range(MIN_CHANNEL, MAX_CHANNEL + 1):
        source = channel_sources[ch]
        js_channel_sources += f"    {ch}: '{source}',\n"
    js_channel_sources = js_channel_sources.rstrip(',\n') + "\n};\n"

    # Combine both parts
    js_content = js_video_filenames + js_channel_sources

    # Write to the output file
    try:
        with open(output_file, 'w') as js_file:
            js_file.write(js_content)
        print(f"Successfully generated '{output_file}'.")
    except IOError as e:
        print(f"Error: Failed to write to file '{output_file}'. {e}")

if __name__ == '__main__':
    # Define the video folder path relative to the script's location
    VIDEO_FOLDER = Path.cwd() / 'video'

    # Define the output JavaScript file name
    OUTPUT_JS_FILE = 'video_filenames.js'

    # Generate the JavaScript file
    generate_js_video_list(VIDEO_FOLDER, OUTPUT_JS_FILE)
