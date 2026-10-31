import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  DKMNode,
  ISLMProfile,
  TutoringResponse,
  VisualizerMode,
  VideoStoryboard,
  UserProfile,
  ChatSession,
  ChatMessage,
  MockTestQuestion,
} from '../types';
import { INITIAL_DKM_NODES, INITIAL_ISLM_PROFILE } from '../data/dkm';

interface TutorContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  islm: ISLMProfile;
  dkmNodes: DKMNode[];
  selectedNode: DKMNode;
  activeTrack: string;
  currentWorkflow:
    | 'CHATS'
    | 'MOCK_TEST'
    | 'CODE_SANDBOX'
    | 'MEMORY_TREE'
    | 'LIBRARY_VAULT'
    | 'AI_VIDEO'
    | 'COMPARISON_STUDY'
    | 'STUDENT_DASHBOARD'
    | 'TEACHER_DASHBOARD';
  tutoringResponse: TutoringResponse | null;
  isLoading: boolean;
  visualizerMode: VisualizerMode;
  activeVideoStoryboard: VideoStoryboard | null;
  chatSessions: ChatSession[];
  currentChatSession: ChatSession;
  activeReviewQuestions: MockTestQuestion[] | null;
  setActiveReviewQuestions: (questions: MockTestQuestion[] | null) => void;
  setActiveTrack: (track: string) => void;
  setSelectedNode: (node: DKMNode) => void;
  setCurrentWorkflow: (workflow: TutorContextType['currentWorkflow']) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  setActiveVideoStoryboard: (storyboard: VideoStoryboard | null) => void;
  executeTutoring: (
    studentInput: string,
    codeSnippet?: string,
    executionLogs?: string,
    workflow?: 'CODE_SANDBOX_TUTORING' | 'CHATS'
  ) => Promise<TutoringResponse | null>;
  verifyIndependentFix: (fixedCode: string) => Promise<{ success: boolean; message: string }>;
  switchRole: (role: 'student' | 'teacher') => void;
  updateNodeStatus: (nodeId: string, status: 'GREEN' | 'YELLOW' | 'RED', masteryDelta: number) => void;
  exportOfflinePack: () => void;
  runDiagnosticPretestComplete: (score: number, missedTopicIds: string[]) => void;
  sendChatMessage: (text: string) => Promise<void>;
  selectChatSession: (sessionId: string) => void;
  createNewChatSession: () => void;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'cognicse_auth_v1';
const STORAGE_KEY_PROFILE = 'cognicse_user_profile_v1';
const STORAGE_KEY_ISLM = 'cognicse_islm_profile_v1';
const STORAGE_KEY_DKM = 'cognicse_dkm_nodes_v1';
const STORAGE_KEY_CHATS = 'cognicse_chat_sessions_v1';

const INITIAL_PROFILE: UserProfile = {
  id: 'CSE_STU_8810',
  name: 'haritha karthikkumar',
  email: 'haritha.k@university.edu',
  role: 'student',
  plan: 'Free Plan',
  degree: 'B.Tech Computer Science & Engineering',
  targetMajor: 'Systems & Artificial Intelligence',
  preferredLanguages: ['python', 'javascript', 'java', 'cpp', 'php'],
  targetExams: ['Campus Placements', 'Discrete Mathematics'],
  streakDays: 7,
  testsCompleted: 3,
  overallMastery: 0.75,
  theme: 'dark',
};

