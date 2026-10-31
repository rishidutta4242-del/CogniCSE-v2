export type IssueType = 'CONCEPTUAL_GAP' | 'MISCONCEPTION' | 'PRACTICAL_EXECUTION_ERROR';

export type NodeStatus = 'GREEN' | 'YELLOW' | 'RED';

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
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
  relatedTopicId?: string;
  associatedQuestions?: MockTestQuestion[];
}

export interface DKMNode {
  id: string;
  name: string;
  track: 'Data Structures & Algorithms' | 'Web Application Development' | 'Operating Systems' | 'Computer Networks';
  category: string;
  description: string;
  keyConcept: string;
  typicalTrap: string;
  starterCodeSnippet: string;
  codeLanguage: SupportedLanguage;
  starterErrorLog: string;
  prerequisites: string[];
  status: NodeStatus;
  mastery: number; // 0.0 to 1.0
  errorCount: number;
  solvedCount: number;
}

export interface ISLMProfile {
  student_id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  course_track: string;
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
