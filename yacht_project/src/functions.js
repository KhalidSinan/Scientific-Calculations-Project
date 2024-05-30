import { constantsController } from "./controls/constants_controls";

// const { Math.sqrt, Math.cos, Math.sin } = require("three/examples/jsm/nodes/Nodes.js");

// مهملات
const P0 = 1053.52;

// ثوابت
const g = 9.81;
const enginePowerTime = 1;
const Caz = 0.1;
const Cax = 0.1;
const Cay = 0.1;
const Cf = 0.34;
const Cx = 0.1;
const Cy = 0.1;
const Cz = 0.1;
const B = 0;

// قانون برنولي
const bernoly = (rho, pressure, waterVelocity, z) => {
  return pressure + 0.5 * rho * waterVelocity ** 2 + rho * g * z;
};
// قوة الثقل
const shipWeight = (shipMass) => {
  return shipMass * g;
};

const shipLWL = (shipLength) => {
  return shipLength - 0.1 * shipLength;
};
// we may use the water line instead of lenght of the ship.
const wettedSurfaceArea = (shipMass, shipWidth, shipLength, rho) => {
  const weight = shipWeight(shipMass);
  const draft = shipDraft(weight, shipWidth, shipLength, rho);
  return shipLength * (shipWidth + draft);
};

const shipDraft = (weight, width, length, rho) => {
  return (weight / (rho * length * width)) * 3;
};

const wettedSurfaceVolume = (shipMass, shipWidth, shipLength, rho) => {
  const weight = shipWeight(shipMass);
  const draft = shipDraft(weight, shipWidth, shipLength, rho);
  return shipWidth * draft * shipLength;
};
// قوة الطفو
const bouyancyForce = (shipMass, shipWidth, shipLength, rho) => {
  const V = wettedSurfaceVolume(shipMass, shipWidth, shipLength, rho);
  return rho * g * V;
};
// معدل تدفق الكتلة
const massFlowRate = (
  rho,
  A,
  fuelConsumption,
  sourceEnergyOfFuel,
  engineEfficiency
) => {
  return (
    rho *
    volumeFlowRate(rho, A, fuelConsumption, sourceEnergyOfFuel, engineEfficiency)
  );
};
// معدل التدفق الحجمي
const volumeFlowRate = (
  rho,
  A,
  fuelConsumption,
  sourceEnergyOfFuel,
  engineEfficiency
) => {
  const power = enginePower(
    fuelConsumption,
    sourceEnergyOfFuel,
    engineEfficiency
  );
  // console.log((A ** 2 * (((2 * power) / rho) * g)) ** (1 / 3))
  return (A ** 2 * (((2 * power) / rho) * g)) ** (1 / 3);
};
// قوة الدفع
const thrustForce = (
  r,
  fuelConsumption,
  sourceEnergyOfFuel,
  engineEfficiency,
  rho,
  Vin
) => {
  const A = areaOfNozzle(r);
  const power = (fuelConsumption, sourceEnergyOfFuel, engineEfficiency)
  const Vout = (2*power / (g * 3400 * rho)) ** (1/2);
    // const Vout = volumeFlowRate(
    //   rho,
    //   A,
    //   fuelConsumption,
    //   sourceEnergyOfFuel,
    //   engineEfficiency
    // ) / A;
  const M = massFlowRate(
    rho,
    A,
    fuelConsumption,
    sourceEnergyOfFuel,
    engineEfficiency
  );
  return M * Math.abs(Vout - Vin);
};

// مساحة الفوهة
const areaOfNozzle = (r) => {
  return Math.PI * r * r;
};

// قوة المحرك
const enginePower = (fuelConsumption, sourceEnergyOfFuel, engineEfficiency) => {
  return (
    (fuelConsumption * sourceEnergyOfFuel * engineEfficiency) / enginePowerTime
  );
};

// مقاومة الهواء
const airResistanceZ = (
  shipVelocity,
  shipMass,
  shipWidth,
  shipLength,
  rho,
  windAngle,
  windVelocity
) => {
  const Vra = airResistanceRelativeVelocity(
    shipVelocity,
    windAngle,
    windVelocity
  );
  const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
  return -0.5 * rho * S * Vra * Vra * Caz;
};

