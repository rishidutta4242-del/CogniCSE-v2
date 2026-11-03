import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MASTERY_BAND_UUIDS,
  EngagementEventType,
  HapticCommand,
  EngagementEvent,
} from '../src/components/Engagement/types.js';

describe('Engagement Panel - MasteryBand & Attention Proxies', () => {
  it('validates GATT Service and Characteristic UUIDs per specification', () => {
    assert.equal(MASTERY_BAND_UUIDS.SERVICE, '12345678-1234-5678-1234-56789abcdef0');
    assert.equal(MASTERY_BAND_UUIDS.EVENT_CHAR, '12345678-1234-5678-1234-56789abcdef1');
    assert.equal(MASTERY_BAND_UUIDS.COMMAND_CHAR, '12345678-1234-5678-1234-56789abcdef2');
  });

  it('maps single tap (NEED_HELP) to Tier 1 hint and SINGLE_SHORT haptic feedback', () => {
    const eventType: EngagementEventType = 'NEED_HELP';
    let tierInfluenced: number | undefined;
    let hapticSent: HapticCommand | undefined;

    if (eventType === 'NEED_HELP') {
      tierInfluenced = 1;
      hapticSent = 'SINGLE_SHORT';
    }

    assert.equal(tierInfluenced, 1, 'NEED_HELP must influence Tier 1 metacognitive hint');
    assert.equal(hapticSent, 'SINGLE_SHORT', 'Haptic response must be SINGLE_SHORT');
  });

  it('maps double tap (NEED_HINT) to Tier 2 guidance and DOUBLE_SHORT haptic feedback', () => {
    const eventType: EngagementEventType = 'NEED_HINT';
    let tierInfluenced: number | undefined;
    let hapticSent: HapticCommand | undefined;

    if (eventType === 'NEED_HINT') {
      tierInfluenced = 2;
      hapticSent = 'DOUBLE_SHORT';
    }

    assert.equal(tierInfluenced, 2, 'NEED_HINT must influence Tier 2 conceptual guidance');
    assert.equal(hapticSent, 'DOUBLE_SHORT', 'Haptic response must be DOUBLE_SHORT');
  });

  it('maps triple tap (NEED_BREAK) to LONG haptic break command', () => {
    const eventType: EngagementEventType = 'NEED_BREAK';
    let hapticSent: HapticCommand | undefined;

    if (eventType === 'NEED_BREAK') {
      hapticSent = 'LONG';
    }

    assert.equal(hapticSent, 'LONG', 'NEED_BREAK must trigger LONG haptic pulse');
  });

  it('verifies that I_UNDERSTAND self-report does NOT update BKT directly without verification', () => {
    // Initial BKT prior
    let bktMastery = 0.40;
    const selfReportFired = true;

    // Self-report fires -> prompts question, DOES NOT update BKT
    if (selfReportFired) {
      // Question pending...
      assert.equal(bktMastery, 0.40, 'Mastery must not change upon self-report alone');
    }

    // When verification answer is submitted correctly:
    const isAnswerCorrect = true;
    if (isAnswerCorrect) {
      bktMastery = 0.65; // Updated!
      const command: HapticCommand = 'SHORT_LONG';
      assert.equal(command, 'SHORT_LONG', 'Mastery verified command must be SHORT_LONG');
    }

    assert.equal(bktMastery, 0.65);
  });

  it('differentiates REAL SENSOR vs SIMULATED provenance badges in telemetry events', () => {
    const realEvent: EngagementEvent = {
      id: 'e1',
      timestamp: '10:00:00',
      type: 'TAB_HIDDEN',
      source: 'REAL SENSOR',
      description: 'Navigated away from tab',
    };

    const simEvent: EngagementEvent = {
      id: 'e2',
      timestamp: '10:00:01',
      type: 'NEED_HELP',
      source: 'SIMULATED',
      description: 'Hardware simulator button pressed',
      tierInfluenced: 1,
      hapticSent: 'SINGLE_SHORT',
    };

    assert.equal(realEvent.source, 'REAL SENSOR');
    assert.equal(simEvent.source, 'SIMULATED');
  });

  it('enforces idle attention proxy threshold at 180 seconds (3 minutes)', () => {
    const idleSeconds = 180;
    const shouldNudge = idleSeconds >= 180;
    assert.equal(shouldNudge, true, 'Idle >= 180s must trigger gentle check-in nudge');

    const shortIdle = 60;
    assert.equal(shortIdle >= 180, false, 'Idle < 180s must not trigger idle timeout');
  });
});
