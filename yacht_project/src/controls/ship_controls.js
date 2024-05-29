export const shipController = {
  shipMass: 2000,
  shipLength: 11,
  shipWidth: 2.6,
  shipDepth: 0.6,
  nozzleRadius: 0.3 
};

export const addShipControlsTo = (gui) => {
  const shipFolder = gui.addFolder("Ship");
  shipFolder.add(shipController, "shipMass").min(1800).max(4000).step(100).name('Ship Mass in (Kg)'); // kilogram
  shipFolder.add(shipController, "shipLength").min(10).max(40).step(1).name('Ship Length in (m)'); // meter
  shipFolder.add(shipController, "shipWidth").min(5).max(7).step(1).name('Ship Width in (m)');
  shipFolder.add(shipController, "shipDepth").min(10).max(20).step(1).name('Ship Depth in (m)');
  shipFolder.add(shipController, "nozzleRadius").min(2).max(20).step(1).name('Ship Nozzle Radius (m)');
  shipFolder.close()
};
