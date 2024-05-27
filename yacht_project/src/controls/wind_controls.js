export const windController = {
  Va: 100,
  Ba: 100,
};

export const addWindControlsTo = (gui) => {
  const windFolder = gui.addFolder("Wind");
  windFolder.add(windController, "Va").min(0).max(200).step(5).name('Wind Speed in (Km)');
  windFolder.add(windController, "Ba").min(0).max(360).step(1).name('Wind Direction in (Deg)');
  windFolder.close()
};
