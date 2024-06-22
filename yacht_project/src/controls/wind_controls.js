export const windController = {
  velocity: 0,
  angle: 0,
};

export const addWindControlsTo = (gui) => {
  const windFolder = gui.addFolder("Wind");
  windFolder.add(windController, "velocity").min(0).max(10000).step(5).name('Wind Speed in (Km)');
  windFolder.add(windController, "angle").min(0).max(360).step(1).name('Wind Direction in (Deg)');
  windFolder.close()
};
