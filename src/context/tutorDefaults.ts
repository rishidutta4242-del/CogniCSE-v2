import { UserProfile, ChatSession, DKMNode, ISLMProfile } from '../types';

export const STORAGE_KEY_ACTIVE_USER = 'cognicse_active_user_id';
export const STORAGE_KEY_UI_THEME = 'cognicse_ui_theme';

export const INITIAL_PROFILE: UserProfile = {
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
  theme: 'dark',
};

export const DEFAULT_CHAT_SESSION: ChatSession = {
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
      text: 'Hello! I am your CogniCSE Technical Tutor. How can I help you master Computer Science & Engineering today?',
      timestamp: '10:00 AM',
      source: 'gemini',
      fallback_reason: null,
    },
  ],
};

export function exportOfflinePackFile(userProfile: UserProfile, islm: ISLMProfile, dkmNodes: DKMNode[]) {
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
      pL: n.mastery,
      evidenceLabel: n.evidenceLabel,
      compositeMastery: n.compositeMastery,
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
}
