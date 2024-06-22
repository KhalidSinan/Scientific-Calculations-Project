export const currentController = {
  velocity: 0,
  angle: 0,
};

export const addCurrentControlsTo = (gui) => {
  const currentFolder = gui.addFolder("Currents");
  currentFolder.add(currentController, "velocity").min(0).max(100000).step(5).name('Current Speed in (Km)');
  currentFolder.add(currentController, "angle").min(0).max(360).step(1).name('Current Direction in (Deg)');
  currentFolder.close()
};
