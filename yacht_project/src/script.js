import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import waterVertexShader from "./shaders/water/vertex.glsl";
import waterFragmentShader from "./shaders/water/fragment.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import calculateOfElevation from "./wavesYacht";
/**
 * Base
 */
const amountOfEnergyByTypeOfFuel = {
  gasoline: [4400000, 4600000],
  gas: [4500000, 5500000],
  diesel: [3500000, 4000000],
  propane: [4600000, 5000000],
  coal: [2400000, 3500000]
}

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
  selectedFuelType: 'gasoline',
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
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Model
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;
let yachtModel;
gltfLoader.load("/models/yacht/scene.gltf", (gltf) => {
  gltf.scene.scale.set(2, 2, 2);
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

// Colors
debugObject.depthColor = "#186691";
debugObject.surfaceColor = "#5fbdf7";

// Material
const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    '/waternormals.jpg',
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }
  ),
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0x001e0f,
  distortionScale: 3.7,
  fog: scene.fog !== undefined,
});
water.material.vertexShader = waterVertexShader
// water.material.fragmentShader = waterFragmentShader
water.material.onBeforeCompile = function (shader) {

  shader.uniforms.uTime = { value: 0 }
  shader.uniforms.uBigWavesElevation = { value: 0.039 }
  shader.uniforms.uBigWavesFrequency = { value: new THREE.Vector2(1.361, 1.748) }
  shader.uniforms.uBigWavesSpeed = { value: 0.544 }
  shader.uniforms.uSmallWavesElevation = { value: 0.074 }
  shader.uniforms.uSmallWavesFrequency = { value: 3 }
  shader.uniforms.uSmallWavesSpeed = { value: 0.5 }
  shader.uniforms.uSmallIterations = { value: 4 }

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
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

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
  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = effectController.turbidity;
  uniforms["rayleigh"].value = effectController.rayleigh;
  uniforms["mieCoefficient"].value = effectController.mieCoefficient;
  uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
  const theta = THREE.MathUtils.degToRad(effectController.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms['sunDirection'].value.copy(sun).normalize();

  renderer.toneMappingExposure = effectController.exposure;
  try {
    renderer.render(scene, camera);
  } catch (e) {
    console.log(e)
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
  water.material.uniforms['uTime'] = { value: 0 }
  water.material.uniforms['uBigWavesElevation'] = { value: 0.039 }
  water.material.uniforms['uBigWavesFrequency'] = { value: new THREE.Vector2(1.361, 1.748) }
  water.material.uniforms['uBigWavesSpeed'] = { value: 0.544 }
  water.material.uniforms['uSmallWavesElevation'] = { value: 0.074 }
  water.material.uniforms['uSmallWavesFrequency'] = { value: 3 }
  water.material.uniforms['uSmallWavesSpeed'] = { value: 0.5 }
  water.material.uniforms['uSmallIterations'] = { value: 4 }
}
init()

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Water
  water.material.uniforms['time'].value = elapsedTime;
  console.log(water.material.uniforms['uBigWavesFrequency'].value)
  if (yachtModel) {
    // Update yacht model position based on wave elevation
    yachtModel.position.y = 22.5 + getWaveElevation(yachtModel.position.x, yachtModel.position.z, elapsedTime);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick()


function getWaveElevation(x, z, time) {

  // Calculate wave elevation at the given x, z position
  const uBigWavesElevation = water.material.uniforms['uBigWavesElevation']
  const uBigWavesFrequency = water.material.uniforms['uBigWavesFrequency']
  const uBigWavesSpeed = water.material.uniforms['uBigWavesSpeed']
  const uSmallWavesElevation = water.material.uniforms['uSmallWavesElevation']
  const uSmallWavesFrequency = water.material.uniforms['uSmallWavesFrequency']
  const uSmallWavesSpeed = water.material.uniforms['uSmallWavesSpeed']
  const uSmallIterations = water.material.uniforms['uSmallIterations']
  return calculateOfElevation(time, uBigWavesElevation, uBigWavesFrequency, uBigWavesSpeed,
    uSmallWavesElevation, uSmallWavesFrequency, uSmallWavesSpeed, uSmallIterations, x, z);
}

wavesFolder
  .add(water.material.uniforms['uBigWavesElevation'], "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesElevation");
wavesFolder
  .add(water.material.uniforms['uBigWavesFrequency'].value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyX");
wavesFolder
  .add(water.material.uniforms['uBigWavesFrequency'].value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyY");
wavesFolder
  .add(water.material.uniforms['uBigWavesSpeed'], "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uBigWavesSpeed");

wavesFolder
  .add(water.material.uniforms['uSmallWavesElevation'], "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uSmallWavesElevation");
wavesFolder
  .add(water.material.uniforms['uSmallWavesFrequency'], "value")
  .min(0)
  .max(30)
  .step(0.001)
  .name("uSmallWavesFrequency");
wavesFolder
  .add(water.material.uniforms['uSmallWavesSpeed'], "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uSmallWavesSpeed");
wavesFolder
  .add(water.material.uniforms['uSmallIterations'], "value")
  .min(0)
  .max(5)
  .step(1)
  .name("uSmallIterations");

engineFolder.add(panelVar, "fuelConsumption").min(450).max(850).step(10);
engineFolder.add(panelVar, "engineEfficiency");
engineFolder.add(panelVar, "Vin");
// engineFolder.add(panelVar, '')

shipFolder.add(panelVar, "shipMass").min(1800).max(40000).step(100); // kilogram
shipFolder.add(panelVar, "shipLength").min(10).max(40).step(1) // meter
shipFolder.add(panelVar, "shipWidth").min(5).max(7).step(1);
shipFolder.add(panelVar, "shipDepth").min(10).max(20).step(1);

windFolder.add(panelVar, "Va").min(0).max(200).step(5); // kilometer
windFolder.add(panelVar, "Ba").min(0).max(360).step(1);

currentFolder.add(panelVar, "Vc").min(0).max(100).step(5);
currentFolder.add(panelVar, "Bc").min(0).max(360).step(1);

constantsFolder.add(panelVar, "rho").min(0).max(1).step(0.01);

// Add option for selecting fuel type
const fuelFolder = gui.add(panelVar, 'selectedFuelType', Object.keys(amountOfEnergyByTypeOfFuel)).name('Fuel Type');
let tempMax = amountOfEnergyByTypeOfFuel.gasoline[0];
let tempMin = amountOfEnergyByTypeOfFuel.gasoline[1];

const engineController = engineFolder.add(panelVar, 'sourceEnergyOfFuel').min(tempMin).max(tempMax).step(1000);

fuelFolder.onChange((value) => {
  const fuelTypeData = amountOfEnergyByTypeOfFuel[value];
  const min = fuelTypeData[0];
  const max = fuelTypeData[1];

  engineController.min(min);
  engineController.max(max);
});