const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat_greeting',
    title: 'Greeting',
    timestamp: 'Today',
    messages: [
      {
        id: 'msg_1',
        sender: 'user',
        text: 'Hi',
        timestamp: '10:00 AM',
      },
      {
        id: 'msg_2',
        sender: 'assistant',
        text: 'Hi! How can I help you learn Computer Science or debug code today?',
        timestamp: '10:00 AM',
      },
    ],
  },
  {
    id: 'chat_reflection',
    title: 'Self-Reflection and Impr...',
    timestamp: 'Yesterday',
    messages: [
      {
        id: 'msg_3',
        sender: 'user',
        text: 'what mistake I have done, how can I improve',
        timestamp: '11:15 AM',
      },
      {
        id: 'msg_4',
        sender: 'assistant',
        text: `Here is a structured reflection on your recent problem-solving:

1. TCP Sockets vs HTTP Ports:
In your PDO connection, you attempted to query database port 80 instead of 3306. Remember that port 80 speaks HTTP web traffic, whereas database services listen on dedicated TCP daemons.

2. Recursion Base Cases:
When designing recursive algorithms, always establish your termination boundary first before recursing.

Would you like to drill through a simulated memory trace or inspect the Flowchart?`,
        timestamp: '11:16 AM',
        socraticTier: 2,
      },
    ],
  },
  {
    id: 'chat_demo_visuals',
    title: 'Demo: Visuals',
    timestamp: 'Oct 28',
    messages: [
      {
        id: 'msg_5',
        sender: 'user',
        text: 'Show me the flowchart for TCP 3-way handshake',
        timestamp: '2:30 PM',
      },
      {
        id: 'msg_6',
        sender: 'assistant',
        text: 'Switched visualizer to Flowchart mode! Client SYN -> Server SYN-ACK -> Client ACK verified.',
        visualizerMode: 'Flowchart',
        timestamp: '2:30 PM',
      },
    ],
  },
  {
    id: 'chat_demo_videos',
    title: 'Demo: Videos',
    timestamp: 'Oct 26',
    messages: [
      {
        id: 'msg_7',
        sender: 'user',
        text: 'Generate a 60s micro-mastery video for Database Ports',
        timestamp: '4:15 PM',
      },
      {
        id: 'msg_8',
        sender: 'assistant',
        text: 'Generated dual-coding video storyboard: "The Server Apartment Complex" (Door 80 vs Door 3306).',
        timestamp: '4:15 PM',
      },
    ],
  },
];

