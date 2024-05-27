export const shipController = {
  shipMass: 2000,
  shipLength: 100,
  shipWidth: 60,
  shipDepth: 100,
};

export const addShipControlsTo = (gui) => {
  const shipFolder = gui.addFolder("Ship");
  shipFolder.add(shipController, "shipMass").min(1800).max(40000).step(100).name('Ship Mass in (Kg)'); // kilogram
  shipFolder.add(shipController, "shipLength").min(10).max(40).step(1).name('Ship Length in (m)'); // meter
  shipFolder.add(shipController, "shipWidth").min(5).max(7).step(1).name('Ship Width in (m)');
  shipFolder.add(shipController, "shipDepth").min(10).max(20).step(1).name('Ship Depth in (m)');
  shipFolder.close()
};
