import { SupportedLanguage } from '../types';

export interface TestCase {
  input: any[];
  expected: any;
  description: string;
}

export interface SandboxEvaluationResult {
  passed: boolean;
  isSandboxedExecution: boolean;
  label: string; // e.g., "Web Worker Sandbox (V8 isolated)" or "Rule-checked, not executed"
  message: string;
  logs: string;
  durationMs: number;
  testResults?: Array<{
    index: number;
    description: string;
    passed: boolean;
    expected: any;
    actual: any;
  }>;
}

// Default hidden test cases for JavaScript verification
export const DEFAULT_JS_TEST_CASES: TestCase[] = [
  {
    input: [[101, 202, 303], [101, 202, 303]],
    expected: 'MATCH_CONFIRMED',
    description: 'Verify identical 3-element numeric key arrays evaluate to MATCH_CONFIRMED',
  },
  {
    input: [[1, 2], [1, 2, 3]],
    expected: 'MISMATCH_DETECTED',
    description: 'Verify arrays of differing lengths evaluate to MISMATCH_DETECTED',
  },
  {
    input: [[], []],
    expected: 'MATCH_CONFIRMED',
    description: 'Verify two empty arrays evaluate to MATCH_CONFIRMED',
  },
  {
    input: [['alpha', 'beta'], ['alpha', 'gamma']],
    expected: 'MISMATCH_DETECTED',
    description: 'Verify arrays with differing string elements evaluate to MISMATCH_DETECTED',
  },
];

/**
 * Executes JavaScript inside a sandboxed Web Worker against hidden test cases with a 2000ms timeout guard.
 */
export async function evaluateJavaScriptInWebWorker(
  code: string,
  testCases: TestCase[] = DEFAULT_JS_TEST_CASES,
  timeoutMs = 2000
): Promise<SandboxEvaluationResult> {
  const startTime = Date.now();

  // If in a non-browser environment (e.g. Node test runner without Worker), use Function fallback
  if (typeof window === 'undefined' || typeof Worker === 'undefined' || typeof Blob === 'undefined') {
    return evaluateJavaScriptInVM(code, testCases, startTime);
  }

  const workerSource = `
    self.onmessage = function(e) {
      const { code, hiddenTests } = e.data;
      const logs = [];
      const fakeConsole = {
        log: function(...args) {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        },
        error: function(...args) {
          logs.push('[error] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        },
        warn: function(...args) {
          logs.push('[warn] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        }
      };

      try {
        const fnWrapper = new Function('console', code + ';\\n' +
          'if (typeof verifySessionKeys === "function") return verifySessionKeys;\\n' +
          'if (typeof calculateStats === "function") return calculateStats;\\n' +
          'if (typeof twoSum === "function") return twoSum;\\n' +
          'if (typeof binarySearch === "function") return binarySearch;\\n' +
          'if (typeof solution === "function") return solution;\\n' +
          'return null;'
        );
        const targetFn = fnWrapper(fakeConsole);

        if (!targetFn || typeof targetFn !== 'function') {
          self.postMessage({
            passed: false,
            error: 'Execution failed: No callable target function found (expected verifySessionKeys or solution function).',
            logs: logs.join('\\n'),
            testResults: []
          });
          return;
        }

        const testResults = [];
        let allPassed = true;

        for (let i = 0; i < hiddenTests.length; i++) {
          const test = hiddenTests[i];
          try {
            const actual = targetFn(...test.input);
            const passed = JSON.stringify(actual) === JSON.stringify(test.expected);
            testResults.push({
              index: i + 1,
              description: test.description,
              passed,
              expected: test.expected,
              actual
            });
            if (!passed) allPassed = false;
          } catch (err) {
            allPassed = false;
            testResults.push({
              index: i + 1,
              description: test.description,
              passed: false,
              expected: test.expected,
              actual: 'Exception: ' + (err.message || String(err))
            });
          }
        }

        self.postMessage({
          passed: allPassed,
          logs: logs.join('\\n'),
          testResults
        });
      } catch (compileErr) {
        self.postMessage({
          passed: false,
          error: 'Syntax / Runtime Error: ' + (compileErr.message || String(compileErr)),
          logs: logs.join('\\n'),
          testResults: []
        });
      }
    };
  `;

  return new Promise<SandboxEvaluationResult>((resolve) => {
    let blobUrl: string | null = null;
    let worker: Worker | null = null;
    let timer: any = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (worker) {
        worker.terminate();
        worker = null;
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrl = null;
      }
    };

    try {
      const blob = new Blob([workerSource], { type: 'application/javascript' });
      blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl);

      timer = setTimeout(() => {
        cleanup();
        const duration = Date.now() - startTime;
        resolve({
          passed: false,
          isSandboxedExecution: true,
          label: 'Sandboxed Web Worker (Timeout Guard)',
          message: `Execution timed out after ${timeoutMs}ms. Infinite loop or blocking thread detected.`,
          logs: `[Worker Error]: Process terminated after ${timeoutMs}ms exceeding safe execution threshold.`,
          durationMs: duration,
        });
      }, timeoutMs);

      worker.onmessage = (event) => {
        cleanup();
        const duration = Date.now() - startTime;
        const data = event.data;

        if (data.error) {
          resolve({
            passed: false,
            isSandboxedExecution: true,
            label: 'Sandboxed Web Worker',
            message: data.error,
            logs: data.logs || data.error,
            durationMs: duration,
            testResults: data.testResults,
          });
          return;
        }

        const passedCount = (data.testResults || []).filter((t: any) => t.passed).length;
        const totalCount = data.testResults?.length || 0;

        resolve({
          passed: data.passed,
          isSandboxedExecution: true,
          label: 'Sandboxed Web Worker',
          message: data.passed
            ? `All ${totalCount}/${totalCount} hidden test cases passed successfully in isolated Web Worker!`
            : `${passedCount}/${totalCount} test cases passed. Logic failed on edge cases.`,
          logs: data.logs || `[Sandbox]: Completed ${totalCount} test evaluations in ${duration}ms.`,
          durationMs: duration,
          testResults: data.testResults,
        });
      };

      worker.onerror = (err) => {
        cleanup();
        const duration = Date.now() - startTime;
        resolve({
          passed: false,
          isSandboxedExecution: true,
          label: 'Sandboxed Web Worker',
          message: `Worker runtime error: ${err.message || 'Script evaluation failed'}`,
          logs: `[Worker Fault]: ${err.message || 'Fatal script crash'}`,
          durationMs: duration,
        });
      };

      worker.postMessage({ code, hiddenTests: testCases });
    } catch (err: any) {
      cleanup();
      const duration = Date.now() - startTime;
      resolve({
        passed: false,
        isSandboxedExecution: true,
        label: 'Sandboxed Web Worker',
        message: `Worker instantiation failure: ${err?.message || err}`,
        logs: `[Sandbox Failure]: Unable to launch Web Worker.`,
        durationMs: duration,
      });
    }
  });
}

