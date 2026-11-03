import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScaffoldingFadingIndex,
  calculateAttemptStartingTier,
  calculateCurrentTier,
  isTransferTaskUnlocked,
  isRepeatedError,
} from '../src/services/attempts.js';
import { AttemptRecord } from '../src/types/index.js';

describe('Scaffolding Policy & Fading Index', () => {
  it('fail 3 times, tier rises 1 to 3', () => {
    // Starting tier is 1
    const startingTier = 1;
    assert.equal(calculateCurrentTier(startingTier, 0), 1);
    // After 1st failure, tier goes to 2
    assert.equal(calculateCurrentTier(startingTier, 1), 2);
    // After 2nd failure, tier goes to 3
    assert.equal(calculateCurrentTier(startingTier, 2), 3);
    // Max capped at 4
    assert.equal(calculateCurrentTier(startingTier, 3), 4);
  });

  it('pass: next attempt starts lower (lastTier - 1, min 1)', () => {
    const history1: AttemptRecord[] = [
      {
        id: 'att-1',
        studentId: 's1',
        conceptId: 'cad_dof_2d',
        kind: 'cad_lab',
        passed: true,
        tierUsed: 3,
        hintsRequested: 1,
        durationSec: 45,
        repeatedError: false,
        ts: new Date().toISOString(),
      },
    ];
    // Last tier was 3 -> next attempt starts at 2
    assert.equal(calculateAttemptStartingTier(history1), 2);

    const history2: AttemptRecord[] = [
      ...history1,
      {
        id: 'att-2',
        studentId: 's1',
        conceptId: 'cad_dof_2d',
        kind: 'cad_lab',
        passed: true,
        tierUsed: 2,
        hintsRequested: 0,
        durationSec: 30,
        repeatedError: false,
        ts: new Date().toISOString(),
      },
    ];
    // Last tier was 2 -> next attempt starts at 1
    assert.equal(calculateAttemptStartingTier(history2), 1);

    const history3: AttemptRecord[] = [
      ...history2,
      {
        id: 'att-3',
        studentId: 's1',
        conceptId: 'cad_dof_2d',
        kind: 'cad_lab',
        passed: true,
        tierUsed: 1,
        hintsRequested: 0,
        durationSec: 25,
        repeatedError: false,
        ts: new Date().toISOString(),
      },
    ];
    // Last tier was 1 -> minimum is 1
    assert.equal(calculateAttemptStartingTier(history3), 1);
  });

  it('unlocks independent transfer task after 2 consecutive passes at Tier 1', () => {
    const attempts: AttemptRecord[] = [];
    assert.equal(isTransferTaskUnlocked(attempts), false);

    attempts.push({
      id: 'a1',
      studentId: 's1',
      conceptId: 'c1',
      kind: 'code_lab',
      passed: true,
      tierUsed: 2,
      hintsRequested: 1,
      durationSec: 30,
      repeatedError: false,
      ts: new Date().toISOString(),
    });
    assert.equal(isTransferTaskUnlocked(attempts), false);

    // 1st pass at Tier 1
    attempts.push({
      id: 'a2',
      studentId: 's1',
      conceptId: 'c1',
      kind: 'code_lab',
      passed: true,
      tierUsed: 1,
      hintsRequested: 0,
      durationSec: 20,
      repeatedError: false,
      ts: new Date().toISOString(),
    });
    assert.equal(isTransferTaskUnlocked(attempts), false);

    // 2nd consecutive pass at Tier 1 -> UNLOCKED!
    attempts.push({
      id: 'a3',
      studentId: 's1',
      conceptId: 'c1',
      kind: 'code_lab',
      passed: true,
      tierUsed: 1,
      hintsRequested: 0,
      durationSec: 18,
      repeatedError: false,
      ts: new Date().toISOString(),
    });
    assert.equal(isTransferTaskUnlocked(attempts), true);

    // If next attempt fails, no longer consecutive
    attempts.push({
      id: 'a4',
      studentId: 's1',
      conceptId: 'c1',
      kind: 'code_lab',
      passed: false,
      tierUsed: 1,
      hintsRequested: 0,
      durationSec: 15,
      repeatedError: false,
      ts: new Date().toISOString(),
    });
    assert.equal(isTransferTaskUnlocked(attempts), false);
  });

  it('calculates Scaffolding Fading Index: 1 - (mean(tierUsed over last 5 attempts) - 1) / 3', () => {
    // 5 attempts all at Tier 1 -> 1 - (1 - 1)/3 = 1.0 (fully faded)
    const allTier1: AttemptRecord[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t1_${i}`,
      studentId: 's1',
      conceptId: 'c1',
      kind: 'code_lab',
      passed: true,
      tierUsed: 1,
      hintsRequested: 0,
      durationSec: 20,
      repeatedError: false,
      ts: new Date().toISOString(),
    }));
    assert.equal(calculateScaffoldingFadingIndex(allTier1), 1.0);

    // 5 attempts all at Tier 4 -> 1 - (4 - 1)/3 = 0.0 (fully scaffolded)
    const allTier4: AttemptRecord[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t4_${i}`,
      studentId: 's1',
      conceptId: 'c1',
      kind: 'code_lab',
      passed: false,
      tierUsed: 4,
      hintsRequested: 3,
      durationSec: 50,
      repeatedError: true,
      ts: new Date().toISOString(),
    }));
    assert.equal(calculateScaffoldingFadingIndex(allTier4), 0.0);

    // 5 attempts with tiers [1, 2, 2, 3, 2] -> sum = 10, mean = 2.0 -> 1 - (2 - 1)/3 = 1 - 0.3333 = 0.67
    const mixedTiers: AttemptRecord[] = [1, 2, 2, 3, 2].map((tier, i) => ({
      id: `tm_${i}`,
      studentId: 's1',
      conceptId: 'c1',
      kind: 'code_lab',
      passed: true,
      tierUsed: tier,
      hintsRequested: 0,
      durationSec: 20,
      repeatedError: false,
      ts: new Date().toISOString(),
    }));
    assert.equal(calculateScaffoldingFadingIndex(mixedTiers), 0.67);
  });

  it('detects repeated errors correctly (same category + concept seen before)', () => {
    const history: AttemptRecord[] = [
      {
        id: 'a1',
        studentId: 's1',
        conceptId: 'cad_dof_2d',
        kind: 'cad_lab',
        passed: false,
        tierUsed: 2,
        hintsRequested: 1,
        durationSec: 30,
        errorCategory: 'cad_constraint_error',
        repeatedError: false,
        ts: new Date().toISOString(),
      },
    ];

    // Same concept and same errorCategory -> repeated!
    assert.equal(isRepeatedError(history, 'cad_dof_2d', 'cad_constraint_error'), true);

    // Same concept but different errorCategory -> not repeated
    assert.equal(isRepeatedError(history, 'cad_dof_2d', 'cad_tolerance_mismatch'), false);

    // Different concept -> not repeated
    assert.equal(isRepeatedError(history, 'cad_driving_parameters', 'cad_constraint_error'), false);
  });
});
