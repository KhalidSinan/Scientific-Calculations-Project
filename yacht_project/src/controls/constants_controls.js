export const constantsController = {
    waterDensity: 1029,
    airDensity: 1,
};

export const addConstantsControlsTo = (gui) => {
    const constantsFolder = gui.addFolder("Constants");
    constantsFolder.add(constantsController, "waterDensity").min(0).max(1100).step(0.01);
    constantsFolder.add(constantsController, "airDensity").min(0).max(2).step(0.01);
    constantsFolder.close()
}