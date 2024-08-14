import "./style.css";
import * as THREE from "three";
import "./statistics.js";
import { checkCollisions } from "./collision.js";
import { checkMovingYacht, initSoundSystem } from "./sounds.js";
import { addAllModels, yachtModel } from "./models.js";
import { updateKeyBoard } from "./keyboard.js";
import { camera, initializeCamera, updateCamera } from "./camera.js";
import { handleWindowResize, initializeRenderer, initializeScene, renderer, scene } from "./sceneSetup.js";
import { setupGUI } from "./controls.js";
import { initializeEnvironment, water } from "./environment.js";
import { updateCompass } from "./compass.js";
import { move, ship, updateYachtModelPositon } from "./ship.js";


// Canvas
const canvas = document.querySelector("canvas.webgl"); // is used to select the canvas element with the class name "webgl" and assign it to the variable canvas.
//This is typically used when working with Three.js to specify the canvas element where the WebGL rendering will take place.
//In Three.js, a canvas is a HTML element used to render 3D graphics and animations. It is the area where all the 3D objects and scenes are drawn and displayed on the web page.
// The canvas element provides a space for rendering and interacting with 3D content in a Three.js application.
// Developers can manipulate and control the canvas to create dynamic and interactive 3D visuals using Three.js library.

// Sizes
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
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  // Update Keyboard
  updateKeyBoard()
  // Water
  water.material.uniforms["time"].value = elapsedTime;
  if (yachtModel) {
    // Check If Yacht Intersects With Object
    let intersects = checkCollisions(scene, yachtModel);
    // Get Forces and Rotations Values
    move(deltaTime, intersects);
    // Update yacht model position based on wave elevation
    updateYachtModelPositon(intersects, elapsedTime)
    // Check Yacht Moving For Sound
    checkMovingYacht(ship.velocity.z)
    // Update Camera Position
    updateCamera(yachtModel)
  }
  // Update Compass
  updateCompass(camera)
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