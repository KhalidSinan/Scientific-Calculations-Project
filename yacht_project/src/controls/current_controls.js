export const currentController = {
  Vc: 100,
  Bc: 100,
};

export const addCurrentControlsTo = (gui) => {
  const currentFolder = gui.addFolder("Currents");
  currentFolder.add(currentController, "Vc").min(0).max(100).step(5).name('Current Speed in (Km)');
  currentFolder.add(currentController, "Bc").min(0).max(360).step(1).name('Current Direction in (Deg)');
  currentFolder.close()
};
