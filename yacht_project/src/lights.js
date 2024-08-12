import * as THREE from "three";

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(-5, 5, 0);

function addLights(scene) {
    scene.add(ambientLight);
    scene.add(directionalLight);
}

export { addLights }