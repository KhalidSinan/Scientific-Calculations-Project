
export const engineController = {
  fuelConsumption: 100,
  engineEfficiency: 0.6,
  Vin: 0,
};

export const addEngineControlsTo = (gui) => {
  const engineFolder = gui.addFolder("Engine");
  engineFolder.add(engineController, "Vin")
    .min(0)
    .max(20)
    .step(0.1);
  engineFolder.add(engineController, "engineEfficiency")
    .min(0)
    .max(1)
    .step(0.01);
  engineFolder
    .add(engineController, "fuelConsumption")
    .min(75)
    .max(200)
    .step(10);
  engineFolder.close()
};


// const fuelFolder = gui.add(panelVar, 'selectedFuelType', Object.keys(amountOfEnergyByTypeOfFuel)).name('Fuel Type');
// let tempMax = amountOfEnergyByTypeOfFuel.gasoline[0];
// let tempMin = amountOfEnergyByTypeOfFuel.gasoline[1];

// //const engineController = engineFolder.add(panelVar, 'sourceEnergyOfFuel').min(tempMin).max(tempMax).step(1000);

// fuelFolder.onChange((value) => {
//   const fuelTypeData = amountOfEnergyByTypeOfFuel[value];
//   const min = fuelTypeData[0];
//   const max = fuelTypeData[1];

//   engineController.min(min);
//   engineController.max(max);
// });