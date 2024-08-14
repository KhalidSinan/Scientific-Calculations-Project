
import * as THREE from "three";

// Function to create a bounding box for the yacht
// And use it when initializing the yacht
let yachtBoundingBox;
let yachtBoundingBoxHelper;

function createBoundingBoxForYacht(yachtModel) {
    if (yachtModel) {
        yachtBoundingBox = new THREE.Box3().setFromObject(yachtModel);
    }
}

// Update bounding box positions and check for collisions
function checkCollisions(scene, yachtModel) {
    if (yachtModel && yachtBoundingBox) {
        // Update the yacht's bounding box
        // when yacht moves the yachtBoudningBox should be updated
        yachtBoundingBox.setFromObject(yachtModel, true);
        yachtBoundingBoxHelper = new THREE.Box3Helper(yachtBoundingBox, 0xffff00);
        scene.add(yachtBoundingBoxHelper);

        let intersects = false
        // Check for intersections with each cube's bounding box
        // loop across all objects
        // check if it isMesh and it is BoxGeometry and if it has a bounding box
        scene.traverse((object) => {
            if (object !== yachtModel && object.boundingBox) {
                object.boundingBox.setFromObject(object);
                // if the yacht intersects the bounding box 
                // do something
                // example: change color
                if (yachtBoundingBox.intersectsBox(object.boundingBox)) {
                    intersects = true
                } else {
                    intersects = false
                }
            }
        });
        return intersects
    }
}

// For testing collision
// function addCubesOnWater(numCubes, waterLevel) {
//     const geometry = new THREE.BoxGeometry(10, 10, 10); // Size of the cubes

//     for (let i = 0; i < numCubes; i++) {
//       // Create a cube
//       const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Color of the cubes
//       const cube = new THREE.Mesh(geometry, material);

//       // Randomize position
//       const x = Math.random() * 2048 - 1024; // Adjust range as needed
//       const z = Math.random() * 2048 - 1024; // Adjust range as needed

//       // Position the cube
//       cube.position.set(x, waterLevel, z);

//       // Add the cube to the scene
//       scene.add(cube);

//       // Add bounding box to the cube
//       cube.boundingBox = new THREE.Box3().setFromObject(cube);
//     }
//   }

export { createBoundingBoxForYacht, checkCollisions }