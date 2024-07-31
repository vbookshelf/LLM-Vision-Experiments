// Webcam and Screenshot
// ----------------------


var draw_area_width = 600; // Set the desired width

const video = document.getElementById('videoElement');
const controlButton = document.getElementById('controlButton');
const screenshotButton = document.getElementById('screenshotButton');
const screenshotCanvas = document.getElementById('screenshotCanvas');
const imageCanvas1 = document.getElementById('imageCanvas1');
const ctx = imageCanvas1.getContext('2d');
const screenshotCtx = screenshotCanvas.getContext('2d');
let isPlaying = false;
let stream = null;
let img = new Image();
let shapes = [];
let drawMode = 'box';
let isDrawing = false;
let startX, startY;

controlButton.addEventListener('click', () => {
    if (isPlaying) {
        stopWebcam();
    } else {
        startWebcam();
    }
});

screenshotButton.addEventListener('click', () => {
    takeScreenshot();
});

document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('saveButton').addEventListener('click', saveMarkedImage);
document.getElementById('clearButton').addEventListener('click', clearSelectedAreas);
document.getElementById('undoButton').addEventListener('click', undoLastAction);
document.getElementById('drawMode').addEventListener('change', (e) => {
    drawMode = e.target.value;
});

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
            stream = s;
            video.srcObject = stream;
            controlButton.textContent = 'Stop Webcam';
            screenshotButton.disabled = false;
            isPlaying = true;
        })
        .catch(err => {
            console.error("Error accessing webcam: " + err);
        });
}

function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        controlButton.textContent = 'Start Webcam';
        screenshotButton.disabled = true;
        isPlaying = false;
    }
}



function takeScreenshot() {
    // Create an off-screen canvas for resizing
    const offScreenCanvas = document.createElement('canvas');
    const offScreenCtx = offScreenCanvas.getContext('2d');

    // Set the desired width for the resized image
    const desiredWidth = draw_area_width; // Set the desired width
	
	
    const aspectRatio = video.videoHeight / video.videoWidth;
    const desiredHeight = desiredWidth * aspectRatio;

    // Set off-screen canvas dimensions
    offScreenCanvas.width = desiredWidth;
    offScreenCanvas.height = desiredHeight;

    // Draw the webcam video on the off-screen canvas
    offScreenCtx.drawImage(video, 0, 0, desiredWidth, desiredHeight);

    // Set screenshot canvas dimensions to match the resized image
    screenshotCanvas.width = desiredWidth;
    screenshotCanvas.height = desiredHeight;

    // Draw the resized image on the screenshot canvas
    screenshotCtx.drawImage(offScreenCanvas, 0, 0);

    // Load the image from the screenshot canvas to be displayed on the main canvas
    img.onload = () => {
        // Clear previous markups
        shapes = [];
        ctx.clearRect(0, 0, imageCanvas1.width, imageCanvas1.height);
        // Set new image dimensions and draw
        imageCanvas1.width = desiredWidth;
        imageCanvas1.height = desiredHeight;
        ctx.drawImage(img, 0, 0);
    };
    img.src = screenshotCanvas.toDataURL('image/png');
}


// Image Marker
// -------------

function handleImageUpload(event) {
    const reader = new FileReader();
    reader.onload = function (e) {
        img.onload = () => {
            // Create an off-screen canvas to resize the image
            const offScreenCanvas = document.createElement('canvas');
            const offScreenCtx = offScreenCanvas.getContext('2d');
            
            // Set the desired width and height for the resized image
            const desiredWidth = draw_area_width;  // Set the desired width
			
			
            const aspectRatio = img.height / img.width;
            const desiredHeight = desiredWidth * aspectRatio;

            // Resize the image on the off-screen canvas
            offScreenCanvas.width = desiredWidth;
            offScreenCanvas.height = desiredHeight;
            offScreenCtx.drawImage(img, 0, 0, desiredWidth, desiredHeight);

            // Clear the main canvas
            shapes = [];
            ctx.clearRect(0, 0, imageCanvas1.width, imageCanvas1.height);

            // Set main canvas dimensions to match the resized image
            imageCanvas1.width = desiredWidth;
            imageCanvas1.height = desiredHeight;

            // Draw the resized image onto the main canvas
            ctx.drawImage(offScreenCanvas, 0, 0);
            calculateScalingFactors(); // Calculate scaling factors after setting the image dimensions
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

function saveMarkedImage() {
    const link = document.createElement('a');
    link.download = 'marked_image.png';
    link.href = imageCanvas1.toDataURL();
    link.click();
}

function clearSelectedAreas() {
    shapes = [];
    ctx.clearRect(0, 0, imageCanvas1.width, imageCanvas1.height);
    ctx.drawImage(img, 0, 0, imageCanvas1.width, imageCanvas1.height);
    redrawShapes();
}

function undoLastAction() {
    shapes.pop();
    ctx.clearRect(0, 0, imageCanvas1.width, imageCanvas1.height);
    ctx.drawImage(img, 0, 0, imageCanvas1.width, imageCanvas1.height);
    redrawShapes();
}

imageCanvas1.addEventListener('mousedown', (e) => {
    const rect = imageCanvas1.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;
});

imageCanvas1.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const rect = imageCanvas1.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        redrawShapes();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        if (drawMode === 'box') {
            ctx.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
        } else if (drawMode === 'arrow') {
            drawArrow(ctx, startX, startY, mouseX, mouseY);
        }
    }
});

imageCanvas1.addEventListener('mouseup', (e) => {
    if (isDrawing) {
        const rect = imageCanvas1.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const shape = {
            type: drawMode,
            startX: startX,
            startY: startY,
            endX: mouseX,
            endY: mouseY
        };
        shapes.push(shape);
        isDrawing = false;
        redrawShapes();
    }
});

imageCanvas1.addEventListener('click', (e) => {
    const rect = imageCanvas1.getBoundingClientRect();
    let clickedX = e.clientX - rect.left;
    let clickedY = e.clientY - rect.top;
    shapes = shapes.filter(shape => {
        if (shape.type === 'box') {
            return !(
                clickedX > shape.startX &&
                clickedX < shape.startX + (shape.endX - shape.startX) &&
                clickedY > shape.startY &&
                clickedY < shape.startY + (shape.endY - shape.startY)
            );
        } else if (shape.type === 'arrow') {
            // Additional logic can be added here for arrow detection, if needed.
            return true;
        }
    });
    ctx.drawImage(img, 0, 0, imageCanvas1.width, imageCanvas1.height);
    redrawShapes();
});

function redrawShapes() {
    ctx.clearRect(0, 0, imageCanvas1.width, imageCanvas1.height);
    ctx.drawImage(img, 0, 0, imageCanvas1.width, imageCanvas1.height);
    shapes.forEach(shape => {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        if (shape.type === 'box') {
            ctx.strokeRect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY);
        } else if (shape.type === 'arrow') {
            drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY);
        }
    });
}



function drawArrow(ctx, fromx, fromy, tox, toy) {
    const headlen = 10; // length of head in pixels
    const angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(fromx, fromy);
    ctx.lineTo(fromx + headlen * Math.cos(angle - Math.PI / 6), fromy + headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(fromx + headlen * Math.cos(angle + Math.PI / 6), fromy + headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function calculateScalingFactors() {
    // Implement your scaling factor calculations here if needed
}
