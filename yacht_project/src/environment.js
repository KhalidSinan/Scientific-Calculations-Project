import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import waterVertexShader from './shaders/water/vertex.glsl';
import waterFragmentShader from './shaders/water/fragment.glsl';
import { waveController } from './controls/wave_controls';
import { effectController } from './controls';
import { renderer, scene } from './sceneSetup';
import { camera } from './camera';

let water, sky, sun;

function initializeWater(scene) {
    // Geometry
    const waterGeometry = new THREE.PlaneGeometry(2048, 2048, 512, 512);
    water = new Water(waterGeometry, {
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
        vertexShader: waterVertexShader,
        fragmentShader: waterFragmentShader,
        side: THREE.DoubleSide,
    });

    water.material.vertexShader = waterVertexShader;
    water.material.onBeforeCompile = function (shader) {
        Object.keys(waveController).forEach((controller) => {
            shader.uniforms[controller] = waveController[controller];
        });
    };

    water.rotation.x = -Math.PI * 0.5;
    scene.add(water);

    Object.keys(waveController).forEach((controller) => {
        water.material.uniforms[controller] = waveController[controller];
    });
}

function initializeSky(scene) {
    // Add Sky
    sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    sun = new THREE.Vector3();
}

function initializeEnvironment() {
    initializeWater(scene)
    initializeSky(scene)
    updateSunAndWater()
}

function updateSunAndWater() {
    // Update sky uniforms
    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = effectController.turbidity;
    uniforms['rayleigh'].value = effectController.rayleigh;
    uniforms['mieCoefficient'].value = effectController.mieCoefficient;
    uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();
    renderer.toneMappingExposure = effectController.exposure;
    renderer.render(scene, camera);
}

export { initializeEnvironment, updateSunAndWater, water }