const amountOfEnergyByTypeOfFuel = {
  gasoline: [44000000, 46000000],
  gas: [45000000, 55000000],
  diesel: [35000000, 40000000],
  propane: [46000000, 50000000],
  coal: [24000000, 35000000],
};

export const fuelController = {
  sourceEnergyOfFuel: 45000000,
  selectedFuelType: "gasoline",
};

export const addFuelControlsTo = (gui) => {
  const fuelFolder = gui.addFolder("Fuel");
  fuelFolder.close()
  let tempMax = amountOfEnergyByTypeOfFuel.gasoline[0];
  let tempMin = amountOfEnergyByTypeOfFuel.gasoline[1];
  fuelFolder
    .add(
      fuelController,
      "selectedFuelType",
      Object.keys(amountOfEnergyByTypeOfFuel)
    )
    .onChange((value) => {
      const fuelTypeData = amountOfEnergyByTypeOfFuel[value];
      const min = fuelTypeData[0];
      const max = fuelTypeData[1];
      engineController.min(min);
      engineController.max(max);
    })
    .name("Fuel Type");
  const engineController = fuelFolder
    .add(fuelController, "sourceEnergyOfFuel")
    .min(tempMin)
    .max(tempMax)
    .step(1000)
    .name('Source Energy of Fuel');
};

