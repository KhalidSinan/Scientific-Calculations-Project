// ثوابت
const g = 9.81;
const enginePowerTime = 1;
const Cf = 0.027;

// قوة الثقل
const shipWeight = (shipMass) => {
  return shipMass * g;
};

// we may use the water line instead of lenght of the ship.
const wettedSurfaceArea = (shipMass, shipWidth, shipLength, rho) => {
  const draft = shipDraft(shipMass, shipWidth, shipLength, rho);
  return shipLength * (draft + shipWidth);
};

const shipDraft = (mass, width, length, rho) => {
  // الجزء المغمور
  const submerged = (mass / rho)
  const draft = submerged / (length * width);
  return draft;
};

const wettedSurfaceVolume = (
  shipMass,
  shipWidth,
  shipLength,
  maxDraft,
  rho
) => {
  // Calculate draft then compare with max draft in ship
  let draft = shipDraft(shipMass, shipWidth, shipLength, rho);
  draft = Math.min(maxDraft, draft);
  return shipWidth * draft * shipLength;
};

// قوة الطفو
const bouyancyForce = (
  shipMass,
  shipWidth,
  shipLength,
  maxDraft,
  shipDepth,
  rho
) => {
  // Calculate max draft in ship
  const maxDraftToSend = maxDraft * shipDepth;
  const volume = wettedSurfaceVolume(
    shipMass,
    shipWidth,
    shipLength,
    maxDraftToSend,
    rho
  );
  return rho * volume * g;
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
  return (A ** 2 * (((2 * power) / rho) * g)) ** (1 / 3);
};
``;
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
  let Vout =
    volumeFlowRate(
      rho,
      A,
      fuelConsumption,
      sourceEnergyOfFuel,
      engineEfficiency
    ) / A;
  const M = A * Vin * rho;
  return Math.max(0, M * (Vout - Vin));
};

// مساحة الفوهة
const areaOfNozzle = (r) => {
  return Math.PI * r * r;
};

