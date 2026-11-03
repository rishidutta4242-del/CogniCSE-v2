import { AttemptRecord } from '../types';

/**
 * Calculates the Scaffolding Fading Index.
 * Formula from specification:
 * Scaffolding Fading Index = 1 - (mean(tierUsed over last 5 attempts) - 1) / 3
 * Bounded strictly between [0.0, 1.0].
 */
export function calculateScaffoldingFadingIndex(recentAttempts: AttemptRecord[]): number {
  if (!recentAttempts || recentAttempts.length === 0) {
    return 0.25;
  }

  const last5 = recentAttempts.slice(-5);
  const sumTiers = last5.reduce((acc, curr) => acc + (curr.tierUsed || 1), 0);
  const meanTier = sumTiers / last5.length;

  const rawIndex = 1 - (meanTier - 1) / 3;
  return Math.max(0.0, Math.min(1.0, Number(rawIndex.toFixed(2))));
}

/**
 * Scaffolding policy starting tier:
 * First attempt starts at the tier carried over from the student's last attempt on that concept,
 * minus 1 (minimum 1).
 */
export function calculateAttemptStartingTier(studentAttemptsOnConcept: AttemptRecord[]): number {
  if (!studentAttemptsOnConcept || studentAttemptsOnConcept.length === 0) {
    return 1;
  }

  const lastAttempt = studentAttemptsOnConcept[studentAttemptsOnConcept.length - 1];
  const lastTier = lastAttempt?.tierUsed || 1;
  return Math.max(1, lastTier - 1);
}

/**
 * Scaffolding progression on the same exercise:
 * Each failed attempt on the same exercise goes up one tier (maximum 4).
 */
export function calculateCurrentTier(startingTier: number, failedAttemptsOnCurrentExercise: number): number {
  return Math.min(4, Math.max(1, startingTier + failedAttemptsOnCurrentExercise));
}

/**
 * Unlocks independent transfer task:
 * Unlocked after 2 consecutive passes at Tier 1 on that concept.
 */
export function isTransferTaskUnlocked(studentAttemptsOnConcept: AttemptRecord[]): boolean {
  if (!studentAttemptsOnConcept || studentAttemptsOnConcept.length < 2) {
    return false;
  }

  // Look at the latest attempts on this concept
  const n = studentAttemptsOnConcept.length;
  const last = studentAttemptsOnConcept[n - 1];
  const secondLast = studentAttemptsOnConcept[n - 2];

  return Boolean(
    last &&
    secondLast &&
    last.passed === true &&
    last.tierUsed === 1 &&
    secondLast.passed === true &&
    secondLast.tierUsed === 1
  );
}

/**
 * Checks whether an observed error category has been seen before on this concept.
 * repeatedError = same category + concept seen before.
 */
export function isRepeatedError(
  pastAttempts: AttemptRecord[],
  conceptId: string,
  errorCategory?: string
): boolean {
  if (!errorCategory) return false;
  return pastAttempts.some(
    a => a.conceptId === conceptId && a.errorCategory === errorCategory
  );
}
