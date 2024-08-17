// سرعة خروج الماء من المحرك
// const exitFromEngineVelocity = (rho) => {
//   const P = exitFromEnginePressure(
//     fuelConsumption,
//     sourceEnergyOfFuel,
//     engineEfficiency
//   );
//   return sqrt((2 * (P - P0)) / rho);
// };


//ضغط الماء الخارج من المحرك
// const exitFromEnginePressure = (
//   fuelConsumption,
//   sourceEnergyOfFuel,
//   engineEfficiency
// ) => {
//   const Power = enginePower(
//     fuelConsumption,
//     sourceEnergyOfFuel,
//     engineEfficiency
//   );
//   return Power / (Q * g);
// };


// معدل تدفق الكتلة
// const massFlowRate = (
//     rho,
//     A,
//     fuelConsumption,
//     sourceEnergyOfFuel,
//     engineEfficiency
//   ) => {
//     const rhoInPoundft3 = kgm3Topoundft3(rho);
//     return (
//       rhoInPoundft3 *
//       volumeFlowRate(
//         rho,
//         A,
//         fuelConsumption,
//         sourceEnergyOfFuel,
//         engineEfficiency
//       )
//     );
//   };

// قانون برنولي
// const bernoly = (rho, pressure, waterVelocity, z) => {
//     const rhoInPoundft3 = kgm3Topoundft3(rho);
//     return (
//       pressure +
//       0.5 * rhoInPoundft3 * msTofts(waterVelocity) ** 2 +
//       rhoInPoundft3 * g * z
//     );
//   };

// const msTofts = (number) => {
//     return number * 3.2808399;
//   };

// const kgTopound = (number) => {
//     return number / 0.45359237;
//   };

// مهملات
// const P0 = 1053.52;

// const shipLWL = (shipLength) => {
//     const lengthInFt = mToft(shipLength);
//     return lengthInFt - 0.1 * lengthInFt;
//   };

// مقاومة الهواء
// const airResistanceZ = (
//     shipVelocity,
//     shipMass,
//     shipWidth,
//     shipLength,
//     rho,
//     windAngle,
//     windVelocity
//   ) => {
//     const Vra = airResistanceRelativeVelocity(
//       shipVelocity,
//       windAngle,
//       windVelocity
//     );
//     const rhoInPoundft3 = kgm3Topoundft3(rho);
//     const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
//     // const S = (2 * (shipLength * shipWidth * 4)) - wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
//     return -0.5 * 1.225 * S * Vra * Vra * Caz;
//   };

//   const airResistanceX = (
//     shipVelocity,
//     shipMass,
//     shipWidth,
//     shipLength,
//     rho,
//     windAngle,
//     windVelocity
//   ) => {
//     const Vra = airResistanceRelativeVelocity(
//       shipVelocity,
//       windAngle,
//       windVelocity
//     );
//     const rhoInPoundft3 = kgm3Topoundft3(rho);
//     const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
//     return 0.5 * rhoInPoundft3 * S * Vra * Vra * Cax;
//   };

//   const airResistanceY = (
//     shipVelocity,
//     shipMass,
//     shipWidth,
//     shipLength,
//     rho,
//     windAngle,
//     windVelocity
//   ) => {
//     const Vra = airResistanceRelativeVelocity(
//       shipVelocity,
//       windAngle,
//       windVelocity
//     );
//     const rhoInPoundft3 = kgm3Topoundft3(rho);
//     const lengthInFt = mToft(shipLength);
//     const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
//     return 0.5 * rhoInPoundft3 * S * Vra * Vra * Cay * lengthInFt;
//   };

//   // سرعة الهواء النسبية للسفينة
//   const airResistanceRelativeVelocity = (
//     shipVelocity,
//     windAngle,
//     windVelocity
//   ) => {
//     const Vrz = windVelocity * Math.cos(windAngle) - shipVelocity;
//     const Vrx = windVelocity * Math.sin(windAngle);
//     return (Vrz * Vrz + Vrx * Vrx) ** (1 / 2);
//   };

// قوة التيار
// const currentForceZ = (
//     shipVelocityZ,
//     shipMass,
//     shipWidth,
//     shipLength,
//     rho,
//     currentAngle,
//     currentVelocity
//   ) => {
//     const relativeVelocity = currentRelativeVelocity(
//       shipVelocityZ,
//       currentAngle,
//       currentVelocity
//     );
//     const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
//     return 0.5 * rho * S * relativeVelocity ** 2 * Cz;
//   };

//   const currentForceX = (
//     shipVelocityX,
//     shipMass,
//     shipWidth,
//     shipLength,
//     rho,
//     currentAngle,
//     currentVelocity
//   ) => {
//     const Vrv = currentRelativeVelocity(
//       shipVelocityX,
//       currentAngle,
//       currentVelocity
//     );
//     const rhoInPoundft3 = kgm3Topoundft3(rho);
//     const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
//     return 0.5 * rhoInPoundft3 * S * Vrv * Vrv * Cx;
//   };
//   const currentForceY = (
//     shipVelocityY,
//     shipMass,
//     shipWidth,
//     shipLength,
//     rho,
//     currentAngle,
//     currentVelocity
//   ) => {
//     const Vrv = currentRelativeVelocity(
//       shipVelocityY,
//       currentAngle,
//       currentVelocity
//     );
//     const rhoInPoundft3 = kgm3Topoundft3(rho);
//     const lengthInFt = mToft(shipLength);
//     const S = wettedSurfaceArea(shipMass, shipWidth, shipLength, rho);
//     return 0.5 * rhoInPoundft3 * S * lengthInFt * Vrv * Vrv * Cy;
//   };

//   // سرعة التيار النسبية للسفينة
//   const currentRelativeVelocity = (
//     shipVelocity,
//     currentAngle,
//     currentVelocity
//   ) => {
//     const Vx = shipVelocity * Math.sin(B);
//     const Vz = shipVelocity * Math.cos(B);
//     const Vrvz = Vz - currentVelocity * Math.cos(currentAngle);
//     const Vrvx = Vx - currentVelocity * Math.sin(currentAngle);
//     return Math.sqrt(Vrvz * Vrvz + Vrvx * Vrvx);
//   };

// const Caz = 0.1;
// const Cax = 0.1;
// const Cay = 0.1;
// const Cx = 0.1;
// const Cy = 0.1;
// const Cz = 0.1;
// const B = 0;


// عزم العطالة
// const inertiaX = (shipMass, shipLength, shipDepth) => {
//     return (
//         (1 / 12) * shipMass * (shipLength * shipLength + shipDepth * shipDepth)
//     );
// }

// const inertiaZ = (shipMass, shipWidth, shipDepth) => {
//     return (1 / 12) * shipMass * (shipWidth * shipWidth + shipDepth * shipDepth);
// };