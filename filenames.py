import os

def generate_js_video_list(folder_path, output_file='video_filenames.js'):
    """
    Scans the specified folder for .mp4 files and writes their filenames with paths
    to a JavaScript file formatted as an array assignment to a variable.

    :param folder_path: Path to the folder containing the video files.
    :param output_file: Filename for the output JavaScript file that will contain the array.
    """
    if not os.path.isdir(folder_path):
        print(f"Error: The directory '{folder_path}' does not exist.")
        return

    # Collect all .mp4 files from the directory, including their full paths
    video_files = [os.path.join(folder_path, file) for file in os.listdir(folder_path) if file.lower().endswith('.mp4')]
    if not video_files:
        print("No .mp4 files found in the specified directory.")
        return

    # Format the file paths for inclusion in a JavaScript array
    js_array = "var videoFilenames = [" + ', '.join(f"'{file}'" for file in video_files) + "];"

    # Write the JavaScript code to the output file
    try:
        with open(output_file, 'w') as js_file:
            js_file.write(js_array + '\n')
        print(f"Generated JavaScript file successfully at {output_file}.")
    except IOError as e:
        print(f"Failed to write to file {output_file}: {e}")

if __name__ == '__main__':
    folder_path = input("Enter the path to your video folder: ").strip()
    output_file = input("Enter the name of the output JavaScript file (default 'video_filenames.js'): ").strip() or 'video_filenames.js'
    generate_js_video_list(folder_path, output_file)
