// faceDetection.js

const fs = require('fs');
const faceapi = require('face-api.js');
const canvas = require('canvas');

// Set up face-api.js to use a custom canvas
faceapi.env.monkeyPatch({ canvas: canvas });

// Load face-api.js models
const modelsPath = './node_modules/face-api.js/weights';
faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);

// Load known faces
const loadKnownFaces = async () => {
  const knownFaces = [];

  // Load known face images
  const imagePaths = fs.readdirSync('./known_faces');
  for (const imagePath of imagePaths) {
    const img = await canvas.loadImage(`./known_faces/${imagePath}`);
    const faceDescriptor = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    knownFaces.push({ name: imagePath.split('.')[0], descriptor: faceDescriptor.descriptor });
  }

  return knownFaces;
};

const detectFace = async (inputImagePath) => {
  const knownFaces = await loadKnownFaces();

  // Load image asynchronously using canvas.loadImage
  const img = await canvas.loadImage(inputImagePath);

  // Wrap face detection in a Promise to wait for the image to load
  return new Promise(async (resolve) => {
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

    // Compare with known faces
    for (const detection of detections) {
      const bestMatch = faceapi.euclideanDistance(knownFaces.map(face => face.descriptor), detection.descriptor);
      console.log(`Detected face: ${bestMatch.toString()}`);
    }

    resolve();
  });
};

// Replace 'input.jpg' with the path to the input image
detectFace('input.jpg').then(() => {
  // Handle any further processing or close the script
  console.log('Face detection completed.');
});
