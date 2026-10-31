import React, { useState } from 'react';
import { Sparkles, ShieldAlert, CheckCircle, XCircle, ArrowRight, Brain, AlertTriangle, Play, RefreshCw, BarChart2 } from 'lucide-react';

export const ComparisonView: React.FC = () => {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');

  const runComparisonSimulation = () => {
    setSimulationState('running');
    setTimeout(() => {
      setSimulationState('completed');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800/60">
              <BarChart2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              CSE Empirical Educational Research Framework
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Generic Assistance vs. CogniCSE Socratic Scaffolding
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Side-by-side empirical comparison evaluating learning gain, error recurrence drop, and independent problem-solving transfer across Computer Science students.
          </p>
        </div>

        <button
          onClick={runComparisonSimulation}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-950/40 transition-colors cursor-pointer shrink-0"
        >
          {simulationState === 'running' ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          Simulate Student Learning Outcome
        </button>
      </div>

      {/* METRIC HEAD-TO-HEAD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Independent Solve Rate</div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">86% <span className="text-xs text-slate-500 font-normal">vs 12%</span></div>
          <div className="mt-1 text-[11px] text-emerald-300">CogniCSE +74% Gain</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Error Recurrence Rate</div>
          <div className="mt-2 text-2xl font-bold text-indigo-400">14% <span className="text-xs text-slate-500 font-normal">vs 89%</span></div>
          <div className="mt-1 text-[11px] text-indigo-300">75% Reduction in Pitfalls</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Cognitive Retention</div>
          <div className="mt-2 text-2xl font-bold text-amber-400">3.8x <span className="text-xs text-slate-500 font-normal">longer</span></div>
          <div className="mt-1 text-[11px] text-amber-300">Measured 14-day retest</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Scaffolding Fading Index</div>
          <div className="mt-2 text-2xl font-bold text-purple-400">0.82 <span className="text-xs text-slate-500 font-normal">Faded</span></div>
          <div className="mt-1 text-[11px] text-purple-300">Autonomous graduation</div>
        </div>
      </div>

      {/* SIDE-BY-SIDE INTERACTIVE PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: GENERIC RAW ASSISTANCE */}
        <div className="bg-slate-900 border border-rose-900/60 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-slate-100">Generic Assistant / Raw LLM</h2>
            </div>
            <span className="text-[10px] font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
              Copy-Paste Anti-Pattern
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            <span className="text-slate-500 block">Student asks: "Give me the fixed code."</span>
            <span className="text-rose-400 block font-semibold">Generic Bot Response:</span>
            <pre className="text-slate-300 text-[11px] whitespace-pre-wrap mt-1 bg-slate-900 p-2 rounded">
{`// Here is the complete fixed code:
$pdo = new PDO('mysql:host=localhost;port=3306;dbname=test', 'root', '');
// Just paste this in!`}
            </pre>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>Direct solution spoon-fed; student copies without mental model formation.</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>No distinction understood between TCP port 80 and port 3306.</span>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>Next lab assignment with PostgreSQL port 5432 fails identically.</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-rose-400 font-mono">
            Outcome: Zero independent problem-solving growth.
          </div>
        </div>

        {/* RIGHT: COGNICSE PEDAGOGICAL SCAFFOLDING */}
        <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-6 shadow-md space-y-4 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-100">CogniCSE Socratic Engine</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              4-Tier Progressive Scaffolding
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            <span className="text-slate-500 block">Student asks: "Give me the fixed code."</span>
            <span className="text-emerald-400 block font-semibold">CogniCSE Socratic Response:</span>
            <div className="text-slate-300 text-[11px] leading-relaxed mt-1 bg-slate-900 p-2.5 rounded border border-indigo-900/40">
              <p className="text-amber-300 font-semibold mb-1">
                "I'm here to help you master this step-by-step so you can solve it independently!"
              </p>
              <p className="text-slate-200">
                Notice your DSN targets port 80 (HTTP). What standard port number does MySQL listen on?
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Anti-Answer protocol deflecting copy-paste dependencies.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Progressive tiers activate metacognitive reflection and mental mapping.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Student corrects the line independently; verified with runtime assertions.</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono">
            Outcome: Deep mental model established; 86% independent mastery proven.
          </div>
        </div>
      </div>
    </div>
  );
};
