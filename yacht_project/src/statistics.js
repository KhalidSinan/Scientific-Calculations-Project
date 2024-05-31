import { ship } from "./script";

const statsButton = document.getElementById("statsButton");
const restartButton = document.getElementById("restartSimulationButton");
const statsPanel = document.getElementById("statsPanel");
const statsPanelContent = document.getElementById("statsPanelContent");
const statsPanelColorPicker = document.getElementById('statsPanelColorPicker');


statsButton.onclick = () => {
  if (statsPanel.style.display === "none") {
    statsPanel.style.display = "block";
    statsButton.textContent = "Close Stats";
  } else {
    statsPanel.style.display = "none";
    statsButton.textContent = "Show Stats";
  }
};

restartButton.onclick = () => {
  ship.position.x = 0
  ship.position.y = 0
  ship.position.z = 0
  ship.velocity.x = 0
  ship.velocity.y = 0
  ship.velocity.z = 0
  ship.angles.thetaX = 0
  ship.angles.thetaY = 0
  ship.angles.thetaZ = 0
  ship.angularVelocity.x = 0
  ship.angularVelocity.y = 0
  ship.angularVelocity.z = 0
  ship.thrustForce = 0
}

statsPanelColorPicker.onchange = (event) => {
  statsButton.style.borderColor = event.target.value;
  statsPanel.style.backgroundColor = event.target.value;
}

setInterval(() => {
  statsPanelContent.innerHTML = `
  <h3>Ship Velocity:</h3>
  <h4>x: ${ship.velocity.x} </h4>
  <h4>y: ${ship.velocity.y} </h4>
  <h4>z: ${ship.velocity.z} </h4>
  <br>
  <h3>Ship Position:</h3>
  <h4>x: ${ship.position.x} </h4>
  <h4>y: ${ship.position.y} </h4>
  <h4>z: ${ship.position.z} </h4>
  <br>
  <h3>Ship Angular Velocity:</h3>
  <h4>x: ${ship.angularVelocity.x} </h4>
  <h4>y: ${ship.angularVelocity.y} </h4>
  <h4>z: ${ship.angularVelocity.z} </h4>
  <br>
  <h3>Ship Angle:</h3>
  <h4>thetaX: ${ship.angles.thetaX} </h4>
  <h4>thetaY: ${ship.angles.thetaY} </h4>
  <h4>thetaZ: ${ship.angles.thetaZ} </h4>
  <br>
  <h3>Forces:</h3>
  <h4>Thrust: ${ship.thrustForce} </h4>
  <br>
  `;
}, 300);