const airResistanceX = (
  shipVelocity,
  shipMass,
  shipWidth,
  shipLength,
  rho,
  windAngle,
  windVelocity
) => {
  const Vra = airResistanceRelativeVelocity(
    shipVelocity,
    windAngle,
    windVelocity
  );
  const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
  return 0.5 * rho * S * Vra * Vra * Cax;
};

const airResistanceY = (
  shipVelocity,
  shipMass,
  shipWidth,
  shipLength,
  rho,
  windAngle,
  windVelocity
) => {
  const Vra = airResistanceRelativeVelocity(
    shipVelocity,
    windAngle,
    windVelocity
  );
  const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
  return 0.5 * rho * S * Vra * Vra * Cay * shipLength;
};

// سرعة الهواء النسبية للسفينة
const airResistanceRelativeVelocity = (
  shipVelocity,
  windAngle,
  windVelocity
) => {
  const Vrz = windVelocity * Math.cos(windAngle) - shipVelocity;
  const Vrx = windVelocity * Math.sin(windAngle);
  return (Vrz * Vrz + Vrx * Vrx) ** (1 / 2);
};

// مقاومة اللزوجة
const viscousResistance = (
  shipVelocity,
  shipMass,
  shipWidth,
  shipLength,
  rho
) => {
  const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
  return 0.5 * rho * Cf * S * shipVelocity ** 2;
};

// قوة التيار
const currentForceZ = (
  shipVelocityZ,
  shipMass,
  shipWidth,
  shipLength,
  rho,
  currentAngle,
  currentVelocity
) => {
  const Vrv = currentRelativeVelocity(
    shipVelocityZ,
    currentAngle,
    currentVelocity
  );
  const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
  return 0.5 * rho * S * (Vrv ** 2)  * Cz;
};

const currentForceX = (
  shipVelocityX,
  shipMass,
  shipWidth,
  shipLength,
  rho,
  currentAngle,
  currentVelocity
) => {
  const Vrv = currentRelativeVelocity(
    shipVelocityX,
    currentAngle,
    currentVelocity
  );
  const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
  return 0.5 * rho * S * Vrv * Vrv * Cx;
};
const currentForceY = (
  shipVelocityY,
  shipMass,
  shipWidth,
  shipLength,
  rho,
  currentAngle,
  currentVelocity
) => {
  const Vrv = currentRelativeVelocity(
    shipVelocityY,
    currentAngle,
    currentVelocity
  );
  const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
  return 0.5 * rho * S * shipLength * Vrv * Vrv * Cy;
};

// سرعة التيار النسبية للسفينة
const currentRelativeVelocity = (
  shipVelocity,
  currentAngle,
  currentVelocity
) => {
  const Vx = shipVelocity * Math.sin(B);
  const Vz = shipVelocity * Math.cos(B);
  const Vrvz = Vz - currentVelocity * Math.cos(currentAngle);
  const Vrvx = Vx - currentVelocity * Math.sin(currentAngle);
  return Math.sqrt(Vrvz * Vrvz + Vrvx * Vrvx);
};

// دراسة الحركة الخطية على محور السينات
const forcesXAxis = (
  shipVelocityX,
  shipPositionX,
  shipController,
  windAngle,
  windVelocity,
  currentAngle,
  currentVelocity,
  rho,
  time
) => {
  const wghForce = shipWeight(shipController.shipMass);
  // console.log(wghForce)
  const bouyanceForce = bouyancyForce(
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    rho,
    time
  );
  // console.log(bouyanceForce)
  const visRes = viscousResistance(
    shipVelocityX,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    rho
  );
  // console.log(visRes)
  const airResX = airResistanceX(
    shipVelocityX,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    rho,
    windAngle,
    windVelocity
  );
  // console.log(airResX)
  const currForceX = currentForceX(
    shipVelocityX,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    rho,
    currentAngle,
    currentVelocity
  );
  // console.log(currForceX)
  const accelerate =
    ((wghForce + bouyanceForce + visRes + airResX + currForceX) /
    shipController.shipMass) * time;
  // console.log(accelerate)
  const Vx2 = (shipVelocityX + accelerate) * time;
  const X2 = shipPositionX + Vx2;
  return X2;
};

