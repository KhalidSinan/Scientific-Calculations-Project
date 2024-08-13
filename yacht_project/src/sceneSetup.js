import * as THREE from 'three';
import { addLights } from './lights.js'; // If you have a lights.js
import { camera } from './camera.js';

let scene, renderer

function initializeScene() {
    scene = new THREE.Scene(); //This statement creates a new THREE.js scene, which is basically a container that holds all the objects, lights, cameras,
    addLights(scene);
}

function initializeRenderer(canvas, sizes) {
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function handleWindowResize(sizes) {
    window.addEventListener("resize", () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // This code adds an event listener for the "resize" event,
        // which triggers when the window is resized.
        // When the event is triggered,
        //the code updates the sizes of the window,
        //updates the aspect ratio of the camera based on the new window size,
        //and updates the renderer to match the new window size and pixel ratio.
        // This ensures that the content displayed on the webpage is responsive and adjusts properly when the window is resized.
    });
}


export { initializeScene, initializeRenderer, handleWindowResize, scene, renderer }