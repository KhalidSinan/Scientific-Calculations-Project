// Model
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { createBoundingBoxForYacht } from "./collision.js";

const dracoLoader = new DRACOLoader(); //This instance can be used to load and decode Draco compressed 3D geometry data in Three.js.
dracoLoader.setDecoderPath("/draco/"); //The Draco loader is a JavaScript module used for loading and decoding Draco-compressed 3D models. By setting the decoder path to "/draco/", the loader will look for the decoder module in that directory when decoding Draco-compressed models.

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);


let yachtModel;
let mountainModel;
let lighthouseModel;
let islandModel

function addAllModels(scene, camera) {
    gltfLoader.load("/models/yacht/scene.gltf", (gltf) => {
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.translateY(1.125);
        yachtModel = gltf.scene;
        camera.lookAt(yachtModel.position);
        createBoundingBoxForYacht(scene, yachtModel)
        scene.add(yachtModel);
    });

    gltfLoader.load("/models/mountain/scene.gltf", (gltf) => {
        gltf.scene.scale.set(100, 100, 100);
        gltf.scene.translateZ(700);
        gltf.scene.translateX(-700);
        mountainModel = gltf.scene;
        scene.add(mountainModel);

        mountainModel.boundingBox = new THREE.Box3().setFromObject(mountainModel, true);

        const boxHelper = new THREE.BoxHelper(mountainModel);
        scene.add(boxHelper);
    });

    gltfLoader.load("/models/lighthouse/scene.glb", (gltf) => {
        gltf.scene.scale.set(15, 15, 15);
        gltf.scene.translateZ(300);
        gltf.scene.translateX(-300);
        lighthouseModel = gltf.scene;
        scene.add(lighthouseModel);
    });

    gltfLoader.load("/models/island/scene.glb", (gltf) => {
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.translateZ(600);
        gltf.scene.translateX(600);
        islandModel = gltf.scene;
        scene.add(islandModel);
    });
}

export { addAllModels, yachtModel }