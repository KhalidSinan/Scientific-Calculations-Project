const amountOfEnergyByTypeOfFuel = {
  gasoline: [4400000, 4600000],
  gas: [4500000, 5500000],
  diesel: [3500000, 4000000],
  propane: [4600000, 5000000],
  coal: [2400000, 3500000],
};

export const fuelController = {
  sourceEnergyOfFuel: 4500000,
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

