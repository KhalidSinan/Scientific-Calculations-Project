function permute(x) {
    return ((x * 34.0) + 1.0) * x % 289.0;
}

function fade(t) {
    if (isNaN(t * t * t * (t * (t * 6.0 - 15.0) + 10.0))) return 0
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

function taylorInvSqrt(r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

function cnoise(P) {

    let Pi0 = P.map(Math.floor);
    let Pi1 = Pi0.map((x) => x + 1);
    Pi0 = Pi0.map((x) => x % 289.0);
    Pi1 = Pi1.map((x) => x % 289.0);
    let Pf0 = P.map((x) => x - Math.floor(x));
    let Pf1 = Pf0.map((x) => x - 1.0);

    let ix = [Pi0[0], Pi1[0], Pi0[0], Pi1[0]];
    let iy = [Pi0[1], Pi1[1], Pi0[1], Pi1[1]];
    let iz0 = [Pi0[2], Pi0[2], Pi0[2], Pi1[2]];
    let iz1 = [Pi1[2], Pi1[2], Pi1[2], Pi1[2]];

    let ixy = ix.map((x, i) => permute(x) + iy[i]);
    let ixy0 = ixy.map((x, i) => permute(x) + iz0[i]);
    let ixy1 = ixy.map((x, i) => permute(x) + iz1[i]);

    let gx0 = ixy0.map((x) => x / 7.0);
    let gy0 = gx0.map((x) => fade(Math.floor(x) / 7.0) - 0.5);
    gx0 = gx0.map((x) => x % 1);
    let gz0 = gx0.map((x, i) => 0.5 - Math.abs(x) - Math.abs(gy0[i]));
    let sz0 = gz0.map((x) => (x < 0.0) ? 1.0 : 0.0);
    gx0 = gx0.map((x, i) => x - sz0[i] * (Math.sign(x) - 0.5));
    gy0 = gy0.map((y, i) => y - sz0[i] * (Math.sign(y) - 0.5));

    let gx1 = ixy1.map((x) => x / 7.0);
    let gy1 = gx1.map((x) => fade(Math.floor(x) / 7.0) - 0.5);
    gx1 = gx1.map((x) => x % 1);
    let gz1 = gx1.map((x, i) => 0.5 - Math.abs(x) - Math.abs(gy1[i]));
    let sz1 = gz1.map((x) => (x < 0.0) ? 1.0 : 0.0);
    gx1 = gx1.map((x, i) => x - sz1[i] * (Math.sign(x) - 0.5));
    gy1 = gy1.map((y, i) => y - sz1[i] * (Math.sign(y) - 0.5));

    let g000 = [gx0[0], gy0[0], gz0[0]];
    let g100 = [gx0[1], gy0[1], gz0[1]];
    let g010 = [gx0[2], gy0[2], gz0[2]];
    let g110 = [gx0[3], gy0[3], gz0[3]];
    let g001 = [gx1[0], gy1[0], gz1[0]];
    let g101 = [gx1[1], gy1[1], gz1[1]];
    let g011 = [gx1[2], gy1[2], gz1[2]];
    let g111 = [gx1[3], gy1[3], gz1[3]];

    let norm0 = [taylorInvSqrt(g000.reduce((acc, val) => acc + val * val, 0)),
    taylorInvSqrt(g010.reduce((acc, val) => acc + val * val, 0)),
    taylorInvSqrt(g100.reduce((acc, val) => acc + val * val, 0)),
    taylorInvSqrt(g110.reduce((acc, val) => acc + val * val, 0))];

    g000 = g000.map((val, i) => val * norm0[i]);
    g010 = g010.map((val, i) => val * norm0[i]);
    g100 = g100.map((val, i) => val * norm0[i]);
    g110 = g110.map((val, i) => val * norm0[i]);

    let norm1 = [taylorInvSqrt(g001.reduce((acc, val) => acc + val * val, 0)),
    taylorInvSqrt(g011.reduce((acc, val) => acc + val * val, 0)),
    taylorInvSqrt(g101.reduce((acc, val) => acc + val * val, 0)),
    taylorInvSqrt(g111.reduce((acc, val) => acc + val * val, 0))];

    g001 = g001.map((val, i) => val * norm1[i]);
    g011 = g011.map((val, i) => val * norm1[i]);
    g101 = g101.map((val, i) => val * norm1[i]);
    g111 = g111.map((val, i) => val * norm1[i]);

    let n000 = g000[0] * Pf0[0] + g000[1] * Pf0[1] + g000[2] * Pf0[2];
    let n100 = g100[0] * Pf1[0] + g100[1] * Pf0[1] + g100[2] * Pf0[2];
    let n010 = g010[0] * Pf0[0] + g010[1] * Pf1[1] + g010[2] * Pf0[2];
    let n110 = g110[0] * Pf1[0] + g110[1] * Pf1[1] + g110[2] * Pf0[2];
    let n001 = g001[0] * Pf0[0] + g001[1] * Pf0[1] + g001[2] * Pf1[2];
    let n101 = g101[0] * Pf1[0] + g101[1] * Pf0[1] + g101[2] * Pf1[2];
    let n011 = g011[0] * Pf0[0] + g011[1] * Pf1[1] + g011[2] * Pf1[2];
    let n111 = g111[0] * Pf1[0] + g111[1] * Pf1[1] + g111[2] * Pf1[2];

    let fade_xyz = fade(Pf0);
    let n_z = [n000, n100, n010, n110].map((val, i) => val * fade_xyz);
    let n_yz = [(n_z[0] + n_z[1]) * fade_xyz, (n_z[2] + n_z[3]) * fade_xyz];
    let n_xyz = (n_yz[0] + n_yz[1]) * fade_xyz;
    return 2.2 * n_xyz;

}


function calculateOfElevation(uTime, uBigWavesElevation, uBigWavesFrequency, uBigWavesSpeed, uSmallWavesElevation, uSmallWavesFrequency, uSmallWavesSpeed, uSmallIterations, x, z) {
    // Elevation
    var elevation = Math.sin(x * uBigWavesFrequency.value.x + uTime * uBigWavesSpeed.value) *
        Math.sin(z * uBigWavesFrequency.value.y + uTime * uBigWavesSpeed.value) *
        uBigWavesElevation.value;
    for (var i = 1.0; i <= uSmallIterations.value; i++) {
        elevation -= Math.abs(cnoise([x * uSmallWavesFrequency.value * i, z * uSmallWavesFrequency.value * i, uTime * uSmallWavesSpeed.value])) * uSmallWavesElevation.value / i;
    }
    return elevation;
}

module.exports = calculateOfElevation