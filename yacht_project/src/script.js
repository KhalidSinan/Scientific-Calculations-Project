import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; //OrbitControls is a helper library in Three.js that provides an easy-to-use way to control the camera in a 3D scene.
import * as dat from "lil-gui"; //dat.GUI can be used to add controls such as sliders, buttons, and checkboxes to manipulate properties and settings of a Three.js scene.
import waterVertexShader from "./shaders/water/vertex.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; //which is a loader specifically designed for loading 3D models in the GLTF format.
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"; // The DRACOLoader helps to reduce file size and improve rendering performance by compressing and decompressing geometry data.
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import calculateOfElevation from "./wavesYacht"; //This function is likely used to calculate the elevation of waves for a yacht in a 3D scene.
/**
 * Base
 */
const amountOfEnergyByTypeOfFuel = {
  gasoline: [4400000, 4600000],
  gas: [4500000, 5500000],
  diesel: [3500000, 4000000],
  propane: [4600000, 5000000],
  coal: [2400000, 3500000],
};

export const panelVar = {
  rho: 0.9,
  fuelConsumption: 53,
  sourceEnergyOfFuel: 53,
  engineEfficiency: 53,
  Vin: 355,
  shipMass: 2000,
  shipLength: 100,
  shipWidth: 60,
  shipDepth: 100,
  Va: 100,
  Ba: 100,
  Vc: 100,
  Bc: 100,
  selectedFuelType: "gasoline",
};

// Debug
const gui = new dat.GUI({ width: 340 });
const debugObject = {};

const waterFolder = gui.addFolder("Water");
const wavesFolder = gui.addFolder("Waves");
const sunFolder = gui.addFolder("Sun");
const constantsFolder = gui.addFolder("Constants");
const windFolder = gui.addFolder("Wind");
const currentFolder = gui.addFolder("Current");
const engineFolder = gui.addFolder("Engine");
const shipFolder = gui.addFolder("Ship");
// const currentFolder = gui.addFolder('Current')

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
  ), //This is a texture used for water normals that is loaded from the "/waternormals.jpg" file. The texture is set to repeat wrapping.
  sunDirection: new THREE.Vector3(), // The direction of the sun for lighting the water.
  sunColor: 0xffffff, // The color of the sun for lighting the water.
  waterColor: 0x001e0f, //The color of the water.
  distortionScale: 3.7, //The scale of distortion applied to the water.
  fog: scene.fog !== undefined, // Whether fog is enabled in the scene.
});
water.material.vertexShader = waterVertexShader;

// This code is setting up custom uniforms for a water material in Three.js. The onBeforeCompile function allows you to modify the shader code before it gets compiled and used in the rendering process.
water.material.onBeforeCompile = function (shader) {    
// uBigWavesElevation: A uniform defining the elevation of big waves in the water.
  shader.uniforms.uBigWavesElevation = { value: 0.039 };
// uBigWavesFrequency: A uniform defining the frequency of big waves in the water, as a Vector2.
  shader.uniforms.uBigWavesFrequency = {
    value: new THREE.Vector2(1.361, 1.748),
  };
// uBigWavesSpeed: A uniform defining the speed of the big waves animation.
  shader.uniforms.uBigWavesSpeed = { value: 0.544 };
// uSmallWavesElevation: A uniform defining the elevation of small waves in the water.
  shader.uniforms.uSmallWavesElevation = { value: 0.074 };
// uSmallWavesFrequency: A uniform defining the frequency of small waves in the water.
  shader.uniforms.uSmallWavesFrequency = { value: 3 };
// uSmallWavesSpeed: A uniform defining the speed of the small waves animation.
  shader.uniforms.uSmallWavesSpeed = { value: 0.5 };
// uSmallIterations: A uniform defining the number of iterations for generating small waves.
  shader.uniforms.uSmallIterations = { value: 4 };
};
// These custom uniforms can be used in the shader code to create realistic water animations and effects in a Three.js scene.

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
  0.1,//specifies the distance from the camera where objects will start to be rendered. Anything closer to the camera than this distance will not be visible.
  1000//specifies the distance from the camera where objects will stop being rendered. Anything further away from the camera than this distance will not be visible.
);
camera.position.set(0, 30, -80);
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

sunFolder
  .add(effectController, "turbidity", 0.0, 20.0, 0.1)
  .onChange(guiChanged);
sunFolder.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
sunFolder
  .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
  .onChange(guiChanged);
sunFolder
  .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
  .onChange(guiChanged);
sunFolder.add(effectController, "elevation", 0, 90, 0.1).onChange(guiChanged);
sunFolder.add(effectController, "azimuth", -180, 180, 0.1).onChange(guiChanged);
sunFolder.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged);

guiChanged();

/**
 * Animate
 */
const clock = new THREE.Clock();

