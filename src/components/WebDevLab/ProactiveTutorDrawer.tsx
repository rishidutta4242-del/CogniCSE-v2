import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Brain,
  Lightbulb,
} from 'lucide-react';
import { ProactiveNudge } from './types';

interface ProactiveTutorDrawerProps {
  nudge: ProactiveNudge | null;
  onDismiss: () => void;
  priorPL?: number;
  posteriorPL?: number;
  isRepeatedError?: boolean;
}

export const ProactiveTutorDrawer: React.FC<ProactiveTutorDrawerProps> = ({
  nudge,
  onDismiss,
  priorPL,
  posteriorPL,
  isRepeatedError,
}) => {
  const [speakHints, setSpeakHints] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Trigger speech synthesis when a new nudge arrives and speakHints is active
  useEffect(() => {
    if (!nudge || !speakHints) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const textToSpeak = `${nudge.message} ${nudge.socraticQuestion}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [nudge, speakHints]);

  const toggleSpeakHints = () => {
    const nextState = !speakHints;
    setSpeakHints(nextState);
    if (!nextState && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  if (!nudge) {
    return (
      <div className="bg-[#0b121e] border border-[#1e2f47] rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Socratic Nudge Engine: Monitoring virtual environment actions in real-time</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSpeakHints}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
              speakHints
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/60'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle speech synthesis for proactive hints"
          >
            {speakHints ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{speakHints ? 'Voice Enabled' : 'Speak Hints'}</span>
          </button>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            SIMULATED
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#0f172a] via-[#111e33] to-[#0f172a] border border-indigo-700/70 rounded-2xl p-4 shadow-2xl space-y-3 transition-all">
      {/* Header with Badges and Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-indigo-900/60">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/40">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span>CogniCSE Socratic Nudge</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono">
                Tier {nudge.tier} Guided Scaffolding
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Standing Rule 4 + Lab Prompt Provenance Badge */}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60">
            Virtual environment (simulated)
          </span>

          {/* Voice toggle */}
          <button
            onClick={toggleSpeakHints}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
              speakHints
                ? 'bg-blue-600/40 text-blue-200 border-blue-500'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {speakHints ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{speakHints ? 'Voice On' : 'Speak Hints'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* Diagnosis & Misconception */}
          <div className="bg-[#090f19] border border-[#1b2a40] rounded-xl p-3 text-xs space-y-1.5">
            <div className="font-bold text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{nudge.title}</span>
              {isRepeatedError && (
                <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-mono">
                  Repeated Error Trap
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed">{nudge.message}</p>
          </div>

          {/* Socratic Reflective Question (Anti-Answer Protocol) */}
          <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 text-xs space-y-1">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Reflective Challenge:</span>
            </div>
            <p className="text-slate-200 font-medium pl-5">{nudge.socraticQuestion}</p>
          </div>

          {/* Before/After Bayesian Mastery Delta Card */}
          {priorPL !== undefined && posteriorPL !== undefined && (
            <div className="bg-[#0b1424] border border-[#1a2b42] rounded-xl p-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400 text-[11px]">BKT Knowledge State:</span>
                <span className="font-mono text-slate-300">{(priorPL * 100).toFixed(1)}%</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span
                  className={`font-mono font-bold ${
                    posteriorPL >= priorPL ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {(posteriorPL * 100).toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Error Class: <strong className="text-indigo-300">{nudge.errorCategory}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
