import {
  DKMNode,
  BKTTrace,
  EvidenceLabel,
  MasteryStatus,
  CompositeMasteryBreakdown,
  ObservationInput,
  NodeStatus,
} from '../types';

export interface BKTParams {
  pL0: number; // Initial prior probability of knowledge (default 0.20)
  pT: number;  // Probability of transition / learning step (default 0.15)
  pG: number;  // Probability of guess (default 0.20)
  pS: number;  // Probability of slip (default 0.10)
}

export const DEFAULT_BKT_PARAMS: BKTParams = {
  pL0: 0.20,
  pT: 0.15,
  pG: 0.20,
  pS: 0.10,
};

/**
 * Standard Bayesian Knowledge Tracing (Corbett & Anderson)
 * 1. Observation update:
 *    P(L | Correct)   = (pL * (1 - pS)) / (pL * (1 - pS) + (1 - pL) * pG)
 *    P(L | Incorrect) = (pL * pS) / (pL * pS + (1 - pL) * (1 - pG))
 * 2. Learning transition:
 *    pL_new = P(L | obs) + (1 - P(L | obs)) * pT
 * 3. Clamped to [0.01, 0.99]
 */
export function calculateBKTUpdate(
  priorPL: number,
  isCorrect: boolean,
  params: Partial<BKTParams> = {}
): { pLObserved: number; posterior: number } {
  const pS = params.pS ?? DEFAULT_BKT_PARAMS.pS;
  const pG = params.pG ?? DEFAULT_BKT_PARAMS.pG;
  const pT = params.pT ?? DEFAULT_BKT_PARAMS.pT;

  // Clamp prior to [0.01, 0.99] before updating
  const pL = Math.max(0.01, Math.min(0.99, priorPL));

  let pLObserved: number;
  if (isCorrect) {
    const num = pL * (1 - pS);
    const den = num + (1 - pL) * pG;
    pLObserved = den === 0 ? pL : num / den;
  } else {
    const num = pL * pS;
    const den = num + (1 - pL) * (1 - pG);
    pLObserved = den === 0 ? pL : num / den;
  }

  const pLNew = pLObserved + (1 - pLObserved) * pT;
  const clampedPosterior = Math.max(0.01, Math.min(0.99, pLNew));

  return {
    pLObserved,
    posterior: clampedPosterior,
  };
}

/**
 * Node colour based on pL
 * GREEN: pL >= 0.80
 * YELLOW: 0.50 to 0.79
 * RED: below 0.50
 */
export function getNodeColor(pL: number): NodeStatus {
  if (pL >= 0.80) return 'GREEN';
  if (pL >= 0.50) return 'YELLOW';
  return 'RED';
}

/**
 * Evidence label based on trace history and pL
 * 'Insufficient Evidence' | 'Possible Difficulty' | 'Likely Misconception' | 'Confirmed through Repeated Evidence'
 */
export function getEvidenceLabel(traces: BKTTrace[] = [], pL: number): EvidenceLabel {
  if (!traces || traces.length < 2) {
    return 'Insufficient Evidence';
  }

  const incorrectCount = traces.filter(t => !t.isCorrect).length;
  const correctCount = traces.filter(t => t.isCorrect).length;

  if (pL >= 0.80 && correctCount >= 2) {
    return 'Confirmed through Repeated Evidence';
  }

  if (pL < 0.50) {
    if (incorrectCount >= 2) {
      return 'Likely Misconception';
    }
    return 'Possible Difficulty';
  }

  // 0.50 <= pL < 0.80
  if (incorrectCount > 0) {
    return 'Possible Difficulty';
  }

  return 'Confirmed through Repeated Evidence';
}

export interface CompositeComponentsInput {
  conceptual: number;       // 0-100
  practical: number;        // 0-100
  independent: number;      // 0-100
  retention?: number | null; // 0-100 or null/undefined
  independentPassedCount?: number;
}

/**
 * Composite topic mastery = Conceptual 35% + Practical 35% + Independent 20% + Retention 10%.
 * If Retention does not exist yet, exclude it and renormalise the other weights.
 * Status: Mastered requires composite >= 85, independent >= 75 and at least one passed independent transfer task.
 */
export function calculateCompositeMastery(input: CompositeComponentsInput): CompositeMasteryBreakdown {
  const hasRetention = input.retention !== null && input.retention !== undefined;
  const independentPassedCount = input.independentPassedCount ?? (input.independent >= 75 ? 1 : 0);

  let composite: number;
  let weights: { conceptual: number; practical: number; independent: number; retention: number };

  if (hasRetention) {
    weights = {
      conceptual: 0.35,
      practical: 0.35,
      independent: 0.20,
      retention: 0.10,
    };
    const rawComposite =
      input.conceptual * weights.conceptual +
      input.practical * weights.practical +
      input.independent * weights.independent +
      (input.retention as number) * weights.retention;
    composite = Math.round(rawComposite);
  } else {
    // Normalise weights over 0.90 sum
    const totalWeight = 0.35 + 0.35 + 0.20; // 0.90
    weights = {
      conceptual: +(0.35 / totalWeight).toFixed(4),
      practical: +(0.35 / totalWeight).toFixed(4),
      independent: +(0.20 / totalWeight).toFixed(4),
      retention: 0,
    };
    const rawComposite =
      (input.conceptual * 0.35 + input.practical * 0.35 + input.independent * 0.20) / totalWeight;
    composite = Math.round(rawComposite);
  }

  let status: MasteryStatus;
  if (composite >= 85 && input.independent >= 75 && independentPassedCount >= 1) {
    status = 'Mastered';
  } else if (composite >= 75) {
    status = 'Near Mastery';
  } else if (composite >= 60) {
    status = 'Improving';
  } else if (composite >= 40) {
    status = 'Developing';
  } else {
    status = 'Needs Attention';
  }

  return {
    composite,
    conceptual: Math.round(input.conceptual),
    practical: Math.round(input.practical),
    independent: Math.round(input.independent),
    retention: hasRetention ? Math.round(input.retention as number) : null,
    weights,
    status,
    independentPassedCount,
  };
}

