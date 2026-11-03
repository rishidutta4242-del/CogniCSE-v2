import { GoogleGenAI, Type } from '@google/genai';
import {
  getTutoringFallback,
  getVideoFallback,
  getMockTestFallback,
  getLibraryVaultFallback,
} from './fallbacks.ts';

const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY' && geminiApiKey.trim().length > 10) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 25-second server-side timeout with single retry on failure
async function callGeminiWithRetry<T>(
  prompt: string,
  systemInstruction?: string,
  responseSchema?: any,
  timeoutMs = 25000
): Promise<{ data: T | null; error: string | null }> {
  if (!aiClient) {
    return { data: null, error: 'GEMINI_API_KEY is not configured or invalid' };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  const singleAttempt = async (): Promise<T> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await aiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          responseMimeType: 'application/json',
          ...(responseSchema ? { responseSchema } : {}),
          abortSignal: controller.signal,
        },
      });
      clearTimeout(timer);

      const text = response.text;
      if (!text) {
        throw new Error('Empty text received from Gemini API');
      }

      return JSON.parse(text.trim()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      throw err;
    }
  };

  // Attempt 1
  try {
    const data = await singleAttempt();
    return { data, error: null };
  } catch (err1: any) {
    console.warn(`[Gemini Attempt 1 Failed]: ${err1?.message || err1}. Retrying once...`);
    // Attempt 2 (Retry once on failure)
    try {
      const data = await singleAttempt();
      return { data, error: null };
    } catch (err2: any) {
      console.warn(`[Gemini Attempt 2 Failed]: ${err2?.message || err2}. Engaging fallback.`);
      return { data: null, error: err2?.message || String(err2) };
    }
  }
}

// Schemas using Type from @google/genai
const TUTORING_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    workflow: { type: Type.STRING },
    diagnosis: {
      type: Type.OBJECT,
      properties: {
        issue_type: { type: Type.STRING },
        identified_gap: { type: Type.STRING },
        confidence_score: { type: Type.NUMBER },
      },
      required: ['issue_type', 'identified_gap', 'confidence_score'],
    },
    scaffolding_response: {
      type: Type.OBJECT,
      properties: {
        current_tier: { type: Type.INTEGER },
        refusal_reason: { type: Type.STRING },
        tutor_message: { type: Type.STRING },
        socratic_question: { type: Type.STRING },
      },
      required: ['current_tier', 'tutor_message', 'socratic_question'],
    },
    visualizer_data: {
      type: Type.OBJECT,
      properties: {
        mode: { type: Type.STRING },
      },
    },
    islm_updates: {
      type: Type.OBJECT,
      properties: {
        increment_error_count: { type: Type.BOOLEAN },
        next_scaffolding_tier: { type: Type.INTEGER },
      },
    },
    content_hooks: {
      type: Type.OBJECT,
      properties: {
        trigger_ai_video: { type: Type.BOOLEAN },
        flag_for_mock_test: { type: Type.BOOLEAN },
      },
    },
    research_telemetry: {
      type: Type.OBJECT,
      properties: {
        scaffolding_fading_index: { type: Type.NUMBER },
        estimated_time_to_resolution_mins: { type: Type.NUMBER },
        error_recurrence_drop: { type: Type.STRING },
      },
    },
  },
  required: ['diagnosis', 'scaffolding_response'],
};

const VIDEO_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    concept: { type: Type.STRING },
    duration_secs: { type: Type.INTEGER },
    key_takeaway: { type: Type.STRING },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scene_num: { type: Type.INTEGER },
          time_range: { type: Type.STRING },
          title: { type: Type.STRING },
          visual_description: { type: Type.STRING },
          narration: { type: Type.STRING },
          animation_type: { type: Type.STRING },
          visual_elements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['scene_num', 'time_range', 'title', 'narration'],
      },
    },
  },
  required: ['title', 'scenes', 'key_takeaway'],
};

const MOCK_TEST_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    test_id: { type: Type.STRING },
    title: { type: Type.STRING },
    time_limit_mins: { type: Type.INTEGER },
    total_questions: { type: Type.INTEGER },
    negative_marking_rate: { type: Type.NUMBER },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          topic_id: { type: Type.STRING },
          topic_name: { type: Type.STRING },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correct_option_index: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          distractor_explanations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['id', 'topic_name', 'question', 'options', 'correct_option_index', 'explanation'],
      },
    },
  },
  required: ['test_id', 'title', 'questions'],
};

const LIBRARY_PROCESS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    extracted_concepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          concept_id: { type: Type.STRING },
          name: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          prerequisites: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          frequent_misconception: { type: Type.STRING },
        },
        required: ['concept_id', 'name', 'difficulty', 'frequent_misconception'],
      },
    },
    recommended_socratic_drills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          drill_id: { type: Type.STRING },
          prompt: { type: Type.STRING },
          concept_mapped: { type: Type.STRING },
          socratic_tier: { type: Type.INTEGER },
        },
        required: ['drill_id', 'prompt', 'concept_mapped'],
      },
    },
    suggested_video_topics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['summary', 'extracted_concepts', 'recommended_socratic_drills'],
};

