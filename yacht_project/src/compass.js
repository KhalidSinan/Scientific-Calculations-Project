import * as THREE from 'three';

function updateCompass(camera, compassElementId = 'compassContainer') {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    const sph = new THREE.Spherical();
    sph.setFromVector3(dir);

    const rotationAngle = THREE.Math.radToDeg(sph.theta) - 180;

    const compass = document.getElementById(compassElementId);
    if (compass) {
        compass.style.transform = `rotate(${rotationAngle}deg)`;
    }
}

export { updateCompass }