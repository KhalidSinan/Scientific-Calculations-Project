import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //OrbitControls is a helper library in Three.js that provides an easy-to-use way to control the camera in a 3D scene.
import * as dat from "lil-gui"; //dat.GUI can be used to add controls such as sliders, buttons, and checkboxes to manipulate properties and settings of a Three.js scene.
import waterVertexShader from "./shaders/water/vertex.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import calculateOfElevation from "./wavesYacht";
import { addEngineControlsTo } from "./controls/engine_controls";
import { addWaveControlsTo } from "./controls/wave_controls";
import { addConstantsControlsTo } from "./controls/constants_controls";
import { addWindControlsTo } from "./controls/wind_controls";
import { addCurrentControlsTo } from "./controls/current_controls";
import { addShipControlsTo } from "./controls/ship_controls";
import { addFuelControlsTo } from "./controls/fuel_controls";
import { waveController } from "./controls/wave_controls";
/**
 * Base
 */


// Debug
const gui = new dat.GUI({ width: 340 });
addEngineControlsTo(gui)
addFuelControlsTo(gui)
addWaveControlsTo(gui)
addConstantsControlsTo(gui)
addWindControlsTo(gui)
addCurrentControlsTo(gui)
addShipControlsTo(gui)
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl"); // is used to select the canvas element with the class name "webgl" and assign it to the variable canvas.
//This is typically used when working with Three.js to specify the canvas element where the WebGL rendering will take place.
//In Three.js, a canvas is a HTML element used to render 3D graphics and animations. It is the area where all the 3D objects and scenes are drawn and displayed on the web page.
// The canvas element provides a space for rendering and interacting with 3D content in a Three.js application.
// Developers can manipulate and control the canvas to create dynamic and interactive 3D visuals using Three.js library.

// Scene
const scene = new THREE.Scene(); //This statement creates a new THREE.js scene, which is basically a container that holds all the objects, lights, cameras,

// Model
const dracoLoader = new DRACOLoader(); //This instance can be used to load and decode Draco compressed 3D geometry data in Three.js.
dracoLoader.setDecoderPath("/draco/"); //The Draco loader is a JavaScript module used for loading and decoding Draco-compressed 3D models. By setting the decoder path to "/draco/", the loader will look for the decoder module in that directory when decoding Draco-compressed models.

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let yachtModel;
gltfLoader.load("/models/yacht/scene.gltf", (gltf) => {
  gltf.scene.scale.set(1, 1, 1);
  gltf.scene.translateY(1.125);
  yachtModel = gltf.scene;
  scene.add(yachtModel);
});

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(-5, 5, 0);
scene.add(directionalLight);

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2048, 2048, 512, 512);

// Material
const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    "/waternormals.jpg",
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping; //Repeat water texture
    }
  ),
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0x001e0f,
  distortionScale: 3.7,
  fog: scene.fog !== undefined,
  vertexShader: waterVertexShader,
  side: THREE.DoubleSide
});
// water.material.vertexShader = waterVertexShader
// water.material.fragmentShader = waterFragmentShader
water.material.onBeforeCompile = function (shader) {
  Object.keys(waveController).forEach(controller => {
    shader.uniforms[controller] = waveController[controller]
  });
};
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,//represents the vertical field of view in degrees. This essentially determines how much of the scene is visible through the camera lens.
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(1, 40, 20);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;  //enables a damping effect on the controls. This means that when the user stops interacting with the controls, they will continue to move for a short period of time before coming to a gradual stop. This can make the control movements feel smoother and more natural, rather than abruptly stopping when the user releases the input.

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Sky and Sun
let sky, sun;

// Add Sky
sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

sun = new THREE.Vector3();

/// GUI

const effectController = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.7,
  elevation: 2,
  azimuth: 180,
  exposure: renderer.toneMappingExposure,
};

function guiChanged() {
  // This code defines a function called guiChanged() that is used to update the sky and water materials
  // in a three.js scene based on the values of certain parameters controlled by a GUI (graphical user interface).
  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = effectController.turbidity;
  uniforms["rayleigh"].value = effectController.rayleigh;
  uniforms["mieCoefficient"].value = effectController.mieCoefficient;
  uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
  const theta = THREE.MathUtils.degToRad(effectController.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();

  renderer.toneMappingExposure = effectController.exposure;
  try {
    renderer.render(scene, camera);
  } catch (e) {
    console.log(e);
  }
}

const sunFolder = gui.addFolder("Sun");
sunFolder.close()
sunFolder
  .add(effectController, "turbidity", 0.0, 20.0, 0.1)
  .onChange(guiChanged);
sunFolder.add(effectController, "rayleigh", 0.0, 4, 0.001)
.onChange(guiChanged);
sunFolder
  .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
  .onChange(guiChanged);
sunFolder
  .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
  .onChange(guiChanged);
sunFolder.add(effectController, "elevation", 0, 90, 0.1)
.onChange(guiChanged);
sunFolder.add(effectController, "azimuth", -180, 180, 0.1)
.onChange(guiChanged);
sunFolder.add(effectController, "exposure", 0, 1, 0.0001)
.onChange(guiChanged);


guiChanged();

/**
 * Animate
 */
const clock = new THREE.Clock();

function init() {
  Object.keys(waveController).forEach(controller => {
    water.material.uniforms[controller] = waveController[controller]
  });
}
init();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();  

  // Water
  water.material.uniforms['time'].value = elapsedTime;
  if (yachtModel) {
    // Update yacht model position based on wave elevation
    yachtModel.position.y = 22.5 + calculateOfElevation(elapsedTime, waveController,yachtModel.position.x, yachtModel.position.z);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);


// It first gets the elapsed time using the clock.getElapsedTime() method.

// It updates the water material in the scene by setting the value of the uniform variable "time" to the elapsed time. It also logs the current value of the "uBigWavesFrequency" uniform variable.

// If the yachtModel exists, it updates the position of the model based on the wave elevation at its current position.

// It then updates the controls, allowing the user to interact with the scene.

// It renders the scene using the renderer.render(scene, camera) method.

// Finally, it calls window.requestAnimationFrame(tick) to schedule the next call to the tick function on the next frame render, creating a loop for continuous updating of the scene.

// Overall, this code controls the animation and interaction in a three.js scene, updating the water, yacht model position, controls, and rendering the scene on each frame.
};

tick();


