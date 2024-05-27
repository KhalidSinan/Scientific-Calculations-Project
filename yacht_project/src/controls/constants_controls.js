

export const constantsController = {
    rho : 0.9,
};

export const addConstantsControlsTo = (gui) => {
const constantsFolder = gui.addFolder("Constants");
constantsFolder.add(constantsController, "rho").min(0).max(1).step(0.01);
constantsFolder.close()
}