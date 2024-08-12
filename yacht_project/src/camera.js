import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //OrbitControls is a helper library in Three.js that provides an easy-to-use way to control the camera in a 3D scene.

let camera
let isFreeCameraEnabled = false
let controls; // OrbitControls instance

function initializeCamera(sizes, scene) {
    camera = new THREE.PerspectiveCamera(
        75, //represents the vertical field of view in degrees. This essentially determines how much of the scene is visible through the camera lens.
        sizes.width / sizes.height,
        0.1,
        5000
    );
    camera.position.set(1, 40, 20);
    scene.add(camera)
}

function toggleFreeCamera() {
    isFreeCameraEnabled = !isFreeCameraEnabled;

    if (isFreeCameraEnabled) {
        controls.enabled = true; // Enable OrbitControls
    } else {
        controls.enabled = false; // Disable OrbitControls
    }
}


// Initialize OrbitControls for free camera movement
function setupOrbitControls(renderer) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth movement
}

function updateCamera(yachtModel) {
    if (!isFreeCameraEnabled) {
        const cameraDistance = 50;
        const cameraHeight = 30;
        const cameraRotation = (-Math.PI / 2) - yachtModel.rotation.y;
        const x = yachtModel.position.x + cameraDistance * Math.cos(cameraRotation);
        const y = yachtModel.position.y + cameraHeight;
        const z = yachtModel.position.z + cameraDistance * Math.sin(cameraRotation);
        camera.position.set(x, y, z);
        camera.lookAt(yachtModel.position);
    }
}
export { camera, initializeCamera, setupOrbitControls, toggleFreeCamera, updateCamera }