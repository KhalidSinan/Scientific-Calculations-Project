import * as THREE from "three";
import { engineController } from "./controls/engine_controls";
import { constantsController } from "./controls/constants_controls";
import { windController } from "./controls/wind_controls";
import { currentController } from "./controls/current_controls";
import { shipController } from "./controls/ship_controls";
import { fuelController } from "./controls/fuel_controls";
import { forces, rotations } from "./functions";
import calculateOfElevation from "./wavesYacht";
import { yachtModel } from "./models";
import { waveController } from "./controls/wave_controls";

const ship = {
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

function move(deltaTime, intersects) {
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

function updateYachtModelPositon(intersects, elapsedTime) {
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
}

export { ship, move, updateYachtModelPositon }