export type IssueType =
  | 'CONCEPTUAL_GAP'
  | 'MISCONCEPTION'
  | 'PRACTICAL_EXECUTION_ERROR'
  | 'cad_constraint_error'
  | 'cad_tolerance_mismatch';

export type Domain = 'cse' | 'mech';

export type NodeStatus = 'GREEN' | 'YELLOW' | 'RED' | 'NOT_ASSESSED';

export type VisualizerMode =
  | 'Text Response'
  | 'Mind Map'
  | 'Flowchart'
  | 'Simulator'
  | 'Charts & Graphs'
  | 'Diagrams'
  | 'Timeline'
  | 'Creative';

export type SupportedLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'c'
  | 'php'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'swift'
  | 'sql'
  | 'html';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  plan: 'Free Plan' | 'Pro Student' | 'Campus License';
  avatar?: string;
  degree?: string;
  university?: string;
  targetMajor?: string;
  preferredLanguages: SupportedLanguage[];
  targetExams: string[];
  streakDays: number;
  testsCompleted: number;
  overallMastery: number;
  theme: 'dark' | 'light';
  domain?: Domain;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  visualizerMode?: VisualizerMode;
  thinkingSteps?: string[];
  socraticTier?: number;
  codeSnippet?: string;
  refusalReason?: string;
  source?: 'gemini' | 'fallback';
  fallback_reason?: string | null;
}

export interface PedagogicalEvent {
  id: string;
  ts: string;
  studentId: string;
  type: string;
  conceptId: string;
  topicId: string;
  payload: Record<string, any>;
  synthetic: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
  relatedTopicId?: string;
  associatedQuestions?: MockTestQuestion[];
}

export type EvidenceLabel =
  | 'Insufficient Evidence'
  | 'Possible Difficulty'
  | 'Likely Misconception'
  | 'Confirmed through Repeated Evidence';

export type MasteryStatus = 'Mastered' | 'Near Mastery' | 'Improving' | 'Developing' | 'Needs Attention' | 'Not Assessed';

export interface BKTTrace {
  id: string;
  conceptId: string;
  prior: number;
  observed: boolean;
  posterior: number;
  pLObserved?: number;
  isCorrect: boolean;
  isIndependent: boolean;
  source: string;
  timestamp: string;
  errorCategory?: string;
  tierUsed?: number;
}

export interface CompositeMasteryBreakdown {
  composite: number; // 0-100 scale (rounded integer)
  conceptual: number; // 0-100 scale
  practical: number; // 0-100 scale
  independent: number; // 0-100 scale
  retention: number | null; // 0-100 scale or null if none exists yet
  weights: {
    conceptual: number;
    practical: number;
    independent: number;
    retention: number;
  };
  status: MasteryStatus;
  independentPassedCount: number;
}

export interface ObservationInput {
  conceptId: string;
  isCorrect: boolean;
  isIndependent: boolean;
  source: 'quiz' | 'pretest' | 'sandbox' | 'mock-test' | 'micro-drill' | 'transfer-task' | 'recheck' | string;
  errorCategory?: string;
  tierUsed?: number; // 1 (100), 2 (85), 3 (70), 4 (50)
  score?: number; // 0-100 override if applicable
}

export type DKMTrack =
  | 'Data Structures & Algorithms'
  | 'Web Application Development'
  | 'Operating Systems'
  | 'Computer Networks'
  | 'Mechanical Engineering (CAD)';

export interface DKMNode {
  id: string;
  name: string;
  track: DKMTrack;
  domain?: Domain;
  category: string;
  description: string;
  keyConcept: string;
  typicalTrap: string;
  starterCodeSnippet: string;
  codeLanguage: SupportedLanguage;
  starterErrorLog: string;
  prerequisites: string[];
  status: NodeStatus;
  mastery: number; // 0.0 to 1.0 (pL)
  errorCount: number;
  solvedCount: number;
  bktTrace?: BKTTrace[];
  evidenceLabel?: EvidenceLabel;
  compositeMastery?: CompositeMasteryBreakdown;
  diagnosticQuestions?: MockTestQuestion[];
}

export interface ISLMProfile {
  student_id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  course_track: string;
  domain?: Domain;
  overall_mastery: number; // 0.0 to 1.0
  topic_mastery: Record<string, number>;
  recent_misconceptions: string[];
  scaffolding_tier_required: number; // 1 to 4
  error_count: number;
  independent_solves: number;
  scaffolding_fading_index: number; // 0.0 to 1.0
  time_spent_mins: number;
  history: LearningHistoryEntry[];
}

