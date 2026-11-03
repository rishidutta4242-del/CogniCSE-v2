import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBKTUpdate,
  calculateCompositeMastery,
  getNodeColor,
  getEvidenceLabel,
  applyObservationToNode,
  DEFAULT_BKT_PARAMS,
} from '../src/services/mastery.js';
import { DKMNode } from '../src/types/index.js';

describe('Bayesian Knowledge Tracing (BKT)', () => {
  it('vector 1: pL=0.20 + correct gives 0.6000', () => {
    const result = calculateBKTUpdate(0.20, true, DEFAULT_BKT_PARAMS);
    assert.equal(Number(result.posterior.toFixed(4)), 0.6000);
  });

  it('vector 2: pL=0.20 + incorrect gives 0.1758', () => {
    const result = calculateBKTUpdate(0.20, false, DEFAULT_BKT_PARAMS);
    assert.equal(Number(result.posterior.toFixed(4)), 0.1758);
  });

  it('clamps posterior values strictly between [0.01, 0.99]', () => {
    // Repeated correct answers should approach 0.99 but never exceed 0.99
    let current = 0.95;
    for (let i = 0; i < 10; i++) {
      current = calculateBKTUpdate(current, true).posterior;
    }
    assert(current <= 0.99);

    // Repeated incorrect answers should approach 0.01 but never drop below 0.01
    current = 0.05;
    for (let i = 0; i < 10; i++) {
      current = calculateBKTUpdate(current, false).posterior;
    }
    assert(current >= 0.01);
  });

  it('updates mastery non-linearly: failing then passing moves by formula, not fixed deltas', () => {
    const initial = 0.20;
    // Step 1: Student fails
    const step1 = calculateBKTUpdate(initial, false);
    const delta1 = +(step1.posterior - initial).toFixed(4);
    assert.notEqual(delta1, -0.2); // Not the old hardcoded -0.2
    assert.equal(Number(step1.posterior.toFixed(4)), 0.1758);

    // Step 2: Student subsequently passes
    const step2 = calculateBKTUpdate(step1.posterior, true);
    const delta2 = +(step2.posterior - step1.posterior).toFixed(4);
    assert.notEqual(delta2, 0.25); // Not the old hardcoded +0.25
    assert.notEqual(delta2, 0.05); // Not the old hardcoded +0.05
    assert(step2.posterior > 0.55 && step2.posterior < 0.60);
  });
});

describe('Composite Topic Mastery', () => {
  it('vector 3: composite 80/70/60/50 gives 70 (rounded)', () => {
    const result = calculateCompositeMastery({
      conceptual: 80,
      practical: 70,
      independent: 60,
      retention: 50,
    });
    // 80*0.35 (28) + 70*0.35 (24.5) + 60*0.20 (12) + 50*0.10 (5) = 69.5 -> 70
    assert.equal(result.composite, 70);
    assert.equal(result.retention, 50);
  });

  it('renormalises weights when retention is missing (does NOT default to a made-up number)', () => {
    const result = calculateCompositeMastery({
      conceptual: 80,
      practical: 70,
      independent: 60,
      retention: null,
    });
    // Raw: (80*0.35 + 70*0.35 + 60*0.20) / 0.90 = 64.5 / 0.90 = 71.666 -> 72
    assert.equal(result.retention, null);
    assert.equal(result.composite, 72);
    assert.equal(result.weights.retention, 0);
  });

  it('strictly validates Mastered status against composite, independent score, and transfer task count', () => {
    // High composite but independent < 75 -> cannot be Mastered
    const nearMastery = calculateCompositeMastery({
      conceptual: 95,
      practical: 95,
      independent: 70,
      retention: 90,
      independentPassedCount: 0,
    });
    assert.equal(nearMastery.status, 'Near Mastery');

    // High composite and independent >= 75 and independentPassedCount >= 1 -> Mastered
    const mastered = calculateCompositeMastery({
      conceptual: 90,
      practical: 90,
      independent: 80,
      retention: 85,
      independentPassedCount: 1,
    });
    assert.equal(mastered.status, 'Mastered');
  });
});

describe('Node Colour and Evidence Classification', () => {
  it('assigns GREEN for pL >= 0.80, YELLOW for 0.50 to 0.79, RED for below 0.50', () => {
    assert.equal(getNodeColor(0.85), 'GREEN');
    assert.equal(getNodeColor(0.80), 'GREEN');
    assert.equal(getNodeColor(0.79), 'YELLOW');
    assert.equal(getNodeColor(0.50), 'YELLOW');
    assert.equal(getNodeColor(0.49), 'RED');
    assert.equal(getNodeColor(0.15), 'RED');
  });

  it('classifies evidence label accurately', () => {
    // Less than 2 observations
    assert.equal(getEvidenceLabel([], 0.85), 'Insufficient Evidence');

    // Repeated success
    const repeatedSuccess = [
      { id: '1', conceptId: 'c1', prior: 0.2, observed: true, posterior: 0.6, isCorrect: true, isIndependent: true, source: 'quiz', timestamp: '' },
      { id: '2', conceptId: 'c1', prior: 0.6, observed: true, posterior: 0.82, isCorrect: true, isIndependent: true, source: 'sandbox', timestamp: '' },
    ];
    assert.equal(getEvidenceLabel(repeatedSuccess, 0.82), 'Confirmed through Repeated Evidence');

    // Repeated errors with pL < 0.50
    const repeatedErrors = [
      { id: '1', conceptId: 'c1', prior: 0.2, observed: false, posterior: 0.17, isCorrect: false, isIndependent: false, source: 'quiz', timestamp: '' },
      { id: '2', conceptId: 'c1', prior: 0.17, observed: false, posterior: 0.15, isCorrect: false, isIndependent: false, source: 'sandbox', timestamp: '' },
    ];
    assert.equal(getEvidenceLabel(repeatedErrors, 0.15), 'Likely Misconception');
  });

  it('applyObservationToNode correctly updates node mastery, traces and composite', () => {
    const mockNode: DKMNode = {
      id: 'test_node',
      name: 'Test Node',
      track: 'Web Application Development',
      category: 'Test',
      description: 'Test',
      keyConcept: 'Concept',
      typicalTrap: 'Trap',
      starterCodeSnippet: '',
      codeLanguage: 'javascript',
      starterErrorLog: '',
      prerequisites: [],
      status: 'RED',
      mastery: 0.20,
      errorCount: 0,
      solvedCount: 0,
    };

    const { updatedNode, trace } = applyObservationToNode(mockNode, {
      conceptId: 'test_node',
      isCorrect: true,
      isIndependent: true,
      source: 'sandbox',
      tierUsed: 1,
    });

    assert.equal(Number(updatedNode.mastery.toFixed(4)), 0.6000);
    assert.equal(updatedNode.status, 'YELLOW');
    assert.equal(trace.prior, 0.20);
    assert.equal(trace.posterior, 0.6000);
    assert.equal(updatedNode.bktTrace?.length, 1);
    assert(updatedNode.compositeMastery !== undefined);
  });
});
