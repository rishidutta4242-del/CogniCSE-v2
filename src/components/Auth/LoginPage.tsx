import React, { useState } from 'react';
import { useTutor } from '../../context/TutorContext';
import { Brain, Lock, Mail, User, Sparkles, ArrowRight, CheckCircle2, GraduationCap, Shield } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onOpenProfileBuilder: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onOpenProfileBuilder }) => {
  const { userProfile, setUserProfile, setIsAuthenticated } = useTutor();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('B.Tech Computer Science & Engineering');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUserProfile(prev => ({
      ...prev,
      name: name.trim() || prev.name || 'haritha karthikkumar',
      email: email.trim() || prev.email || 'haritha.k@university.edu',
      degree: degree || prev.degree,
    }));
    setIsAuthenticated(true);
    onSuccess();
  };

  const handleQuickDemo = (role: 'haritha' | 'teacher') => {
    if (role === 'haritha') {
      setUserProfile(prev => ({
        ...prev,
        id: 'CSE_STU_8810',
        name: 'haritha karthikkumar',
        email: 'haritha.k@university.edu',
        role: 'student',
        plan: 'Free Plan',
        degree: 'B.Tech in Computer Science & Engineering',
        targetMajor: 'Systems & Artificial Intelligence',
        preferredLanguages: ['python', 'javascript', 'java', 'cpp', 'php'],
        targetExams: ['Campus Placements', 'Discrete Mathematics'],
        streakDays: 7,
        testsCompleted: 3,
        overallMastery: 0.75,
      }));
    } else {
      setUserProfile(prev => ({
        ...prev,
        id: 'FACULTY_402',
        name: 'Prof. David Thorne',
        email: 'd.thorne@cs.university.edu',
        role: 'teacher',
        plan: 'Campus License',
        degree: 'Department of Computer Science & Engineering',
        preferredLanguages: ['cpp', 'python', 'go', 'rust'],
        targetExams: ['CS 301 Systems Curriculum'],
        streakDays: 42,
        testsCompleted: 18,
        overallMastery: 0.94,
      }));
    }
    setIsAuthenticated(true);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20 mb-3">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <span>CogniCSE</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700 font-mono">Matrix</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Intelligent 1-on-1 Pedagogical & Socratic Support Matrix</p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-[#0c1421] border border-[#1a273b] rounded-2xl p-7 shadow-2xl relative z-10 space-y-6">
        {/* Toggle Sign In / Register */}
        <div className="flex bg-[#070d18] p-1 rounded-xl border border-[#1a273b] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              !isRegister ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              isRegister ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Student Account
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. haritha karthikkumar"
                  className="w-full bg-[#070d18] border border-[#1a273b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Academic Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-[#070d18] border border-[#1a273b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#070d18] border border-[#1a273b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Degree / Specialization</label>
              <input
                type="text"
                value={degree}
                onChange={e => setDegree(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full bg-[#070d18] border border-[#1a273b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isRegister ? 'Build Profile & Enter' : 'Enter CogniCSE Platform'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#1a273b]" />
          <span className="text-[11px] text-slate-500 font-mono uppercase">Quick Demo Access</span>
          <div className="flex-1 h-px bg-[#1a273b]" />
        </div>

        {/* 1-Click Demo Profiles */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('haritha')}
            className="w-full p-2.5 bg-[#111b2b] hover:bg-[#162235] border border-[#1e2f47] rounded-xl text-left flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
                HK
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  Login as haritha karthikkumar
                </div>
                <div className="text-[10px] text-slate-400">Student Profile from Demo Video (Free Plan)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('teacher')}
            className="w-full p-2.5 bg-[#111b2b] hover:bg-[#162235] border border-[#1e2f47] rounded-xl text-left flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs">
                DT
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                  Login as Faculty / Instructor
                </div>
                <div className="text-[10px] text-slate-400">Department Professor (Classroom Analytics)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Socratic Scaffolding & Anti-Answer Protected</span>
        </div>
      </div>
    </div>
  );
};