// قوة المحرك
const enginePower = (fuelConsumption, sourceEnergyOfFuel, engineEfficiency) => {
  // * 3600 to convert hours to seconds
  return (
    (fuelConsumption * sourceEnergyOfFuel * engineEfficiency) /
    (enginePowerTime * 3600)
  );
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

// convert degree to radian to use in sin and cos
function degToRad(degree) {
  return degree * (Math.PI / 180);
}

// (* 1000 / 3600) to convert from km/h to m/s
function windZ(windAngle, windVelocity) {
  windAngle = degToRad(windAngle);
  return (Math.cos(windAngle) * windVelocity * 1000) / 3600;
}

function currentZ(currentAngle, currentVelocity) {
  currentAngle = degToRad(currentAngle);
  return (Math.cos(currentAngle) * currentVelocity * 1000) / 3600;
}

function windX(windAngle, windVelocity) {
  windAngle = degToRad(windAngle);
  const sinAngle = Math.sin(windAngle);
  return (sinAngle * windVelocity * 1000) / 3600;
}

function currentX(currentAngle, currentVelocity) {
  currentAngle = degToRad(currentAngle);
  const sinAngle = Math.sin(currentAngle);
  return (sinAngle * currentVelocity * 1000) / 3600;
}

// دراسة الحركة الخطية على محور السينات
const forcesXAxis = (
  shipVelocityX,
  shipController,
  windAngle,
  windVelocity,
  currentAngle,
  currentVelocity,
  rho
) => {
  let visRes = viscousResistance(
    shipVelocityX,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    rho
  );
  const windXAxis = windX(windAngle, windVelocity);
  const currentXAxis = currentX(currentAngle, currentVelocity);
  // To Make VisRes against movement
  // Resistance is agains movement always
  const visResSign = shipVelocityX > 0 ? -1 : 1;
  visRes = visResSign * visRes;

  const accelerateX =
    (visRes + windXAxis + currentXAxis) / shipController.shipMass;

  return {
    accelerateX: accelerateX,
    airResX: windXAxis,
    currForceX: currentXAxis,
    visResX: visRes,
  };
};

// دراسة الحركة الخطية على محور العينات
const forcesZAxis = (
  shipVelocityZ,
  windAngle,
  windVelocity,
  currentAngle,
  currentVelocity,
  shipController,
  engineController,
  fuelController,
  constantsController
) => {
  let visRes = viscousResistance(
    Math.abs(shipVelocityZ),
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    constantsController.waterDensity
  );
  const thrForce = thrustForce(
    shipController.nozzleRadius,
    engineController.fuelConsumption,
    fuelController.sourceEnergyOfFuel,
    engineController.engineEfficiency,
    constantsController.waterDensity,
    engineController.Vin
  );
  const windZAxis = windZ(windAngle, windVelocity);
  const currentZAxis = currentZ(currentAngle, currentVelocity);
  // To Make VisRes against movement
  // Resistance is agains movement always
  const visResSign = shipVelocityZ > 0 ? -1 : 1;
  visRes = visResSign * visRes;

  const accelerateZ =
    (thrForce + windZAxis + currentZAxis + visRes) / shipController.shipMass;
  return {
    accelerateZ: accelerateZ,
    thrust: thrForce,
    visResZ: visRes,
    airResZ: windZAxis,
    currForceZ: currentZAxis,
  };
};

// دراسة الحركة الخطية على محور الصادات
const forcesYAxis = (
  shipVelocityY,
  shipMass,
  shipWidth,
  shipLength,
  maxDraft,
  shipDepth,
  rho
) => {
  const wghForce = shipWeight(shipMass);
  const bouyanceForce = bouyancyForce(
    shipMass,
    shipWidth,
    shipLength,
    maxDraft,
    shipDepth,
    rho
  );
  let visRes = viscousResistance(
    shipVelocityY,
    shipMass,
    shipWidth,
    shipLength,
    rho
  );

  // To Make VisRes against movement
  // Resistance is agains movement always
  const visResSign = shipVelocityY > 0 ? -1 : 1;
  visRes = visResSign * visRes

  // Maybe dont need to add visRes
  let accelerate = (-wghForce + bouyanceForce + visRes) / shipMass;
  return {
    accelerateY: accelerate,
    wghForce: wghForce,
    bouyanceForce: bouyanceForce,
    visResY: visRes,
  };
};

// العزم
const tao = (F, d, angle = 90) => {
  angle = degToRad(angle);
  return F * d * Math.sin(angle);
};

const inertiaY = (shipController) => {
  const { shipMass, shipWidth, shipLength } = shipController;
  return (
    (1 / 12) * shipMass * (shipWidth * shipWidth + shipLength * shipLength)
  );
};

const calculateTorqueOfViscousResistance = (rho, angularVelocity, shipLength, shipWidth, shipMass) => {
  return 1 / 8 * rho * wettedSurfaceArea(shipMass, shipWidth, shipLength, rho) * angularVelocity ** 2 * Cf * Math.pow(shipLength, 4)
}

// دراسة الحركة الدورانية على محور السينات
// const taoXAxis = (
//   thetaX1,
//   shipAngularVelocityX1,
//   shipController,
//   windController,
//   currentController
// ) => {
//   const wghForce = tao(shipWeight(shipController.shipMass), 0);
//   const bouyanceForce = tao(bouyancyForce(), 0);
//   const visRes = tao(
//     viscousResistance(shipAngularVelocityX1),
//     shipController.shipWidth / 2
//   );
//   const airResX = tao(
//     airResistanceX(windController.angle, windController.velocity),
//     shipController.shipWidth / 2
//   );
//   const currForceX = tao(
//     currentForceX(currentController.angle, currentController.velocity),
//     shipController.shipWidth / 2
//   );
//   const IdeltaX = inertiaX(
//     shipController.shipMass,
//     shipController.shipLength,
//     shipController.shipDepth
//   );
//   const angularAccelerationX =
//     (wghForce + bouyanceForce + visRes + airResX + currForceX) / IdeltaX;
//   const shipAngularVelocityX2 = shipAngularVelocityX1 + angularAccelerationX;
//   const thetaX2 = thetaX1 + shipAngularVelocityX2;
//   return thetaX2;
// };

// دراسة الحركة الدورانية على محور الصادات
const taoYAxis = (thetaY1, shipAngularVelocityY1, shipController, windController, currentController, engineController, fuelController, rho) => {
  const wghForce = tao(shipWeight(shipController.shipMass), 0);
  const thrForce = tao(
    thrustForce(
      shipController.nozzleRadius,
      engineController.fuelConsumption,
      fuelController.sourceEnergyOfFuel,
      engineController.engineEfficiency,
      rho,
      engineController.Vin
    ),
    shipController.shipLength / 2,
    thetaY1,
  );
  const bouyanceForce = tao(
    bouyancyForce(
      shipController.shipMass,
      shipController.shipWidth,
      shipController.shipLength,
      shipController.maxDraft,
      shipController.shipDepth,
      rho
    ),
    0
  );
  let visResTorque = calculateTorqueOfViscousResistance(rho, shipAngularVelocityY1, shipController.shipLength, shipController.shipWidth, shipController.shipMass)
  const airResY = tao(
    windZ(windController.angle, windController.velocity),
    shipController.shipWidth / 2,
    windController.angle
  );
  const currForceY = tao(
    currentZ(currentController.angle, currentController.velocity),
    shipController.shipWidth / 2,
    currentController.angle
  );
  const visResSign = shipAngularVelocityY1 > 0 ? -1 : 1;
  visResTorque = visResSign * visResTorque;
  console.log(visResTorque)
  const IdeltaY = inertiaY(shipController);
  const angularAccelerationY =
    (wghForce + bouyanceForce + visResTorque + airResY + currForceY + thrForce) / IdeltaY;
  return {
    angularAccelerationY,
    thrForceY: thrForce,
    visResTaoY: visResTorque,
    airResY,
    currForceY,
  };
};

// دراسة الحركة الدورانية على محور العينات
// const taoZAxis = (
//   thetaZ1,
//   shipAngularVelocityZ1,
//   shipMass,
//   shipDepth,
//   shipWidth,
//   windAngle,
//   windVelocity,
//   currentAngle,
//   currentVelocity
// ) => {
//   const wghForce = tao(shipWeight(shipMass), 0);
//   const bouyanceForce = tao(bouyancyForce(), 0);
//   const visRes = tao(viscousResistance(shipAngularVelocityZ1), shipWidth / 2);
//   const airResZ = tao(airResistanceZ(windAngle, windVelocity), shipWidth / 2);
//   const currForceZ = tao(
//     currentForceZ(currentAngle, currentVelocity),
//     shipWidth / 2
//   );
//   const IdeltaZ = inertiaZ(shipMass, shipWidth, shipDepth);
//   const angularAccelerationZ =
//     (wghForce + bouyanceForce + visRes + airResZ + currForceZ) / IdeltaZ;
//   const shipAngularVelocityZ2 = shipAngularVelocityZ1 + angularAccelerationZ;
//   const thetaZ2 = thetaZ1 + shipAngularVelocityZ2;
//   return thetaZ2;
// };

// دراسة الحركة الخطية
const forces = (
  shipVelocity,
  shipController,
  windController,
  currentController,
  engineController,
  fuelController,
  constantsController
) => {
  const { accelerateX, airResX, currForceX, visResX } = forcesXAxis(
    shipVelocity.x,
    shipController,
    windController.angle,
    windController.velocity,
    currentController.angle,
    currentController.velocity,
    constantsController.waterDensity
  );
  const { accelerateY, wghForce, bouyanceForce, visResY } = forcesYAxis(
    shipVelocity.y,
    shipController.shipMass,
    shipController.shipWidth,
    shipController.shipLength,
    shipController.maxDraft,
    shipController.shipDepth,
    constantsController.waterDensity
  );
  const { accelerateZ, thrust, visResZ, airResZ, currForceZ } = forcesZAxis(
    shipVelocity.z,
    windController.angle,
    windController.velocity,
    currentController.angle,
    currentController.velocity,
    shipController,
    engineController,
    fuelController,
    constantsController
  );
  return {
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
  };
};

// دراسة الحركة الدورانية
const rotations = (
  ship,
  shipController,
  windController,
  currentController,
  engineController,
  fuelController,
  rho
) => {
  // const ThetaX = taoXAxis(
  //   ship.angles.thetaX,
  //   ship.angularVelocity.x,
  //   shipController,
  //   windController,
  //   currentController
  // );
  const {
    angularAccelerationY,
    visResTaoY,
    thrForceY,
    airResY,
    currForceY,
  } = taoYAxis(
    shipController.angleY,
    ship.angularVelocity.y,
    shipController,
    windController,
    currentController,
    engineController,
    fuelController,
    rho
  );
  // const ThetaZ = taoZAxis(
  //   ship.angles.thetaZ,
  //   ship.angularVelocity.z,
  //   shipController,
  //   windController,
  //   currentController
  // );
  return {
    angularAccelerationY,
    visResTaoY,
    thrForceY,
    airResY,
    currForceY,
  };
};
export { forces, rotations };
