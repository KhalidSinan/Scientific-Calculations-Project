export const shipController = {
  shipMass: 2000,
  shipLength: 11,
  shipWidth: 6,
  shipDepth: 6,
  nozzleRadius: 0.3,
  maxDraft: 0.1,
  angleX: 0,
  angleY: 0,
  angleZ: 0,
};

export const addShipControlsTo = (gui) => {
  const shipFolder = gui.addFolder("Ship");
  shipFolder.add(shipController, "shipMass").min(1800).max(200000).step(100).name('Ship Mass in (Kg)'); // kilogram
  shipFolder.add(shipController, "shipLength").min(10).max(40).step(1).name('Ship Length in (m)'); // meter
  shipFolder.add(shipController, "shipWidth").min(5).max(10).step(1).name('Ship Width in (m)');
  shipFolder.add(shipController, "shipDepth").min(5).max(20).step(1).name('Ship Depth in (m)');
  shipFolder.add(shipController, "nozzleRadius").min(0.1).max(20).step(0.1).name('Ship Nozzle Radius (m)');
  shipFolder.add(shipController, "maxDraft").min(0).max(1).step(0.01).name('Max Draft That Ship Can Float In (%)');
  shipFolder.add(shipController,"angleX").min(-30).max(30).step(0.01);
  shipFolder.add(shipController,"angleY").min(-30).max(30).step(0.01);
  shipFolder.add(shipController,"angleZ").min(-30).max(30).step(0.01);
  shipFolder.close()
};