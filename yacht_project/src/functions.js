const { sqrt, cos } = require("three/examples/jsm/nodes/Nodes.js");

// ثوابت
const g = 9.81;
const r = 10;
const P0 = 20;
const Q = 3400;
const enginePowerTime = 1;
const shipInWaterVolume = 10; 

// معاملات
const Caz = 5;
const Cax = 5;
const Cay = 5;
const Cf = 10;
const Cx = 10;
const Cy = 10;
const Cz = 10;
const B = 70;

// مساحات
const S = 10;
const Sx = 10;
const Sy = 10;
const Sz = 10;

// متغيرات


// قانون برنولي
const bernoly = (P,v,z) => {
    return P + 0.5 * rho * v * v + rho * g * z; 
}
// قوة الثقل
const weightForce = () => {
  return shipMass * g;
};
// قوة الطفو
const bouyancyForce = () => {
  return rho * g * shipInWaterVolume;
};
// معدل تدفق الكتلة
const massFlowRate = (rho, A, v) => {
  return rho * A * v;
};
// قوة الدفع
const thrustForce = (Vin) => {
  const A = areaOfNozzle(r);
  const Vout = exitFromEngineVelocity();
  const M = massFlowRate(rho, A, Vout);
  return M * (Vout - Vin);
};

// مساحة الفوهة
const areaOfNozzle = () => {
  return Math.PI * r * r;
};
// سرعة خروج الماء من المحرك
const exitFromEngineVelocity = () => {
    const P = exitFromEnginePressure();
    return sqrt((2 * (P - P0)) / rho);
};

//ضغط الماء الخارج من المحرك
const exitFromEnginePressure = () => {
  const Power = enginePower(
    fuelConsumption,
    sourceEnergyOfFuel,
    engineEfficiency
  );
  return Power / (Q * g);
};

// قوة المحرك
const enginePower = (FC, SE, E) => {
  return (FC * SE * E) / enginePowerTime;
};

// مقاومة الهواء
const airResistanceZ = (Ba, Va) => {
  const Vra = airResistanceRelativeVelocity(v, Ba, Va);
  return -0.5 * rho * Sz * Vra * Vra * Caz;
};

const airResistanceX = (Ba, Va) => {
  const Vra = airResistanceRelativeVelocity(v, Ba, Va);
  return 0.5 * rho * Sx * Vra * Vra * Cax;
};

const airResistanceY = (Ba, Va) => {
  const Vra = airResistanceRelativeVelocity(v, Ba, Va);
  return 0.5 * rho * Sy * Vra * Vra * Cay * shipLength;
};

// سرعة الهواء النسبية للسفينة
const airResistanceRelativeVelocity = (v, Ba, Va) => {
  const Vrz = Va * cos(Ba) - v;
  const Vrx = Va * sin(Ba);
  return sqrt(Vrz * Vrz + Vrx * Vrx);
};


// مقاومة اللزوجة
const viscousResistance = (v) => {
  return 0.5 * rho * Cf * S * v * v;
};

// قوة التيار
const currentForceZ = (Bc, Vc) => {
  const Vrv = currentRelativeVelocity(Bc, Vc);
  return 0.5 * rho * S * Vrv * Vrv * Cz;
};

const currentForceX = (Bc, Vc) => {
  const Vrv = currentRelativeVelocity(Bc, Vc);
  return 0.5 * rho * S * Vrv * Vrv * Cx;
};
const currentForceY = (Bc, Vc) => {
  const Vrv = currentRelativeVelocity(Bc, Vc);
  return 0.5 * rho * S * shipLength * Vrv * Vrv * Cy;
};

// سرعة التيار النسبية للسفينة
const currentRelativeVelocity = (Bc, Vc) => {
  const Vx = v * sin(B);
  const Vz = v * cos(B);
  const Vrvz = Vz - Vc * cos(Bc);
  const Vrvx = Vx - Vc * sin(Bc);
  return sqrt(Vrvz * Vrvz + Vrvx * Vrvx);
};


// دراسة الحركة الخطية على محور السينات
const forcesXAxis = (Vx1, X1, v, Ba, Va, Bc, Vc) => {
    const wghForce = weightForce();
    const bouyanceForce = bouyancyForce();
    const visRes = viscousResistance(v);
    const airResX = airResistanceX(Ba, Va);
    const currForceX = currentForceX(Bc, Vc);
    const accelerate =
    (wghForce + bouyanceForce + visRes + airResX + currForceX) / shipMass;
    const Vx2 = Vx1 + accelerate;
    const X2 = X1 + Vx2;
    return X2;
};