// دراسة الحركة الخطية على محور العينات
const forcesZAxis = (
  shipVelocityZ,
  shipPositionZ,
  windAngle,
  windVelocity,
  currentAngle,
  currentVelocity,
  shipController,
  engineController,
  fuelController,
  rho,
  time
) => {
  const visRes = viscousResistance(
    shipVelocityZ,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    rho
  );
  const airResZ = airResistanceZ(
    shipVelocityZ,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    rho,
    windAngle,
    windVelocity
  );
  const currForceZ = currentForceZ(
    shipVelocityZ,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    rho,
    currentAngle,
    currentVelocity
  );
  const thrForce = thrustForce(
    shipController.nozzleRadius,
    engineController.fuelConsumption,
    fuelController.sourceEnergyOfFuel,
    engineController.engineEfficiency,
    rho,
    shipVelocityZ,
  );
  const accelerate =
    ((-visRes + airResZ + thrForce + currForceZ) /
    shipController.shipMass);
    console.log("thrust force" , thrForce)
    console.log("Viscous res" , -visRes)
    console.log("air res" , airResZ)
    console.log("curr" , currForceZ)
    console.log("accelerate", accelerate)
    console.log("=================")
    const Vz2 = (shipVelocityZ + accelerate*time);
  const Z2 = shipPositionZ + Vz2;
  // console.log(Vz2)
  return { z:Z2, velocityZ: Vz2 };
};

// دراسة الحركة الخطية على محور الصادات
const forcesYAxis = (shipVelocityY, shipPositionY, shipMass, shipWidth,shipLength, rho, time) => {
  const wghForce = shipWeight(shipMass);
  const bouyanceForce = bouyancyForce(shipDraft(shipMass, shipWidth, shipLength, rho),shipWidth,shipLength, rho );
  const visRes = viscousResistance(shipVelocityY,shipMass, shipWidth, shipLength, rho);
  const accelerate = ((wghForce + bouyanceForce + visRes) / shipMass) * time;
  const Vy2 = (shipVelocityY + accelerate) * time;
  const Y2 = shipPositionY + Vy2;
  return Y2;
};

// العزم
const tao = (F, d) => {
  return F * d;
};

// عزم العطالة
const inertiaX = (shipMass, shipLength, shipDepth) => {
  return (
    (1 / 12) * shipMass * (shipLength * shipLength + shipDepth * shipDepth)
  );
};

const inertiaY = (shipMass, shipLength, shipWidth) => {
  return (
    (1 / 12) * shipMass * (shipWidth * shipWidth + shipLength * shipLength)
  );
};
const inertiaZ = (shipMass, shipWidth, shipDepth) => {
  return (1 / 12) * shipMass * (shipWidth * shipWidth + shipDepth * shipDepth);
};

// دراسة الحركة الدورانية على محور السينات
const taoXAxis = (
  thetaX1,
  shipAngularVelocityX1,
  shipMass,
  shipLength,
  shipDepth,
  shipWidth,
  windAngle,
  windVelocity,
  currentAngle,
  currentVelocity
) => {
  const wghForce = tao(shipWeight(shipMass), 0);
  const bouyanceForce = tao(bouyancyForce(), 0);
  const visRes = tao(viscousResistance(shipAngularVelocityX1), shipWidth / 2);
  const airResX = tao(airResistanceX(windAngle, windVelocity), shipWidth / 2);
  const currForceX = tao(
    currentForceX(currentAngle, currentVelocity),
    shipWidth / 2
  );
  const IdeltaX = inertiaX(shipMass, shipLength, shipDepth);
  const angularAccelerationX =
    (wghForce + bouyanceForce + visRes + airResX + currForceX) / IdeltaX;
  const shipAngularVelocityX2 = shipAngularVelocityX1 + angularAccelerationX;
  const thetaX2 = thetaX1 + shipAngularVelocityX2;
  return thetaX2;
};

