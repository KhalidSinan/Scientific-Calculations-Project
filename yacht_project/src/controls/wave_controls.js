import { Vector2 } from "three";

export const waveController = {
  uTime: { value: 0 },
  uBigWavesElevation: { value: 0.039 },
  uBigWavesFrequency: { value: new Vector2(1.361, 1.748) },
  uBigWavesSpeed: { value: 0.544 },
  uSmallWavesElevation: { value: 0.074 },
  uSmallWavesFrequency: { value: 3 },
  uSmallWavesSpeed: { value: 0.5 },
  uSmallIterations: { value: 4 },
};

export const addWaveControlsTo = (gui) => {
  const wavesFolder = gui.addFolder("Waves");
  wavesFolder
    .add(waveController.uBigWavesElevation, "value")
    .min(0)
    .max(1)
    .step(0.001)
    .name("uBigWavesElevation");
  wavesFolder
    .add(waveController.uBigWavesFrequency.value, "x")
    .min(0)
    .max(10)
    .step(0.001)
    .name("uBigWavesFrequencyX");
  wavesFolder
    .add(waveController.uBigWavesFrequency.value, "y")
    .min(0)
    .max(10)
    .step(0.001)
    .name("uBigWavesFrequencyY");
  wavesFolder
    .add(waveController.uBigWavesSpeed, "value")
    .min(0)
    .max(4)
    .step(0.001)
    .name("uBigWavesSpeed");

  wavesFolder
    .add(waveController.uSmallWavesElevation, "value")
    .min(0)
    .max(1)
    .step(0.001)
    .name("uSmallWavesElevation");
  wavesFolder
    .add(waveController.uSmallWavesFrequency, "value")
    .min(0)
    .max(30)
    .step(0.001)
    .name("uSmallWavesFrequency");
  wavesFolder
    .add(waveController.uSmallWavesSpeed, "value")
    .min(0)
    .max(4)
    .step(0.001)
    .name("uSmallWavesSpeed");
  wavesFolder
    .add(waveController.uSmallIterations, "value")
    .min(0)
    .max(5)
    .step(1)
    .name("uSmallIterations");
  wavesFolder.close()
};