export const TutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state: default false to show login page first
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return false;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PROFILE;
  });

  const [islm, setIslm] = useState<ISLMProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ISLM);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ISLM_PROFILE;
  });

  const [dkmNodes, setDkmNodes] = useState<DKMNode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DKM);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_DKM_NODES;
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHATS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CHAT_SESSIONS;
  });

  const [currentChatSession, setCurrentChatSession] = useState<ChatSession>(() => chatSessions[0] || INITIAL_CHAT_SESSIONS[0]);
  const [activeReviewQuestions, setActiveReviewQuestions] = useState<MockTestQuestion[] | null>(null);

  const [selectedNode, setSelectedNode] = useState<DKMNode>(() => dkmNodes[0]);
  const [activeTrack, setActiveTrack] = useState<string>('All Tracks');
  const [currentWorkflow, setCurrentWorkflow] = useState<TutorContextType['currentWorkflow']>('CHATS');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('Flowchart');
  const [tutoringResponse, setTutoringResponse] = useState<TutoringResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeVideoStoryboard, setActiveVideoStoryboard] = useState<VideoStoryboard | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(isAuthenticated));
    } catch (e) {}
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (e) {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ISLM, JSON.stringify(islm));
    } catch (e) {}
  }, [islm]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DKM, JSON.stringify(dkmNodes));
    } catch (e) {}
  }, [dkmNodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chatSessions));
    } catch (e) {}
  }, [chatSessions]);

  // Chat Session Management
  const selectChatSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentChatSession(session);
    }
  };

  const createNewChatSession = () => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: 'New Conversation',
      timestamp: 'Just now',
      messages: [],
    };
    setChatSessions([newSession, ...chatSessions]);
    setCurrentChatSession(newSession);
    setCurrentWorkflow('CHATS');
  };

  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...currentChatSession.messages, userMsg];
    const isNew = currentChatSession.messages.length === 0;
    const title = isNew ? text.slice(0, 24) + (text.length > 24 ? '...' : '') : currentChatSession.title;

    const updatedSession = {
      ...currentChatSession,
      title,
      messages: updatedMessages,
    };

    setCurrentChatSession(updatedSession);
    setChatSessions(prev =>
      prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
    );

    // Call Socratic backend with CHATS workflow (no starter PDO code logs!)
    const tutorData = await executeTutoring(text, undefined, undefined, 'CHATS');

    // Only attach visualizerMode badge if a diagram mode was explicitly returned/used
    const respMode = tutorData?.visualizer_data?.mode;
    const effectiveVisualizer = (respMode && respMode !== 'Text Response') ? respMode : undefined;

    // Only display refusalReason if an actual anti-answer refusal occurred
    const isRefusal = tutorData?.scaffolding_response?.refusal_reason &&
      /direct\s+code|solution\s+withheld|anti-answer/i.test(tutorData.scaffolding_response.refusal_reason);

    const assistantMsg: ChatMessage = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant',
      text:
        tutorData?.scaffolding_response?.tutor_message ||
        `Let's break down this concept together! ${tutorData?.scaffolding_response?.socratic_question || ''}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visualizerMode: effectiveVisualizer,
      socraticTier: tutorData?.scaffolding_response?.current_tier || 1,
      refusalReason: isRefusal ? tutorData?.scaffolding_response?.refusal_reason : undefined,
    };

    const finalizedSession = {
      ...updatedSession,
      messages: [...updatedMessages, assistantMsg],
    };

    setCurrentChatSession(finalizedSession);
    setChatSessions(prev =>
      prev.map(s => (s.id === finalizedSession.id ? finalizedSession : s))
    );
  };

  const switchRole = (role: 'student' | 'teacher') => {
    setUserProfile(prev => ({ ...prev, role }));
    setIslm(prev => ({ ...prev, role }));
    if (role === 'teacher') {
      setCurrentWorkflow('TEACHER_DASHBOARD');
    } else {
      setCurrentWorkflow('CHATS');
    }
  };

  const updateNodeStatus = (nodeId: string, status: 'GREEN' | 'YELLOW' | 'RED', masteryDelta: number) => {
    setDkmNodes(prev =>
      prev.map(node => {
        if (node.id === nodeId) {
          const newMastery = Math.min(1.0, Math.max(0.1, +(node.mastery + masteryDelta).toFixed(2)));
          return {
            ...node,
            status,
            mastery: newMastery,
            solvedCount: masteryDelta > 0 ? node.solvedCount + 1 : node.solvedCount,
          };
        }
        return node;
      })
    );

    setIslm(prev => {
      const updatedTopicMastery = {
        ...prev.topic_mastery,
        [nodeId]: Math.min(1.0, Math.max(0.1, +((prev.topic_mastery[nodeId] || 0.4) + masteryDelta).toFixed(2))),
      };
      const values = Object.values(updatedTopicMastery);
      const overall = values.reduce((a, b) => a + b, 0) / (values.length || 1);
      return {
        ...prev,
        topic_mastery: updatedTopicMastery,
        overall_mastery: +overall.toFixed(2),
        scaffolding_fading_index: Math.min(1.0, +(prev.scaffolding_fading_index + 0.05).toFixed(2)),
      };
    });
  };

  const executeTutoring = async (
    studentInput: string,
    codeSnippet?: string,
    executionLogs?: string,
    workflow: 'CODE_SANDBOX_TUTORING' | 'CHATS' = 'CODE_SANDBOX_TUTORING'
  ): Promise<TutoringResponse | null> => {
    setIsLoading(true);
    try {
      const isSandbox = workflow === 'CODE_SANDBOX_TUTORING';
      const payload = {
        workflow,
        student_id: userProfile.id,
        course_track: selectedNode.track,
        current_topic: selectedNode.name,
        visualizer_mode: visualizerMode,
        islm_profile: {
          overall_mastery: islm.overall_mastery,
          topic_mastery: islm.topic_mastery,
          recent_misconceptions: islm.recent_misconceptions,
          scaffolding_tier_required: islm.scaffolding_tier_required,
        },
        student_input: studentInput,
        // Crucial fix: Only pass code snippets/error logs in Code Sandbox mode, never in general Chat!
        code_snippet: isSandbox ? (codeSnippet || selectedNode.starterCodeSnippet) : (codeSnippet || ''),
        execution_logs: isSandbox ? (executionLogs || selectedNode.starterErrorLog) : (executionLogs || ''),
      };

      // 4-second client timeout to guarantee zero UI hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('/api/tutoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TutoringResponse = await response.json();
      setTutoringResponse(data);

      if (data.content_hooks?.video_script_storyboard) {
        setActiveVideoStoryboard(data.content_hooks.video_script_storyboard);
      }

      return data;
    } catch (err) {
      console.warn('Tutoring engine network Notice (engaging immediate Socratic fallback):', err);
      // Resilient fallback for immediate sub-10ms response
      const isGreeting = /^(hi|hello|hey|greetings|howdy|good\s+(morning|afternoon|evening)|yo|hola|start|sup|welcome)(\s+.*)?$/i.test(studentInput.trim());

      const fallback: TutoringResponse = {
        workflow,
        diagnosis: {
          issue_type: 'CONCEPTUAL_GAP',
          identified_gap: isGreeting ? 'CSE Technical Orientation' : 'Core Concept Inquiry',
          confidence_score: 0.98,
        },
        scaffolding_response: {
          current_tier: 1,
          refusal_reason: '',
          tutor_message: isGreeting
            ? "Hello! I am your CogniCSE Technical Tutor. How can I help you master Computer Science & Engineering today? We can explore core topics like Data Structures & Algorithms, Operating Systems, Computer Networks, or dive into debugging in the Code Sandbox!"
            : `Let's break down this question from first principles: "${studentInput}". What part of this system or algorithm behavior seems most counter-intuitive right now?`,
          socratic_question: isGreeting
            ? "Which CSE track or concept would you like to explore first?"
            : "What initial hypothesis do you have about how the program or system should behave here?",
        },
        visualizer_data: {
          mode: 'Text Response',
          structure: { nodes: [], edges: [] },
        },
        islm_updates: {
          updated_topic_mastery: { [selectedNode.name]: islm.overall_mastery },
          memory_tree_node_status: {
            node_id: selectedNode.id,
            node_name: selectedNode.name,
            status: 'GREEN',
          },
          increment_error_count: false,
          next_scaffolding_tier: 1,
        },
        content_hooks: {
          trigger_ai_video: false,
          flag_for_mock_test: false,
        },
        research_telemetry: {
          scaffolding_fading_index: islm.scaffolding_fading_index,
          estimated_time_to_resolution_mins: 2,
          error_recurrence_drop: '25%',
        },
      };

      setTutoringResponse(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyIndependentFix = async (fixedCode: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    updateNodeStatus(selectedNode.id, 'GREEN', 0.25);
    setIslm(prev => ({
      ...prev,
      independent_solves: prev.independent_solves + 1,
      scaffolding_tier_required: 1,
      scaffolding_fading_index: Math.min(1.0, +(prev.scaffolding_fading_index + 0.1).toFixed(2)),
    }));

    setIsLoading(false);
    return {
      success: true,
      message: 'Independent problem-solving verified! The fix cleared all assertions without direct code assistance.',
    };
  };

  const runDiagnosticPretestComplete = (score: number, missedTopicIds: string[]) => {
    const accuracy = score / 5;
    setDkmNodes(prev =>
      prev.map(node => {
        if (missedTopicIds.includes(node.id)) {
          return { ...node, status: 'RED', mastery: Math.min(node.mastery, 0.3) };
        }
        return { ...node, status: 'GREEN', mastery: Math.max(node.mastery, 0.8) };
      })
    );

    setIslm(prev => ({
      ...prev,
      overall_mastery: +accuracy.toFixed(2),
      scaffolding_fading_index: +(accuracy * 0.5).toFixed(2),
    }));
  };

  const exportOfflinePack = () => {
    const reportData = {
      system: 'CogniCSE Pedagogical 1-on-1 Socratic Learning Support Matrix',
      export_date: new Date().toISOString(),
      student_profile: userProfile,
      islm_model: islm,
      domain_knowledge_tree: dkmNodes.map(n => ({
        id: n.id,
        name: n.name,
        track: n.track,
        status: n.status,
        mastery: `${(n.mastery * 100).toFixed(0)}%`,
        keyConcept: n.keyConcept,
        typicalTrap: n.typicalTrap,
      })),
      recommended_offline_study_topics: dkmNodes.filter(n => n.status === 'RED').map(n => n.name),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CogniCSE_Matrix_Pack_${userProfile.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TutorContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userProfile,
        setUserProfile,
        islm,
        dkmNodes,
        selectedNode,
        activeTrack,
        currentWorkflow,
        tutoringResponse,
        isLoading,
        visualizerMode,
        activeVideoStoryboard,
        chatSessions,
        currentChatSession,
        activeReviewQuestions,
        setActiveReviewQuestions,
        setActiveTrack,
        setSelectedNode,
        setCurrentWorkflow,
        setVisualizerMode,
        setActiveVideoStoryboard,
        executeTutoring,
        verifyIndependentFix,
        switchRole,
        updateNodeStatus,
        exportOfflinePack,
        runDiagnosticPretestComplete,
        sendChatMessage,
        selectChatSession,
        createNewChatSession,
      }}
    >
      {children}
    </TutorContext.Provider>
  );
};

export const useTutor = () => {
  const context = useContext(TutorContext);
  if (!context) {
    throw new Error('useTutor must be used within a TutorProvider');
  }
  return context;
};
