import numpy as np
from PIL import Image

# Define the dimensions of the image
width = 400   # Width of the image
height = 300  # Height of the image

# Generate random pixel data for black and white static
random_image_array = np.random.randint(0, 256, (height, width), dtype='uint8')

# Create a grayscale image
random_image = Image.fromarray(random_image_array, mode='L')


# Save the image as static.jpg
random_image.save('static.jpg')
