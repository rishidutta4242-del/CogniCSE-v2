import { type Express, type Request, type Response } from 'express';
import {
  addSSEClient,
  removeSSEClient,
  startLiveSession,
  endLiveSession,
  getLiveSessionState,
  setLiveTimeline,
  releaseLiveQuestion,
  submitLiveAnswer,
  updateStudentEngagement,
} from './liveSession.ts';
import { processLiveTranscriptRequest } from './gemini.ts';

export function registerLiveRoutes(app: Express) {
  // SSE Connection Stream: GET /api/live/stream
  app.get('/api/live/stream', (req: Request, res: Response) => {
    const role = (req.query.role as 'teacher' | 'student') || 'student';
    const studentId = req.query.studentId as string;
    const studentName = req.query.studentName as string;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    addSSEClient({
      id: clientId,
      role,
      studentId,
      studentName,
      res,
    });

    // 15-second heartbeat ping to keep connection alive
    const pingInterval = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(pingInterval);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(pingInterval);
      removeSSEClient(clientId);
    });
  });

  // POST /api/live/session/start
  app.post('/api/live/session/start', (req: Request, res: Response) => {
    try {
      const { topicId, topicName, track, teacherId } = req.body;
      const session = startLiveSession({
        topicId: topicId || 'web_apache_docroot',
        topicName: topicName || 'Apache DocumentRoot & File Hierarchy',
        track: track || 'Web Application Development',
        teacherId: teacherId || 'FACULTY_402',
      });
      return res.json({ success: true, session });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to start live session', details: err?.message });
    }
  });

  // POST /api/live/session/end
  app.post('/api/live/session/end', (_req: Request, res: Response) => {
    try {
      const result = endLiveSession();
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to end live session', details: err?.message });
    }
  });

  // GET /api/live/session/state
  app.get('/api/live/session/state', (_req: Request, res: Response) => {
    try {
      const state = getLiveSessionState();
      return res.json(state);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to get live session state', details: err?.message });
    }
  });

  // POST /api/live/transcript
  app.post('/api/live/transcript', async (req: Request, res: Response) => {
    try {
      const { transcript, track, topicId } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: 'transcript is required' });
      }

      const result = await processLiveTranscriptRequest(transcript, track, topicId);
      if (result.timeline && Array.isArray(result.timeline)) {
        setLiveTimeline(result.timeline);
      }

      return res.json({
        success: true,
        timeline: result.timeline || [],
        source: result.source,
        fallback_reason: result.fallback_reason,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to process transcript', details: err?.message });
    }
  });

  // POST /api/live/release-question
  app.post('/api/live/release-question', (req: Request, res: Response) => {
    try {
      const { questionId } = req.body;
      if (!questionId) {
        return res.status(400).json({ error: 'questionId is required' });
      }

      const releasedQuestion = releaseLiveQuestion(questionId);
      if (!releasedQuestion) {
        return res.status(404).json({ error: `Question ${questionId} not found in session timeline` });
      }

      return res.json({ success: true, releasedQuestion });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to release question', details: err?.message });
    }
  });

  // POST /api/live/submit-answer
  app.post('/api/live/submit-answer', async (req: Request, res: Response) => {
    try {
      const { studentId, questionId, selectedIndex, lowEngagement } = req.body;
      if (!studentId || !questionId || selectedIndex === undefined) {
        return res.status(400).json({ error: 'studentId, questionId, and selectedIndex are required' });
      }

      const result = await submitLiveAnswer({
        studentId,
        questionId,
        selectedIndex: Number(selectedIndex),
        lowEngagement: Boolean(lowEngagement),
      });

      return res.json({ success: true, ...result });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to submit live answer', details: err?.message });
    }
  });

  // POST /api/live/student-engagement
  app.post('/api/live/student-engagement', (req: Request, res: Response) => {
    try {
      const { studentId, lowEngagement } = req.body;
      if (!studentId) {
        return res.status(400).json({ error: 'studentId is required' });
      }

      updateStudentEngagement(studentId, Boolean(lowEngagement));
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update engagement', details: err?.message });
    }
  });
}