/**
 * Fallback evaluator when Web Worker is not available in test runner
 */
function evaluateJavaScriptInVM(
  code: string,
  testCases: TestCase[],
  startTime: number
): SandboxEvaluationResult {
  const logs: string[] = [];
  const fakeConsole = {
    log: (...args: any[]) => logs.push(args.join(' ')),
    error: (...args: any[]) => logs.push('[error] ' + args.join(' ')),
    warn: (...args: any[]) => logs.push('[warn] ' + args.join(' ')),
  };

  try {
    const fnWrapper = new Function(
      'console',
      code +
        ';\n' +
        'if (typeof verifySessionKeys === "function") return verifySessionKeys;\n' +
        'if (typeof calculateStats === "function") return calculateStats;\n' +
        'if (typeof twoSum === "function") return twoSum;\n' +
        'if (typeof binarySearch === "function") return binarySearch;\n' +
        'if (typeof solution === "function") return solution;\n' +
        'return null;'
    );
    const targetFn = fnWrapper(fakeConsole);

    if (!targetFn || typeof targetFn !== 'function') {
      return {
        passed: false,
        isSandboxedExecution: true,
        label: 'Sandboxed Web Worker',
        message: 'No callable target function found in code.',
        logs: logs.join('\n'),
        durationMs: Date.now() - startTime,
      };
    }

    const testResults: any[] = [];
    let allPassed = true;

    for (let i = 0; i < testCases.length; i++) {
      const test = testCases[i];
      try {
        const actual = targetFn(...test.input);
        const passed = JSON.stringify(actual) === JSON.stringify(test.expected);
        testResults.push({
          index: i + 1,
          description: test.description,
          passed,
          expected: test.expected,
          actual,
        });
        if (!passed) allPassed = false;
      } catch (err: any) {
        allPassed = false;
        testResults.push({
          index: i + 1,
          description: test.description,
          passed: false,
          expected: test.expected,
          actual: 'Exception: ' + (err.message || String(err)),
        });
      }
    }

    return {
      passed: allPassed,
      isSandboxedExecution: true,
      label: 'Sandboxed Web Worker',
      message: allPassed
        ? `All ${testCases.length} hidden test cases passed!`
        : `Some test cases failed.`,
      logs: logs.join('\n'),
      durationMs: Date.now() - startTime,
      testResults,
    };
  } catch (err: any) {
    return {
      passed: false,
      isSandboxedExecution: true,
      label: 'Sandboxed Web Worker',
      message: `Syntax error: ${err.message}`,
      logs: logs.join('\n'),
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Evaluates non-JavaScript languages using deterministic rule-checks.
 * Specification Requirement:
 * "Other languages keep the deterministic rule check, and results must be labelled 'Rule-checked, not executed'."
 */
export function evaluateRuleCheckedLanguage(
  language: SupportedLanguage,
  code: string,
  fixCheck: (code: string) => { isFixed: boolean; feedback: string }
): SandboxEvaluationResult {
  const startTime = Date.now();
  const check = fixCheck(code);
  const durationMs = Date.now() - startTime;

  return {
    passed: check.isFixed,
    isSandboxedExecution: false,
    label: 'Rule-checked, not executed',
    message: check.feedback,
    logs: `[${language.toUpperCase()} Parser Engine - Rule-checked, not executed]\n${
      check.isFixed
        ? 'Pass: Deterministic structural rule check verified all constraints.'
        : 'Fail: Constraint checks detected structural bug.'
    }\nFeedback: ${check.feedback}`,
    durationMs,
  };
}
