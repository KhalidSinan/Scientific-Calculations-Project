
export const engineController = {
    fuelConsumption: 53,
    engineEfficiency: 53,
    Vin: 355,
  };

export const addEngineControlsTo = (gui) => {
  const engineFolder = gui.addFolder("Engine");
  engineFolder.add(engineController, "engineEfficiency");
  engineFolder.add(engineController, "Vin");
  engineFolder
    .add(engineController, "fuelConsumption")
    .min(450)
    .max(850)
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