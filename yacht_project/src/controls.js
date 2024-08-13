import * as THREE from 'three'
import * as dat from "lil-gui"; //dat.GUI can be used to add controls such as sliders, buttons, and checkboxes to manipulate properties and settings of a Three.js scene.
import { toggleFreeCamera } from './camera';
import { addEngineControlsTo } from "./controls/engine_controls";
import { addConstantsControlsTo } from "./controls/constants_controls";
import { addWindControlsTo } from "./controls/wind_controls";
import { addCurrentControlsTo } from "./controls/current_controls";
import { addShipControlsTo } from "./controls/ship_controls";
import { addFuelControlsTo } from "./controls/fuel_controls";
import { addWaveControlsTo } from "./controls/wave_controls";
import { updateSunAndWater } from './environment';
import { renderer } from './sceneSetup';

let gui
/// GUI
let effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
    exposure: renderer ? renderer.toneMappingExposure : 0.7, // Use a default value if renderer is not yet defined
};

function addCameraFolder() {
    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add({ toggleFreeCamera }, 'toggleFreeCamera').name('Toggle Free Camera');
    cameraFolder.close();
}

function addSunFolder() {
    const sunFolder = gui.addFolder("Sun");
    sunFolder.close();
    sunFolder
        .add(effectController, "turbidity", 0.0, 20.0, 0.1)
        .onChange(updateSunAndWater);
    sunFolder.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(updateSunAndWater);
    sunFolder
        .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
        .onChange(updateSunAndWater);
    sunFolder
        .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
        .onChange(updateSunAndWater);
    sunFolder.add(effectController, "elevation", 0, 90, 0.1).onChange(updateSunAndWater);
    sunFolder.add(effectController, "azimuth", -180, 180, 0.1).onChange(updateSunAndWater);
    sunFolder.add(effectController, "exposure", 0, 1, 0.0001).onChange(updateSunAndWater);
}

function setupGUI() {
    gui = new dat.GUI({ width: 340 });
    addEngineControlsTo(gui)
    addFuelControlsTo(gui)
    addWaveControlsTo(gui)
    addConstantsControlsTo(gui);
    addWindControlsTo(gui)
    addCurrentControlsTo(gui)
    addShipControlsTo(gui)
    addCameraFolder(gui)
    addSunFolder(gui)
}


export { setupGUI, gui, effectController }