function init() {
  water.material.uniforms["uBigWavesElevation"] = { value: 0.039 };
  water.material.uniforms["uBigWavesFrequency"] = {
    value: new THREE.Vector2(1.361, 1.748),
  };
  water.material.uniforms["uBigWavesSpeed"] = { value: 0.544 };
  water.material.uniforms["uSmallWavesElevation"] = { value: 0.074 };
  water.material.uniforms["uSmallWavesFrequency"] = { value: 3 };
  water.material.uniforms["uSmallWavesSpeed"] = { value: 0.5 };
  water.material.uniforms["uSmallIterations"] = { value: 4 };
}
init();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();  

  // Water
  water.material.uniforms["time"].value = elapsedTime;
  if (yachtModel) {
    // Update yacht model position based on wave elevation
    yachtModel.position.y =
      12.5 +
      getWaveElevation(
        yachtModel.position.x,
        yachtModel.position.z,
        elapsedTime
      );
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

function getWaveElevation(x, z, time) {
  // Calculate wave elevation at the given x, z position
  const uBigWavesElevation = water.material.uniforms["uBigWavesElevation"];
  const uBigWavesFrequency = water.material.uniforms["uBigWavesFrequency"];
  const uBigWavesSpeed = water.material.uniforms["uBigWavesSpeed"];
  const uSmallWavesElevation = water.material.uniforms["uSmallWavesElevation"];
  const uSmallWavesFrequency = water.material.uniforms["uSmallWavesFrequency"];
  const uSmallWavesSpeed = water.material.uniforms["uSmallWavesSpeed"];
  const uSmallIterations = water.material.uniforms["uSmallIterations"];
  return calculateOfElevation(
    time,
    uBigWavesElevation,
    uBigWavesFrequency,
    uBigWavesSpeed,
    uSmallWavesElevation,
    uSmallWavesFrequency,
    uSmallWavesSpeed,
    uSmallIterations,
    x,
    z
  );
  // This function calculates the wave elevation at a given position (x, z) based on the specified parameters related to big and small waves.
  // It retrieves the values of wave elevation, frequency, speed, and iterations from the water material uniforms, 
  //and then calls the calculateOfElevation function with these values along with the current time and the x, z position. 
  //The calculateOfElevation function likely performs calculations to determine the wave elevation at the specified position based on the given parameters.
}

wavesFolder
  .add(water.material.uniforms["uBigWavesElevation"], "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesElevation");
wavesFolder
  .add(water.material.uniforms["uBigWavesFrequency"].value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyX");
wavesFolder
  .add(water.material.uniforms["uBigWavesFrequency"].value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyY");
wavesFolder
  .add(water.material.uniforms["uBigWavesSpeed"], "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uBigWavesSpeed");

wavesFolder
  .add(water.material.uniforms["uSmallWavesElevation"], "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uSmallWavesElevation");
wavesFolder
  .add(water.material.uniforms["uSmallWavesFrequency"], "value")
  .min(0)
  .max(30)
  .step(0.001)
  .name("uSmallWavesFrequency");
wavesFolder
  .add(water.material.uniforms["uSmallWavesSpeed"], "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uSmallWavesSpeed");
wavesFolder
  .add(water.material.uniforms["uSmallIterations"], "value")
  .min(0)
  .max(5)
  .step(1)
  .name("uSmallIterations");

engineFolder.add(panelVar, "fuelConsumption").min(450).max(850).step(10);
engineFolder.add(panelVar, "engineEfficiency");
engineFolder.add(panelVar, "Vin");
// engineFolder.add(panelVar, '')

shipFolder.add(panelVar, "shipMass").min(1800).max(40000).step(100); // kilogram
shipFolder.add(panelVar, "shipLength").min(10).max(40).step(1); // meter
shipFolder.add(panelVar, "shipWidth").min(5).max(7).step(1);
shipFolder.add(panelVar, "shipDepth").min(10).max(20).step(1);

windFolder.add(panelVar, "Va").min(0).max(200).step(5); // kilometer
windFolder.add(panelVar, "Ba").min(0).max(360).step(1);

currentFolder.add(panelVar, "Vc").min(0).max(100).step(5);
currentFolder.add(panelVar, "Bc").min(0).max(360).step(1);

constantsFolder.add(panelVar, "rho").min(0).max(1).step(0.01);

// Add option for selecting fuel type
const fuelFolder = gui
  .add(panelVar, "selectedFuelType", Object.keys(amountOfEnergyByTypeOfFuel))
  .name("Fuel Type");
let tempMax = amountOfEnergyByTypeOfFuel.gasoline[0];
let tempMin = amountOfEnergyByTypeOfFuel.gasoline[1];

const engineController = engineFolder
  .add(panelVar, "sourceEnergyOfFuel")
  .min(tempMin)
  .max(tempMax)
  .step(1000);

fuelFolder.onChange((value) => {
  const fuelTypeData = amountOfEnergyByTypeOfFuel[value];
  const min = fuelTypeData[0];
  const max = fuelTypeData[1];

  engineController.min(min);
  engineController.max(max);
});
