import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('CAD Lab Engineering Mathematics & Physics Vectors', () => {
  // Volume formula from spec:
  // Volume (cm3) = L*W*d1/1000 - 2*π*6*6*d1/1000 + π*(30²-15²)*30/1000 + 6.2
  // Fixed L=100, W=60
  function computeVolume(d1: number): number {
    const L = 100;
    const W = 60;
    const rawVolume =
      (L * W * d1) / 1000 -
      (2 * Math.PI * 6 * 6 * d1) / 1000 +
      (Math.PI * (30 * 30 - 15 * 15) * 30) / 1000 +
      6.2;
    return Number(rawVolume.toFixed(1));
  }

  // Mass (g) = volume * density
  function computeMass(volumeCm3: number, densityGcm3: number): number {
    return Number((volumeCm3 * densityGcm3).toFixed(1));
  }

  // FEA closed-form estimate:
  // max stress (MPa) = load_N * 0.237
  // FOS = yield / stress
  function computeFEA(loadInN: number, yieldStrengthMpa: number) {
    const stress = Number((loadInN * 0.237).toFixed(1));
    const fos = Number((yieldStrengthMpa / Math.max(stress, 0.001)).toFixed(2));
    const passed = fos >= 2.0;
    return { stress, fos, passed };
  }

  it('verifies nominal bracket volume reads exactly 139.1 cm³ at d1 = 12 mm', () => {
    const vol = computeVolume(12);
    assert.equal(vol, 139.1);
  });

  it('verifies part mass reads 375.6 g for Al 6061-T6 (density 2.70 g/cm³) at d1 = 12 mm', () => {
    const vol = computeVolume(12);
    const mass = computeMass(vol, 2.70);
    assert.equal(mass, 375.6);
  });

  it('verifies FEA test vector: at 500 N in Al 6061 (yield 276 MPa), stress is 118.5 MPa and FOS is 2.33 (PASS)', () => {
    const { stress, fos, passed } = computeFEA(500, 276);
    assert.equal(stress, 118.5);
    assert.equal(fos, 2.33);
    assert.equal(passed, true);
  });

  it('verifies FEA test vector: at 2500 N in Al 6061 (yield 276 MPa), stress is 592.5 MPa and FOS is 0.47 (FAIL < 2.0)', () => {
    const { stress, fos, passed } = computeFEA(2500, 276);
    assert.equal(stress, 592.5);
    assert.equal(fos, 0.47);
    assert.equal(passed, false);
  });

  it('verifies Degrees of Freedom logic: DOF = (symmetry ? 0 : 1) + (tangent ? 0 : 1)', () => {
    const calcDof = (symmetry: boolean, tangent: boolean) =>
      (symmetry ? 0 : 1) + (tangent ? 0 : 1);

    assert.equal(calcDof(false, false), 2);
    assert.equal(calcDof(true, false), 1);
    assert.equal(calcDof(false, true), 1);
    assert.equal(calcDof(true, true), 0);
  });
});
