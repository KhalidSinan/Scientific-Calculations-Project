import "./style.css";
import * as THREE from "three";
import calculateOfElevation from "./wavesYacht"; //This function is likely used to calculate the elevation of waves for a yacht in a 3D scene.
import { engineController } from "./controls/engine_controls";
import { constantsController } from "./controls/constants_controls";
import { windController } from "./controls/wind_controls";
import { currentController } from "./controls/current_controls";
import { shipController } from "./controls/ship_controls";
import { fuelController } from "./controls/fuel_controls";
import { waveController } from "./controls/wave_controls";
import { forces, rotations } from "./functions";
import "./statistics.js";
import { checkCollisions } from "./collision.js";
import { checkMovingYacht, initSoundSystem } from "./sounds.js";
import { addAllModels, yachtModel } from "./models.js";
import { updateKeyBoard } from "./keyboard.js";
import { camera, initializeCamera, updateCamera } from "./camera.js";
import { handleWindowResize, initializeRenderer, initializeScene, renderer, scene } from "./sceneSetup.js";
import { setupGUI } from "./controls.js";
import { initializeEnvironment, water } from "./environment.js";

/**
 * Base
 */
export const ship = {
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  angles: {
    thetaX: 0,
    thetaY: 0,
    thetaZ: 0,
  },
  velocity: {
    x: 0,
    y: 0,
    z: 0,
  },
  angularVelocity: {
    x: 0,
    y: 0,
    z: 0,
  },
  thrustForce: 0,
  thrustForceTao: 0,
  visRes: {
    x: 0,
    y: 0,
    z: 0,
  },
  airRes: {
    x: 0,
    z: 0,
  },
  currForce: {
    x: 0,
    z: 0,
  },
  visResTao: {
    x: 0,
    y: 0,
    z: 0,
  },
  airResTao: {
    x: 0,
    y: 0,
    z: 0,
  },
  currForceTao: {
    x: 0,
    y: 0,
    z: 0,
  },
  weight: 0,
  bouyanceForce: 0,
};

// Canvas
const canvas = document.querySelector("canvas.webgl"); // is used to select the canvas element with the class name "webgl" and assign it to the variable canvas.
//This is typically used when working with Three.js to specify the canvas element where the WebGL rendering will take place.
//In Three.js, a canvas is a HTML element used to render 3D graphics and animations. It is the area where all the 3D objects and scenes are drawn and displayed on the web page.
// The canvas element provides a space for rendering and interacting with 3D content in a Three.js application.
// Developers can manipulate and control the canvas to create dynamic and interactive 3D visuals using Three.js library.

// Scene
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// Initializing Scene
initializeScene()
// Initializing Renderer
initializeRenderer(canvas, sizes)
// Initializing Camera
initializeCamera(sizes)
// Hadnling Window Resize
handleWindowResize(sizes);
// Initializing Sound System
initSoundSystem()
// Initializing GUI (Control Panel)
setupGUI()
// Initializing Environment
initializeEnvironment()
// Adding Models
addAllModels()


let prevTime = 0;
var dir = new THREE.Vector3();
var sph = new THREE.Spherical();


const clock = new THREE.Clock();
let intersects = false
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  updateKeyBoard(shipController, engineController)
  // Water
  water.material.uniforms["time"].value = elapsedTime;
  if (yachtModel) {
    move(deltaTime);
    intersects = checkCollisions(scene, yachtModel);

    // Update yacht model position based on wave elevation
    yachtModel.position.y =
      12.5 +
      calculateOfElevation(elapsedTime, waveController, yachtModel.position);

    if (!intersects) {
      yachtModel.rotation.x = ship.angles.thetaX;
      yachtModel.rotation.z = ship.angles.thetaZ;
      yachtModel.position.z = ship.position.z;
      yachtModel.position.x = ship.position.x;
    }
    yachtModel.rotation.y = ship.angles.thetaY;
    yachtModel.position.y += ship.position.y;

    checkMovingYacht(ship.velocity.z)

    updateCamera(yachtModel)
  }

  camera.getWorldDirection(dir);
  sph.setFromVector3(dir);
  const compass = document.getElementById('compassContainer')
  compass.style.transform = `rotate(${THREE.Math.radToDeg(sph.theta) - 180}deg)`;
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

}
tick();

function move(deltaTime) {
  const {
    accelerateZ,
    thrust,
    visResZ,
    airResZ,
    currForceZ,
    accelerateY,
    wghForce,
    bouyanceForce,
    visResY,
    accelerateX,
    airResX,
    currForceX,
    visResX,
  } = forces(
    ship.velocity,
    shipController,
    windController,
    currentController,
    engineController,
    fuelController,
    constantsController
  );
  const { angularAccelerationY, visResTaoY, thrForceY, airResY, currForceY } =
    rotations(
      ship,
      shipController,
      windController,
      currentController,
      engineController,
      fuelController,
      constantsController.waterDensity
    );

  if (!(ship.position instanceof THREE.Vector3)) {
    ship.position = new THREE.Vector3(ship.position.x || 0, ship.position.y || 0, ship.position.z || 0);
  }

  // to make it move forward based on its direction
  const direction = new THREE.Vector3(0, 0, 1)
  direction.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(ship.angles.thetaX, ship.angles.thetaY, ship.angles.thetaZ)));

  // Z
  ship.thrustForce = thrust;
  if (!intersects) {
    ship.visRes.z = visResZ;
    ship.airRes.z = airResZ;
    ship.currForce.z = currForceZ;

    ship.velocity.z += accelerateZ * deltaTime;
    ship.position.addScaledVector(direction, ship.velocity.z * deltaTime);
  }

  // Y
  ship.visRes.y = visResY;
  ship.velocity.y += accelerateY * deltaTime;
  ship.position.y += ship.velocity.y * deltaTime;

  // X
  ship.thrustForce = thrust;
  ship.visRes.x += visResX;
  ship.airRes.x += airResX;
  ship.currForce.x += currForceX;

  ship.velocity.x += accelerateX * deltaTime;
  ship.position.x += ship.velocity.x * deltaTime;

  // Tao Y
  ship.angularVelocity.y += angularAccelerationY * deltaTime;
  ship.angles.thetaY += ship.angularVelocity.y * deltaTime;
  ship.visResTao.y = visResTaoY;
  ship.airResTao.y = airResY;
  ship.currForceTao.y = currForceY;
  ship.thrustForceTao = thrForceY;
}


// For Testing Collision

// Function to create bounding boxes for the cubes
function addCubesOnWater(numCubes, waterLevel) {
  const geometry = new THREE.BoxGeometry(10, 10, 10); // Size of the cubes

  for (let i = 0; i < numCubes; i++) {
    // Create a cube
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Color of the cubes
    const cube = new THREE.Mesh(geometry, material);

    // Randomize position
    const x = Math.random() * 2048 - 1024; // Adjust range as needed
    const z = Math.random() * 2048 - 1024; // Adjust range as needed

    // Position the cube
    cube.position.set(x, waterLevel, z);

    // Add the cube to the scene
    scene.add(cube);

    // Add bounding box to the cube
    cube.boundingBox = new THREE.Box3().setFromObject(cube);
  }
}

// addCubesOnWater(500, water.position.y);