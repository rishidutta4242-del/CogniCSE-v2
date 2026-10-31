import React, { useState } from 'react';
import { useTutor } from '../../context/TutorContext';
import { Users, AlertTriangle, TrendingUp, Sparkles, Download, CheckCircle, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { dkmNodes, switchRole } = useTutor();
  const [interventionGenerated, setInterventionGenerated] = useState(false);

  // Mock cohort statistics
  const cohortSize = 48;
  const avgClassMastery = 68;
  const atRiskCount = 7;

  const redNodes = dkmNodes.filter(n => n.status === 'RED');
  const yellowNodes = dkmNodes.filter(n => n.status === 'YELLOW');

  const handleGenerateIntervention = () => {
    setInterventionGenerated(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800/60">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Instructor & Faculty Telemetry Console
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">CSE Cohort Diagnostics & Intervention Analytics</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time aggregate telemetry across 48 Computer Science students. Monitors DKM concept heatmaps, recurrent anti-pattern traps, and scaffolding fading velocity.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => switchRole('student')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Switch to Student View
          </button>
          <button
            onClick={handleGenerateIntervention}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-950/40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Generate Intervention Plan
          </button>
        </div>
      </div>

      {/* COHORT OVERVIEW METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Cohort Enrollment</div>
          <div className="mt-2 text-2xl font-bold text-slate-100">{cohortSize} <span className="text-xs text-slate-500 font-normal">Students</span></div>
          <div className="mt-1 text-[11px] text-slate-400">CS 301: Systems & Architecture</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Average DKM Mastery</div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{avgClassMastery}%</div>
          <div className="mt-1 text-[11px] text-emerald-300">Cohort trending +8% this week</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Students At Risk</div>
          <div className="mt-2 text-2xl font-bold text-rose-400">{atRiskCount} <span className="text-xs text-slate-500 font-normal">Students</span></div>
          <div className="mt-1 text-[11px] text-rose-300">&gt;3 Active Red Nodes</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="text-xs text-slate-400 uppercase font-semibold">Scaffolding Fading Rate</div>
          <div className="mt-2 text-2xl font-bold text-purple-400">79%</div>
          <div className="mt-1 text-[11px] text-purple-300">Independent solve transition</div>
        </div>
      </div>

      {/* GENERATED INTERVENTION PLAN MODAL/ACCORDION */}
      {interventionGenerated && (
        <div className="p-5 bg-indigo-950/60 border border-indigo-700/80 rounded-2xl space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Automated Pedagogical Curriculum Intervention Plan
            </div>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900 px-2 py-0.5 rounded">
              Ready for Lecture Injection
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            Based on cohort telemetry, <strong>38% of students</strong> are confusing network daemon ports (MySQL 3306 vs HTTP 80) and <strong>31%</strong> are missing base cases in recursive call stacks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="font-bold text-indigo-400 block mb-1">Recommended 10-Min Live Lab Drill:</span>
              <span>"Live Socket Tracing: Using netstat/lsof to inspect port 80 vs 3306 daemon bindings."</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="font-bold text-indigo-400 block mb-1">Homework Scaffold Fading:</span>
              <span>"Deploy Tier 2 conceptual guidance for recursion assignments rather than Tier 4 syntax hints."</span>
            </div>
          </div>
        </div>
      )}

      {/* CLASS-WIDE DKM HEATMAP (24 CONCEPTS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100">Cohort Concept Competency Heatmap</h2>
            <p className="text-xs text-slate-400">Color density represents proportion of students mastering each DKM node.</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> &gt;75% Mastered
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> 40-74% In Progress
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> &lt;40% Critical Gap
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {dkmNodes.map(node => (
            <div
              key={node.id}
              className={`p-3 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                node.status === 'GREEN'
                  ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-200'
                  : node.status === 'YELLOW'
                  ? 'bg-amber-950/40 border-amber-800/70 text-amber-200'
                  : 'bg-rose-950/40 border-rose-800/70 text-rose-200'
              }`}
            >
              <div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{node.track.split(' ')[0]}</div>
                <div className="font-bold text-xs mt-1 line-clamp-2">{node.name}</div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                <span>Cohort:</span>
                <span className="font-bold">{(node.mastery * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
