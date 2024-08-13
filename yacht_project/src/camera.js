import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //OrbitControls is a helper library in Three.js that provides an easy-to-use way to control the camera in a 3D scene.
import { renderer, scene } from "./sceneSetup";

let camera
let isFreeCameraEnabled = false
let controls; // OrbitControls instance

function initializeCamera(sizes) {
    camera = new THREE.PerspectiveCamera(
        75,//represents the vertical field of view in degrees. This essentially determines how much of the scene is visible through the camera lens.
        sizes.width / sizes.height,
        0.1,//specifies the distance from the camera where objects will start to be rendered. Anything closer to the camera than this distance will not be visible.
        5000//specifies the distance from the camera where objects will stop being rendered. Anything further away from the camera than this distance will not be visible.
    );
    camera.position.set(1, 40, 20);
    scene.add(camera)
    setupOrbitControls()
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
function setupOrbitControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; //enables a damping effect on the controls. This means that when the user stops interacting with the controls, they will continue to move for a short period of time before coming to a gradual stop. This can make the control movements feel smoother and more natural, rather than abruptly stopping when the user releases the input.
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