import React, { useState } from 'react';
import { useTutor } from '../../context/TutorContext';
import {
  Sparkles,
  GitBranch,
  RefreshCw,
  HelpCircle,
  Eye,
  Terminal,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Layers,
  Calculator,
} from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  mastery: number;
  x: number;
  y: number;
  parentId?: string;
  childrenCount?: number;
}

export const VisionMemoryTree: React.FC = () => {
  const { userProfile, setCurrentWorkflow, setSelectedNode, dkmNodes, openWhyScoreDrawer } = useTutor();

  const [aiPrompt, setAiPrompt] = useState('');
  const [hideBranches, setHideBranches] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<TreeNode | null>(null);

  // Nodes mapped to the visual canvas matching the video
  const [nodes, setNodes] = useState<TreeNode[]>([
    {
      id: 'center',
      name: userProfile.name,
      status: 'GREEN',
      mastery: 0.85,
      x: 50,
      y: 50,
      childrenCount: 4,
    },
    {
      id: 'cs',
      name: 'Computer Science',
      status: 'GREEN',
      mastery: 0.88,
      x: 25,
      y: 40,
      parentId: 'center',
    },
    {
      id: 'physics',
      name: 'Physics',
      status: 'YELLOW',
      mastery: 0.65,
      x: 25,
      y: 65,
      parentId: 'center',
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      status: 'YELLOW',
      mastery: 0.58,
      x: 75,
      y: 40,
      parentId: 'center',
    },
    {
      id: 'math',
      name: 'Math',
      status: 'GREEN',
      mastery: 0.92,
      x: 75,
      y: 65,
      parentId: 'center',
    },
    // Sub-branches
    {
      id: 'cs_dsa',
      name: 'Data Structures & Algorithms',
      status: 'GREEN',
      mastery: 0.90,
      x: 10,
      y: 30,
      parentId: 'cs',
    },
    {
      id: 'cs_web',
      name: 'Web Architecture & PDO',
      status: 'RED',
      mastery: 0.35,
      x: 10,
      y: 50,
      parentId: 'cs',
    },
    {
      id: 'math_boolean',
      name: 'Boolean Algebra',
      status: 'GREEN',
      mastery: 0.82,
      x: 90,
      y: 65,
      parentId: 'math',
    },
  ]);

  const handleAskAiModify = () => {
    if (!aiPrompt.trim()) return;
    // Add a new node based on prompt
    const newNode: TreeNode = {
      id: `node_${Date.now()}`,
      name: aiPrompt.slice(0, 24),
      status: 'YELLOW',
      mastery: 0.5,
      x: 50 + (Math.random() * 30 - 15),
      y: 20 + Math.random() * 20,
      parentId: 'center',
    };
    setNodes(prev => [...prev, newNode]);
    setAiPrompt('');
  };

  const handleReLayout = () => {
    setNodes(prev =>
      prev.map(n => ({
        ...n,
        x: n.id === 'center' ? 50 : Math.max(10, Math.min(90, n.x + (Math.random() * 6 - 3))),
        y: n.id === 'center' ? 50 : Math.max(15, Math.min(85, n.y + (Math.random() * 6 - 3))),
      }))
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] rounded-2xl overflow-hidden border border-[#1a273b] shadow-2xl flex flex-col justify-between dot-grid-bg select-none">
      {/* Top Floating Controls */}
      <div className="p-4 flex items-center justify-between z-10 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#0c1421]/90 backdrop-blur border border-[#1a273b] rounded-xl flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white">Visual Memory Tree</span>
          </div>
          <span className="text-[10px] bg-blue-950/80 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-full font-mono">
            {nodes.length} Cognitive Nodes
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#0c1421]/90 backdrop-blur border border-[#1a273b] p-1 rounded-xl">
          <button
            onClick={handleReLayout}
            className="px-3 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-[#111b2b] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Layout</span>
          </button>
          <button
            onClick={() => setCurrentWorkflow('MOCK_TEST')}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Progress Tree</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {nodes.map(node => {
          if (!node.parentId) return null;
          const parent = nodes.find(n => n.id === node.parentId);
          if (!parent) return null;
          if (hideBranches && parent.id === 'center') return null;

          return (
            <line
              key={`${parent.id}-${node.id}`}
              x1={`${parent.x}%`}
              y1={`${parent.y}%`}
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Interactive Node Badges on Canvas */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map(node => {
          const isCenter = node.id === 'center';
          if (hideBranches && node.parentId === 'center') return null;

          return (
            <div
              key={node.id}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => setSelectedNodeDetails(node)}
              className={`absolute pointer-events-auto cursor-pointer transition-transform hover:scale-105 ${
                isCenter
                  ? 'z-20'
                  : 'z-10'
              }`}
            >
              {isCenter ? (
                /* Central Student Node (Matching Video!) */
                <div className="px-5 py-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/40 border-2 border-blue-400 flex flex-col items-center gap-1 text-center min-w-[170px]">
                  <div className="font-bold text-xs uppercase tracking-wide">{node.name}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHideBranches(!hideBranches);
                    }}
                    className="mt-1 px-2.5 py-0.5 rounded-full bg-blue-800 text-[10px] font-semibold hover:bg-blue-900 transition-colors cursor-pointer"
                  >
                    {hideBranches ? 'Show 4' : 'Hide 4'}
                  </button>
                </div>
              ) : (
                /* Branch Subject Node (Matching Video Pill Style) */
                <div
                  className={`px-4 py-2 rounded-2xl border flex items-center gap-2 shadow-lg backdrop-blur text-xs font-semibold whitespace-nowrap transition-all ${
                    node.status === 'GREEN'
                      ? 'bg-[#0c1421] border-emerald-500/60 text-emerald-200'
                      : node.status === 'YELLOW'
                      ? 'bg-[#0c1421] border-amber-500/60 text-amber-200'
                      : 'bg-[#0c1421] border-rose-500/60 text-rose-200 ring-1 ring-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      node.status === 'GREEN'
                        ? 'bg-emerald-400'
                        : node.status === 'YELLOW'
                        ? 'bg-amber-400'
                        : 'bg-rose-400 animate-pulse'
                    }`}
                  />
                  <span>{node.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNodeDetails && selectedNodeDetails.id !== 'center' && (
        <div className="absolute top-16 right-4 w-72 bg-[#0c1421] border border-[#1a273b] rounded-2xl p-4 shadow-2xl z-30 space-y-3 pointer-events-auto animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#1a273b]">
            <h4 className="text-xs font-bold text-white">{selectedNodeDetails.name}</h4>
            <button
              onClick={() => setSelectedNodeDetails(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-slate-300">
            Mastery: <strong className="text-blue-400">{(selectedNodeDetails.mastery * 100).toFixed(0)}%</strong>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                const match = dkmNodes.find(n => n.name.toLowerCase().includes(selectedNodeDetails.name.toLowerCase())) || dkmNodes[0];
                setSelectedNode(match);
                setCurrentWorkflow('CODE_SANDBOX');
              }}
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Code Drill
            </button>
            <button
              onClick={() => setCurrentWorkflow('AI_VIDEO')}
              className="flex-1 py-1.5 bg-[#111b2b] hover:bg-[#162235] text-slate-300 rounded-lg text-xs font-medium border border-[#1e2f47] cursor-pointer"
            >
              60s Video
            </button>
          </div>
          <button
            onClick={() => {
              const match = dkmNodes.find(n => n.name.toLowerCase().includes(selectedNodeDetails.name.toLowerCase())) || dkmNodes[0];
              openWhyScoreDrawer(match);
            }}
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-900/60 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Why this score?</span>
          </button>
        </div>
      )}

      {/* Bottom Floating Bar: "Ask AI to modify nodes" (From Video!) */}
      <div className="p-4 z-10 flex justify-center pointer-events-auto">
        <div className="w-full max-w-lg bg-[#0c1421]/95 backdrop-blur-md border border-[#1a273b] rounded-2xl p-1.5 flex items-center gap-2 shadow-2xl">
          <input
            type="text"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAskAiModify()}
            placeholder="Ask AI to modify nodes..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={handleAskAiModify}
            disabled={!aiPrompt.trim()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <span>Update</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
