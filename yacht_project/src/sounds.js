import * as THREE from "three";

const listener = new THREE.AudioListener();
let oceanSound = new THREE.Audio(listener);
let engineSound = new THREE.Audio(listener);

function initSoundSystem(camera) {
    camera.add(listener)
    // to load sound files
    const audioLoader = new THREE.AudioLoader();
    oceanSound = new THREE.Audio(listener);
    // create ocean audio always playing
    audioLoader.load('sounds/oceanSound.mp3', function (buffer) {
        oceanSound.setBuffer(buffer);
        oceanSound.setLoop(true);
        oceanSound.setVolume(0.2);
        oceanSound.play();
    });
    engineSound = new THREE.Audio(listener);
    // create sound of yacht moving
    audioLoader.load('sounds/yachtMovingSound.mp3', function (buffer) {
        engineSound.setBuffer(buffer);
        engineSound.setLoop(false); // false because only plays when moving
        engineSound.setVolume(0.1);
        // engineSound.play();
    });
}

function checkMovingYacht(speed) {
    if (Math.floor(speed) > 0 && !engineSound.isPlaying) engineSound.play()
}

export { initSoundSystem, checkMovingYacht }