const SOCRATIC_SYSTEM_INSTRUCTION = `You are the central pedagogical AI engine for an Intelligent 1-on-1 Learning Support System tailored specifically for Computer Science & Engineering (CSE) students.
Your primary objective is to continuously diagnose student knowledge gaps, misconceptions, and practical execution errors, maintain a persistent Individual Student Learning Model (ISLM), enforce progressive Socratic scaffolding, and prove independent problem-solving improvement without directly giving away code or final answers.

You must NEVER simply output direct solutions, complete written code blocks, or full written assignments when a student is struggling. You operate strictly as a real-time, empathetic, and highly structured technical tutor using hints, diagnostic questions, code sandbox error mapping, and visual learning modes.

CRITICAL RULES:
1. 4-Tier Socratic Guardrails:
   - Tier 1 (Metacognitive Hint): Point out the general area or logic flaw without touching the syntax. Ask a reflective question.
   - Tier 2 (Conceptual Guidance): Explain the underlying concept briefly and provide a generic, non-identical code pattern.
   - Tier 3 (Socratic Micro-Drill): Provide a single-line diagnostic prompt or micro-quiz to isolate the missing piece.
   - Tier 4 (Direct Line Guidance - ONLY after 3+ failed attempts at Tier 3): Highlight the specific line or variable causing the issue and explain the mechanism, but force the student to write the actual fix themselves.
2. Anti-Answer Protocol:
   - If a student asks for the answer, complete code, or direct fix: REFUSE direct code. State: "I'm here to help you master this step-by-step so you can solve it independently! Let's break down where you're currently stuck." Then provide a Tier 1 or Tier 2 hint.
3. Diagnose issue_type into: CONCEPTUAL_GAP, MISCONCEPTION, or PRACTICAL_EXECUTION_ERROR.
4. Output valid JSON matching the exact schema specified.`;

export async function processTutoringRequest(tutorReq: any) {
  const isGreeting = /^(hi|hello|hey|greetings|howdy|good\s+(morning|afternoon|evening)|yo|hola|start|sup|welcome)(\s+.*)?$/i.test(
    (tutorReq.student_input || '').trim()
  );

  if (isGreeting) {
    const fallback = getTutoringFallback(tutorReq);
    return { ...fallback, source: 'gemini' as const, fallback_reason: null };
  }

  const prompt = `Input Context:
${JSON.stringify(tutorReq, null, 2)}

Diagnose student knowledge gaps and provide Socratic guidance adhering strictly to the Anti-Answer protocol.`;

  const { data, error } = await callGeminiWithRetry<any>(
    prompt,
    SOCRATIC_SYSTEM_INSTRUCTION,
    TUTORING_RESPONSE_SCHEMA,
    25000
  );

  if (data && data.scaffolding_response) {
    return { ...data, source: 'gemini' as const, fallback_reason: null };
  }

  const fallback = getTutoringFallback(tutorReq);
  return {
    ...fallback,
    source: 'fallback' as const,
    fallback_reason: error || 'Gemini model unavailable or response incomplete',
  };
}

export async function processVideoRequest(topic: string, misconception: string, track: string) {
  const prompt = `Generate a 60-second animated educational video storyboard script for Computer Science students explaining "${topic || 'CSE Concept'}" (${track || 'CSE'}) and debunking the misconception: "${misconception || 'Common misconception'}".`;

  const { data, error } = await callGeminiWithRetry<any>(
    prompt,
    'You are an award-winning CSE pedagogical content animator creating concise, visually rich 60-second micro-learning video storyboards.',
    VIDEO_RESPONSE_SCHEMA,
    25000
  );

  if (data && data.scenes) {
    return { ...data, source: 'gemini' as const, fallback_reason: null };
  }

  const fallback = getVideoFallback(topic, misconception);
  return {
    ...fallback,
    source: 'fallback' as const,
    fallback_reason: error || 'Gemini model unavailable',
  };
}

export async function processMockTestRequest(track: string, redNodes: string[], difficulty: string) {
  const prompt = `Generate a 5-question adaptive assessment for Computer Science students on "${track || 'CSE Core'}" focusing on problematic topics: ${JSON.stringify(redNodes || [])} at difficulty: "${difficulty || 'INTERMEDIATE'}". Include deep distractor explanations.`;

  const { data, error } = await callGeminiWithRetry<any>(
    prompt,
    'You are a senior CSE academic examiner producing rigorous, high-fidelity technical mock test items with deep distractor analyses.',
    MOCK_TEST_SCHEMA,
    25000
  );

  if (data && data.questions) {
    return { ...data, source: 'gemini' as const, fallback_reason: null };
  }

  const fallback = getMockTestFallback(track);
  return {
    ...fallback,
    source: 'fallback' as const,
    fallback_reason: error || 'Gemini model unavailable',
  };
}

export async function processLibraryRequest(documentTitle: string, textContent: string, subjectTrack: string) {
  const prompt = `Analyze this Computer Science study document titled "${documentTitle || 'CSE Notes'}" (${subjectTrack || 'General CSE'}).
Document excerpt:
"""
${(textContent || '').slice(0, 4000)}
"""

Extract structured pedagogical insights for the Individual Student Learning Model (ISLM).`;

  const { data, error } = await callGeminiWithRetry<any>(
    prompt,
    'You are a CSE curriculum analyst extracting concept ontologies and cognitive traps for an adaptive intelligent tutoring system.',
    LIBRARY_PROCESS_SCHEMA,
    25000
  );

  if (data && data.extracted_concepts) {
    return { ...data, source: 'gemini' as const, fallback_reason: null };
  }

  const fallback = getLibraryVaultFallback(documentTitle, subjectTrack);
  return {
    ...fallback,
    source: 'fallback' as const,
    fallback_reason: error || 'Gemini model unavailable',
  };
}
