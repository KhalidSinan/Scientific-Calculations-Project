import { toggleFreeCamera } from "./camera";

const keys = {
    W: false,
    A: false,
    S: false,
    D: false,
    F: false
};

document.addEventListener('keydown', event => {
    keys[event.key.toUpperCase()] = true;
});

document.addEventListener('keyup', event => {
    keys[event.key.toUpperCase()] = false;
});

function updateKeyBoard(shipController, engineController) {
    if (keys['W']) {
        engineController.Vin += 0.01;
    }
    if (keys['A']) {
        if (shipController.angleY <= 30) {
            shipController.angleY += 0.01;
        }
    }
    if (keys['S']) {
        if (engineController.Vin > 0) {
            engineController.Vin -= 0.01;
        }
    }
    if (keys['D']) {
        if (shipController.angleY >= -30) {
            shipController.angleY -= 0.01;
        }
    }
    if (keys['F']) {
        toggleFreeCamera()
    }
}

export { updateKeyBoard }