/**
 * Score practical lab attempt by scaffolding tier used:
 * tier 1 = 100, tier 2 = 85, tier 3 = 70, tier 4 = 50
 */
export function getPracticalScoreForTier(tier: number = 1, isCorrect: boolean = true): number {
  if (!isCorrect) return 30;
  switch (tier) {
    case 1: return 100;
    case 2: return 85;
    case 3: return 70;
    case 4: return 50;
    default: return 100;
  }
}

/**
 * Recomputes composite mastery for a DKMNode based on its trace history and current pL
 */
export function deriveNodeComposite(node: DKMNode): CompositeMasteryBreakdown {
  const traces = node.bktTrace || [];
  const isUnassessed =
    node.status === 'NOT_ASSESSED' ||
    (traces.length === 0 && node.mastery === 0 && node.solvedCount === 0 && node.errorCount === 0);

  if (isUnassessed) {
    return {
      composite: 0,
      conceptual: 0,
      practical: 0,
      independent: 0,
      retention: null,
      weights: {
        conceptual: 0.3889,
        practical: 0.3889,
        independent: 0.2222,
        retention: 0,
      },
      status: 'Not Assessed',
      independentPassedCount: 0,
    };
  }

  // Conceptual traces: quiz, pretest, mock-test, micro-drill
  const conceptualTraces = traces.filter(t =>
    ['quiz', 'pretest', 'mock-test', 'micro-drill', 'diagnostic'].includes(t.source)
  );
  const conceptualScore = conceptualTraces.length > 0
    ? (conceptualTraces.filter(t => t.isCorrect).length / conceptualTraces.length) * 100
    : node.mastery * 100;

  // Practical traces: sandbox, lab
  const practicalTraces = traces.filter(t =>
    ['sandbox', 'lab'].includes(t.source)
  );
  let practicalScore: number;
  if (practicalTraces.length > 0) {
    const sum = practicalTraces.reduce((acc, t) => {
      const tierScore = getPracticalScoreForTier(t.tierUsed || 1, t.isCorrect);
      return acc + tierScore;
    }, 0);
    practicalScore = sum / practicalTraces.length;
  } else {
    practicalScore = node.mastery * 100;
  }

  // Independent traces: isIndependent = true, transfer tasks
  const independentTraces = traces.filter(t => t.isIndependent || t.source === 'transfer-task');
  const independentPassedCount = independentTraces.filter(t => t.isCorrect).length;
  const independentScore = independentTraces.length > 0
    ? (independentPassedCount / independentTraces.length) * 100
    : (node.solvedCount > 0 ? Math.min(80, node.mastery * 100) : node.mastery * 80);

  // Retention traces: delayed recheck
  const retentionTraces = traces.filter(t => ['recheck', 'retention'].includes(t.source));
  const retentionScore = retentionTraces.length > 0
    ? (retentionTraces.filter(t => t.isCorrect).length / retentionTraces.length) * 100
    : null; // Excluded if none exists yet!

  return calculateCompositeMastery({
    conceptual: conceptualScore,
    practical: practicalScore,
    independent: independentScore,
    retention: retentionScore,
    independentPassedCount,
  });
}

/**
 * Applies a new pedagogical observation to a DKMNode using BKT and composite update.
 */
export function applyObservationToNode(
  node: DKMNode,
  obs: ObservationInput
): { updatedNode: DKMNode; trace: BKTTrace } {
  const prior = node.mastery;
  const { pLObserved, posterior } = calculateBKTUpdate(prior, obs.isCorrect);

  const trace: BKTTrace = {
    id: `trace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    conceptId: node.id,
    prior: +prior.toFixed(4),
    observed: obs.isCorrect,
    posterior: +posterior.toFixed(4),
    pLObserved: +pLObserved.toFixed(4),
    isCorrect: obs.isCorrect,
    isIndependent: obs.isIndependent,
    source: obs.source,
    timestamp: new Date().toISOString(),
    errorCategory: obs.errorCategory,
    tierUsed: obs.tierUsed,
  };

  const updatedTraces = [...(node.bktTrace || []), trace];
  const newStatus = getNodeColor(posterior);
  const evidenceLabel = getEvidenceLabel(updatedTraces, posterior);

  const intermediateNode: DKMNode = {
    ...node,
    mastery: +posterior.toFixed(4),
    status: newStatus,
    errorCount: obs.isCorrect ? node.errorCount : node.errorCount + 1,
    solvedCount: obs.isCorrect ? node.solvedCount + 1 : node.solvedCount,
    bktTrace: updatedTraces,
    evidenceLabel,
  };

  const compositeMastery = deriveNodeComposite(intermediateNode);

  return {
    updatedNode: {
      ...intermediateNode,
      compositeMastery,
    },
    trace,
  };
}
