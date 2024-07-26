import cv2


# Example code for using OpenCv to:

# 1. Display an image
# 2. Play a video
# 3. Display the feed from the webcam



print('Hello World!')


'''

# Read and display an image
# ..........................


image = cv2.imread('dog.jpg')

cv2.imshow('Output', image)

# Time in milliseconds.
# 0 means infinite delay.
cv2.waitKey(2000)

'''


'''

# Display a video
# ................


# create a video capture object
cap = cv2.VideoCapture('robin.mp4')

# A video is just a sequence of images.
# Create a loop to loop through each image.

while True:
	
	# 'success' is a boolean that indicates if the image was read.
	# 'image' is the image frame that was read.
	success, image = cap.read()
	cv2.imshow('Video', image)
	
	# This adds a delay and stops the video when q is pressed
	if cv2.waitKey(1) & 0xFF == ord('q'):
		break
		
		
'''




# Use a webcam
# .............


# 0 refers to the default webcam.
# Can change this number if you have another webcam connected.
cap = cv2.VideoCapture(0)

# set the width
# Id number 3 refers to the width.
cap.set(3, 640)

# set the height
# Id number 4 refers to the height.
cap.set(4, 480)

# Change the brightness.
# Id number for the brightness is 10.
cap.set(10, 100)


while True:
	
	# 'success' is a boolean that indicates if the image was read.
	# 'image' is the image frame that was read.
	success, image = cap.read()
	cv2.imshow('Video', image)
	
	# This adds a delay and stops the video when q is pressed
	if cv2.waitKey(1) & 0xFF == ord('q'):
		break
		

	# Selecting the terminal window and pressing Ctrl C also 
	# ends the program.























