// دراسة الحركة الخطية على محور العينات
const forcesZAxis = (Vz1, Z1, v, Ba, Va, Bc, Vc, Vin) => {
    const wghForce = weightForce();
    const bouyanceForce = bouyancyForce();
    const visRes = viscousResistance(v);
    const airResZ = airResistanceZ(Ba, Va);
    const currForceZ = currentForceZ(Bc, Vc);
    const thrForce = thrustForce(Vin);
    const accelerate =
    (wghForce + bouyanceForce + visRes + airResZ + thrForce + currForceZ) /
    shipMass;
    const Vz2 = Vz1 + accelerate;
    const Z2 = Z1 + Vz2;
    return Z2;
};

// دراسة الحركة الخطية على محور الصادات
const forcesYAxis = (Vy1, Y1, v) => {
  const wghForce = weightForce();
  const bouyanceForce = bouyancyForce();
  const visRes = viscousResistance(v);
  const accelerate = (wghForce + bouyanceForce + visRes) / shipMass;
  const Vy2 = Vy1 + accelerate;
  const Y2 = Y1 + Vy2;
  return Y2;
};


// العزم
const tao = (F, d) => {
  return F * d;
};

// عزم العطالة
const inertiaX = () => {
  return (
    (1 / 12) * shipMass * (shipLength * shipLength + shipDepth * shipDepth)
  );
};

const inertiaY = () => {
  return (
    (1 / 12) * shipMass * (shipWidth * shipWidth + shipLength * shipLength)
  );
};
const inertiaZ = () => {
  return (1 / 12) * shipMass * (shipWidth * shipWidth + shipDepth * shipDepth);
};

// دراسة الحركة الدورانية على محور السينات
const taoXAxis = (ThetaX1, Wx1, v, Ba, Va, Bc, Vc) => {
    const wghForce = tao(weightForce(), 0);
    const bouyanceForce = tao(bouyancyForce(), 0);
  const visRes = tao(viscousResistance(v), shipWidth / 2);
  const airResX = tao(airResistanceX(Ba, Va), shipWidth / 2);
  const currForceX = tao(currentForceX(Bc, Vc), shipWidth / 2);
  const IdeltaX = inertiaX();
  const angularAccelerationX =
  (wghForce + bouyanceForce + visRes + airResX + currForceX) / IdeltaX;
  const Wx2 = Wx1 + angularAccelerationX;
  const ThetaX2 = ThetaX1 + Wx2;
  return ThetaX2;
};

// دراسة الحركة الدورانية على محور الصادات
const taoYAxis = (ThetaY1, Wy1, v, Ba, Va, Bc, Vc) => {
    const wghForce = tao(weightForce(), 0);
    const bouyanceForce = tao(bouyancyForce(), 0);
    const visRes = tao(viscousResistance(v), shipWidth / 2);
    const airResY = tao(airResistanceY(Ba, Va), shipWidth / 2);
    const currForceY = tao(currentForceY(Bc, Vc), shipWidth / 2);
    const IdeltaY = inertiaY();
    const angularAccelerationY =
    (wghForce + bouyanceForce + visRes + airResY + currForceY) / IdeltaY;
    const Wy2 = Wy1 + angularAccelerationY;
    const ThetaY2 = ThetaY1 + Wy2;
    return ThetaY2;
};

// دراسة الحركة الدورانية على محور العينات
const taoZAxis = (ThetaZ1, Wz1, v, Ba, Va, Bc, Vc) => {
  const wghForce = tao(weightForce(), 0);
  const bouyanceForce = tao(bouyancyForce(), 0);
  const visRes = tao(viscousResistance(v), shipWidth / 2);
  const airResZ = tao(airResistanceZ(Ba, Va), shipWidth / 2);
  const currForceZ = tao(currentForceZ(Bc, Vc), shipWidth / 2);
  const IdeltaZ = inertiaZ();
  const angularAccelerationZ =
    (wghForce + bouyanceForce + visRes + airResZ + currForceZ) / IdeltaZ;
  const Wz2 = Wz1 + angularAccelerationZ;
  const ThetaZ2 = ThetaZ1 + Wz2;
  return ThetaZ2;
};

// دراسة الحركة الخطية 
const forces = (v,Vx1,Vy1,Vz1,X1,Y1,Z1,Ba,Va,Bc,Vc,Vin) => {
    const x = forcesXAxis(Vx1, X1, v, Ba, Va, Bc, Vc);
    const y = forcesYAxis(Vy1, Y1, v, Bc, Vc);
    const z = forcesZAxis(Vz1, Z1, v, Ba, Va, Bc, Vc, Vin);
    return {x,y,z};
};

// دراسة الحركة الدورانية
const rotations = (v,Wx1,Wy1,Wz1,ThetaX1,ThetaY1,ThetaZ1,Ba,Va,Bc,Vc) => {
    const ThetaX = taoXAxis(ThetaX1, Wx1, v, Ba, Va, Bc, Vc);
    const ThetaY = taoYAxis(ThetaY1, Wy1, v, Ba, Va, Bc, Vc);
    const ThetaZ = taoZAxis(ThetaZ1, Wz1, v, Ba, Va, Bc, Vc);
    return {ThetaX,ThetaY,ThetaZ};
}