export interface LearningHistoryEntry {
  id: string;
  timestamp: string;
  topic_id: string;
  topic_name: string;
  tier_used: number;
  issue_type: IssueType;
  resolved_independently: boolean;
  notes?: string;
}

export interface TutoringResponse {
  workflow: string;
  diagnosis: {
    issue_type: IssueType;
    identified_gap: string;
    confidence_score: number;
  };
  scaffolding_response: {
    current_tier: number;
    refusal_reason: string;
    tutor_message: string;
    socratic_question: string;
  };
  visualizer_data: {
    mode: VisualizerMode;
    structure?: {
      nodes: Array<{ id: string; label: string; details?: string; type?: string }>;
      edges: Array<{ from: string; to: string; label?: string }>;
    };
  };
  islm_updates: {
    updated_topic_mastery: Record<string, number>;
    memory_tree_node_status: {
      node_id: string;
      node_name: string;
      status: NodeStatus;
    };
    increment_error_count: boolean;
    next_scaffolding_tier: number;
  };
  content_hooks: {
    trigger_ai_video: boolean;
    video_script_storyboard?: VideoStoryboard;
    flag_for_mock_test: boolean;
  };
  research_telemetry: {
    scaffolding_fading_index: number;
    estimated_time_to_resolution_mins: number;
    error_recurrence_drop: string;
  };
  source?: 'gemini' | 'fallback';
  fallback_reason?: string | null;
}

export interface VideoScene {
  time: string;
  visual: string;
  narration: string;
  animation_type?: 'comparison' | 'flowchart' | 'memory_diagram' | 'network_packet' | 'code_diff';
}

export interface VideoStoryboard {
  title: string;
  duration_secs: number;
  scenes: VideoScene[];
  concept?: string;
  key_takeaway?: string;
}

export interface MockTestQuestion {
  id: string;
  section: string;
  topic_id: string;
  topic_name: string;
  question: string;
  options: string[];
  correct_option_index: number;
  user_selected_index?: number;
  explanation: string;
  distractor_explanations: string[];
  time_spent_secs?: number;
}

export interface MockTestSection {
  id: string;
  title: string;
  question_ids: string[];
  answered_count: number;
}

export interface MockTestResult {
  test_id: string;
  title: string;
  subject: string;
  total_marks: number;
  score: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  unattempted_count: number;
  accuracy: number;
  total_time_secs: number;
  average_time_per_question_secs: number;
  questions: MockTestQuestion[];
  sections: Array<{
    name: string;
    score: number;
    max_score: number;
    correct: number;
    wrong: number;
    accuracy: number;
    time_secs: number;
  }>;
}

export interface MockTest {
  test_id: string;
  title: string;
  subject: string;
  time_limit_mins: number;
  total_questions: number;
  negative_marking_rate: number;
  sections: MockTestSection[];
  questions: MockTestQuestion[];
}

export interface LibraryDocument {
  id: string;
  title: string;
  category: string;
  uploadedBy: string;
  dateAdded: string;
  pages: number;
  tags: string[];
  content: string;
  pdfUrl?: string;
}

export type AttemptKind = 'quiz' | 'code_lab' | 'cad_lab' | 'web_lab' | 'independent';

export interface AttemptRecord {
  id: string;
  studentId: string;
  conceptId: string;
  kind: AttemptKind;
  passed: boolean;
  tierUsed: number;
  hintsRequested: number;
  durationSec: number;
  errorCategory?: string;
  repeatedError: boolean;
  ts: string;
  codeSnippet?: string;
  language?: string;
  details?: string;
}

export interface VariantTask {
  id: string;
  conceptId: string;
  conceptName: string;
  title: string;
  prompt: string;
  description: string;
  code: string;
  language: SupportedLanguage;
  errorLog?: string;
  starterCode?: string;
  hiddenTests?: Array<{
    input: any[];
    expected: any;
    description: string;
  }>;
}

export interface EvaluationOutcome {
  attempt: AttemptRecord;
  priorPL: number;
  posteriorPL: number;
  deltaPL: number;
  passed: boolean;
  tierUsed: number;
  repeatedError: boolean;
  nextTier: number;
  isTransferUnlocked: boolean;
  message: string;
  label?: string;
  consoleOutput?: string;
}

