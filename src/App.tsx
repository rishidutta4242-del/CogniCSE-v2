import React, { useState } from 'react';
import { TutorProvider, useTutor } from './context/TutorContext';
import { LoginPage } from './components/Auth/LoginPage';
import { ProfileModal } from './components/Profile/ProfileModal';
import { VisionSidebar } from './components/Navigation/VisionSidebar';
import { VisionSolveChat } from './components/Chat/VisionSolveChat';
import { VisionMockTest } from './components/MockTest/VisionMockTest';
import { CodeSandbox } from './components/CodeSandbox/CodeSandbox';
import { VisionMemoryTree } from './components/MemoryTree/VisionMemoryTree';
import { VisionLibraryVault } from './components/LibraryVault/VisionLibraryVault';
import { AIVideoPlayer } from './components/AIVideo/AIVideoPlayer';
import { ComparisonView } from './components/ComparisonView/ComparisonView';
import { StudentDashboard } from './components/Dashboards/StudentDashboard';
import { TeacherDashboard } from './components/Dashboards/TeacherDashboard';
import { DiagnosticPretestModal } from './components/Pretest/DiagnosticPretestModal';
import { SecurityAuditModal } from './components/SecurityAudit/SecurityAuditModal';
import { WhyThisScoreDrawer } from './components/Mastery/WhyThisScoreDrawer';
import { CADLab } from './components/CADLab/CADLab';

const MainApplication: React.FC = () => {
  const {
    isAuthenticated,
    currentWorkflow,
    setCurrentWorkflow,
    setSelectedNode,
    activeDrawerNode,
    isWhyDrawerOpen,
    closeWhyScoreDrawer,
    activeTrack,
  } = useTutor();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);
  const [isPretestOpen, setIsPretestOpen] = useState(false);

  // If not authenticated, render Login Page before everything as requested
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onSuccess={() => {}}
          onOpenProfileBuilder={() => setIsProfileOpen(true)}
        />
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b13] text-[#f1f5f9] flex flex-row overflow-x-hidden">
      {/* Left Sidebar (Exact layout matching the video) */}
      <VisionSidebar
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSecurityAudit={() => setIsSecurityAuditOpen(true)}
      />

      {/* Main Workspace on the right */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Cognitive Status Bar (Distinctive CogniCSE matrix ribbon) */}
        <header className="bg-[#080e18] border-b border-[#1a273b] px-4 py-2 flex items-center justify-between text-xs shrink-0 select-none">
          <div className="flex items-center gap-3 overflow-x-auto py-0.5">
            <span className="flex items-center gap-1.5 font-bold text-white tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CogniCSE Matrix</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
              Track: <strong className="text-blue-300">{activeTrack === 'All Tracks' ? 'All Engineering Tracks' : activeTrack}</strong>
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
              ISLM Scaffolding: <strong className="text-indigo-300">Tier 1 Socratic</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
              <span>🛡️ Anti-Answer Shield Active</span>
            </span>
            <button
              onClick={() => setIsPretestOpen(true)}
              className="px-2.5 py-1 bg-[#111b2b] hover:bg-[#162235] text-slate-300 rounded-lg text-[11px] font-semibold border border-[#1e2f47] transition-colors cursor-pointer"
            >
              Entry Diagnostic
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-sm"
            >
              ISLM Profile
            </button>
          </div>
        </header>

        {currentWorkflow === 'CHATS' && <VisionSolveChat />}
        {currentWorkflow === 'MOCK_TEST' && <VisionMockTest />}
        {currentWorkflow === 'CODE_SANDBOX' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <CodeSandbox />
          </div>
        )}
        {currentWorkflow === 'CAD_LAB' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <CADLab />
          </div>
        )}
        {currentWorkflow === 'MEMORY_TREE' && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1">
            <VisionMemoryTree />
          </div>
        )}
        {currentWorkflow === 'LIBRARY_VAULT' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <VisionLibraryVault />
          </div>
        )}
        {currentWorkflow === 'AI_VIDEO' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <AIVideoPlayer />
          </div>
        )}
        {currentWorkflow === 'COMPARISON_STUDY' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <ComparisonView />
          </div>
        )}
        {currentWorkflow === 'STUDENT_DASHBOARD' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <StudentDashboard />
          </div>
        )}
        {currentWorkflow === 'TEACHER_DASHBOARD' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <TeacherDashboard />
          </div>
        )}
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <SecurityAuditModal
        isOpen={isSecurityAuditOpen}
        onClose={() => setIsSecurityAuditOpen(false)}
      />
      <DiagnosticPretestModal
        isOpen={isPretestOpen}
        onClose={() => setIsPretestOpen(false)}
      />
      <WhyThisScoreDrawer
        node={activeDrawerNode}
        isOpen={isWhyDrawerOpen}
        onClose={closeWhyScoreDrawer}
        onOpenSandbox={node => {
          setSelectedNode(node);
          setCurrentWorkflow('CODE_SANDBOX');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <TutorProvider>
      <MainApplication />
    </TutorProvider>
  );
}