// دراسة الحركة الدورانية على محور الصادات
const taoYAxis = (
  thetaY1,
  shipAngularVelocityY1,
  shipMass,
  shipLength,
  shipWidth,
  windAngle,
  windVelocity,
  currentAngle,
  currentVelocity
) => {
  const wghForce = tao(shipWeight(shipMass), 0);
  const bouyanceForce = tao(bouyancyForce(), 0);
  const visRes = tao(viscousResistance(shipAngularVelocityY1), shipWidth / 2);
  const airResY = tao(airResistanceY(windAngle, windVelocity), shipWidth / 2);
  const currForceY = tao(
    currentForceY(currentAngle, currentVelocity),
    shipWidth / 2
  );
  const IdeltaY = inertiaY(shipMass, shipLength, shipWidth);
  const angularAccelerationY =
    (wghForce + bouyanceForce + visRes + airResY + currForceY) / IdeltaY;
  const shipAngularVelocityY2 = shipAngularVelocityY1 + angularAccelerationY;
  const thetaY2 = thetaY1 + shipAngularVelocityY2;
  return thetaY2;
};

// دراسة الحركة الدورانية على محور العينات
const taoZAxis = (
  thetaZ1,
  shipAngularVelocityZ1,
  shipMass,
  shipDepth,
  shipWidth,
  windAngle,
  windVelocity,
  currentAngle,
  currentVelocity
) => {
  const wghForce = tao(shipWeight(shipMass), 0);
  const bouyanceForce = tao(bouyancyForce(), 0);
  const visRes = tao(viscousResistance(shipAngularVelocityZ1), shipWidth / 2);
  const airResZ = tao(airResistanceZ(windAngle, windVelocity), shipWidth / 2);
  const currForceZ = tao(
    currentForceZ(currentAngle, currentVelocity),
    shipWidth / 2
  );
  const IdeltaZ = inertiaZ(shipMass, shipWidth, shipDepth);
  const angularAccelerationZ =
    (wghForce + bouyanceForce + visRes + airResZ + currForceZ) / IdeltaZ;
  const shipAngularVelocityZ2 = shipAngularVelocityZ1 + angularAccelerationZ;
  const thetaZ2 = thetaZ1 + shipAngularVelocityZ2;
  return thetaZ2;
};

// دراسة الحركة الخطية
const forces = (
  shipVelocity,
  shipPosition,
  shipController,
  windController,
  currentController,
  engineController,
  fuelController,
  constantsController,
  time
) => {
  const x = forcesXAxis(
    shipVelocity.x,
    shipPosition.x,
    shipController,
    windController.angle,
    windController.velocity,
    currentController.angle,
    currentController.velocity,
    constantsController.rho,
    time
  );
  const y = forcesYAxis(
    shipVelocity.y,
    shipPosition.y,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    constantsController.rho,
    time
  );
  const { z, velocityZ } = forcesZAxis(
    shipVelocity.z,
    shipPosition.z,
    windController.angle,
    windController.velocity,
    currentController.angle,
    currentController.velocity,
    shipController,
    engineController,
    fuelController,
    constantsController.rho,
    time,
  );
  // console.log(z, velocityZ)
  return { z, velocityZ  };
};

// دراسة الحركة الدورانية
const rotations = (
  shipAngle,
  shipAngularVelocity,
  shipMass,
  shipLength,
  shipDepth,
  shipWidth,
  windAngle,
  windVelocity,
  currentAngle,
  currentVelocity
) => {
  const ThetaX = taoXAxis(
    shipAngle.thetaX,
    shipAngularVelocity.x,
    shipMass,
    shipLength,
    shipDepth,
    shipWidth,
    windAngle,
    windVelocity,
    currentAngle,
    currentVelocity
  );
  const ThetaY = taoYAxis(
    shipAngle.thetaY,
    shipAngularVelocity.y,
    shipMass,
    shipLength,
    shipDepth,
    shipWidth,
    windAngle,
    windVelocity,
    currentAngle,
    currentVelocity
  );
  const ThetaZ = taoZAxis(
    shipAngle.thetaZ,
    shipAngularVelocity.z,
    shipMass,
    shipLength,
    shipDepth,
    shipWidth,
    windAngle,
    windVelocity,
    currentAngle,
    currentVelocity
  );
  return { ThetaX, ThetaY, ThetaZ };
};

export { forces, rotations };
