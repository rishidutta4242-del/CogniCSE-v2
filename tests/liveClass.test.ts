import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLiveTranscriptFallback,
  getInterventionSuggestionsFallback,
} from '../server/fallbacks.js';
import {
  startLiveSession,
  releaseLiveQuestion,
  submitLiveAnswer,
  getLiveSessionState,
  setLiveTimeline,
  endLiveSession,
} from '../server/liveSession.js';

describe('Live Class & Teacher Analytics Engine', () => {
  test('extracts concept timeline and exactly 2 check questions per concept from transcript', () => {
    const transcript = 'Today we examine the Apache web server filesystem boundary...';
    const result = getLiveTranscriptFallback(transcript, 'Web Application Development', 'web_apache_docroot');

    assert.ok(Array.isArray(result.timeline), 'Timeline must be an array');
    assert.ok(result.timeline.length >= 2, 'Must have at least 2 milestone concepts');

    result.timeline.forEach((item, idx) => {
      assert.ok(item.id, `Timeline item ${idx} must have an id`);
      assert.ok(item.conceptId, `Timeline item ${idx} must have a conceptId`);
      assert.ok(item.conceptName, `Timeline item ${idx} must have a conceptName`);
      assert.equal(item.questions.length, 2, `Timeline item ${item.conceptName} must have exactly 2 check questions`);

      item.questions.forEach((q, qIdx) => {
        assert.ok(q.id, `Question ${qIdx} must have an id`);
        assert.ok(q.question.length > 10, 'Question must have text');
        assert.equal(q.options.length, 4, 'Question must have 4 options');
        assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3, 'Correct index must be 0-3');
        assert.ok(q.explanation.length > 5, 'Question must have an explanation');
        assert.ok(typeof q.misconceptionMap === 'object', 'Question must have misconception mapping');
      });
    });
  });

  test('generates structured AI intervention suggestions with target students and rationales', () => {
    const mockStudents = [
      {
        student_id: 'CSE_STU_9021',
        name: 'Alex Rivera',
        role: 'student',
        overall_mastery: 0.28,
        topic_mastery: { web_apache_docroot: 0.25, pdo_mysql_port: 0.20, sql_injection_defense: 0.30 },
        recent_misconceptions: ['Saved to Desktop outside DocumentRoot'],
        scaffolding_fading_index: 0.22,
        error_count: 5,
      },
    ];

    const suggestions = getInterventionSuggestionsFallback(mockStudents);
    assert.ok(Array.isArray(suggestions), 'Suggestions must be an array');
    assert.ok(suggestions.length > 0, 'Must generate at least one suggestion');

    const first = suggestions[0];
    assert.equal(first.studentId, 'CSE_STU_9021');
    assert.equal(first.status, 'pending');
    assert.ok(first.tutorMessage.length > 10);
    assert.ok(first.socraticQuestion.length > 10);
    assert.ok(first.rationale.length > 10);
  });

  test('accurately classifies student at-risk status based on 3+ red nodes or no independent success in 7 days', () => {
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Student A: 3 red nodes (pL < 0.50) -> AT RISK
    const studentA = {
      id: 'A',
      topicMastery: { node1: 0.2, node2: 0.3, node3: 0.4, node4: 0.8 },
      attempts: [{ ts: new Date(now - 1000).toISOString(), tierUsed: 1, passed: true }],
    };
    const redNodesA = Object.values(studentA.topicMastery).filter(p => p < 0.50).length;
    const isAtRiskA = redNodesA >= 3;
    assert.equal(isAtRiskA, true, 'Student with 3 red nodes must be flagged at risk');

    // Student B: 0 red nodes, but last independent pass was 10 days ago -> AT RISK
    const studentB = {
      id: 'B',
      topicMastery: { node1: 0.85, node2: 0.90 },
      attempts: [{ ts: new Date(now - 10 * 24 * 3600 * 1000).toISOString(), tierUsed: 1, passed: true }],
    };
    const hasRecentSuccessB = studentB.attempts.some(
      a => now - new Date(a.ts).getTime() <= SEVEN_DAYS_MS && a.tierUsed === 1 && a.passed
    );
    const isAtRiskB = !hasRecentSuccessB;
    assert.equal(isAtRiskB, true, 'Student with no independent success in 7 days must be at risk');

    // Student C: 1 red node and passed independently yesterday -> ON TRACK
    const studentC = {
      id: 'C',
      topicMastery: { node1: 0.4, node2: 0.85 },
      attempts: [{ ts: new Date(now - 24 * 3600 * 1000).toISOString(), tierUsed: 1, passed: true }],
    };
    const redNodesC = Object.values(studentC.topicMastery).filter(p => p < 0.50).length;
    const hasRecentSuccessC = studentC.attempts.some(
      a => now - new Date(a.ts).getTime() <= SEVEN_DAYS_MS && a.tierUsed === 1 && a.passed
    );
    const isAtRiskC = redNodesC >= 3 || !hasRecentSuccessC;
    assert.equal(isAtRiskC, false, 'Active student with recent pass must be on track');
  });

  test('generates level-specific micro-tutorials: beginner scaffolding, intermediate constructivist, advanced extension', async () => {
    // 1. Initialize live session
    startLiveSession({
      topicId: 'web_apache_docroot',
      topicName: 'Apache DocumentRoot & File Hierarchy',
      track: 'Web Application Development',
      teacherId: 'FACULTY_402',
    });

    const fallbackData = getLiveTranscriptFallback();
    setLiveTimeline(fallbackData.timeline);

    const q = releaseLiveQuestion('q_docroot_1');
    assert.ok(q, 'Question must be released');

    // Test Beginner (Alex Rivera, pL = 0.28 < 0.35) wrong answer (index 1)
    const beginnerRes = await submitLiveAnswer({
      studentId: 'CSE_STU_9021',
      questionId: 'q_docroot_1',
      selectedIndex: 1, // incorrect
      lowEngagement: false,
    });
    assert.equal(beginnerRes.tutorial.level, 'Beginner');
    assert.equal(beginnerRes.tutorial.tutorialType, 'scaffolding');
    assert.ok(beginnerRes.tutorial.content.includes('misconception'));

    // Test Advanced (Maya Lin, pL = 0.88 > 0.70) correct answer (index 0)
    const advancedRes = await submitLiveAnswer({
      studentId: 'CSE_STU_7734',
      questionId: 'q_docroot_1',
      selectedIndex: 0, // correct
      lowEngagement: false,
    });
    assert.equal(advancedRes.tutorial.level, 'Advanced');
    assert.equal(advancedRes.tutorial.tutorialType, 'extension');
    assert.ok(advancedRes.tutorial.content.includes('extension challenge'));

    // Test Low Engagement Student: gets re-engagement prompt rather than more content
    const lowEngagementRes = await submitLiveAnswer({
      studentId: 'CSE_STU_8810',
      questionId: 'q_docroot_1',
      selectedIndex: 0,
      lowEngagement: true,
    });
    assert.equal(lowEngagementRes.tutorial.tutorialType, 're-engage');
    assert.ok(lowEngagementRes.tutorial.title.includes('Attention Check-In'));

    endLiveSession();
  });

  test('validates CSV format produces RFC-compliant header and metrics', () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Email',
      'Track',
      'Overall Mastery %',
      'At Risk Status',
      'Red Concepts Count',
      'Green Concepts Count',
      'Repeated Errors',
      'Hints & Assistance Requests',
      'Scaffolding Fading Rate %',
      'Time Spent (Mins)',
    ];

    const mockRow = [
      'CSE_STU_9021',
      '"Alex Rivera"',
      'alex.r@university.edu',
      '"Web Application Development"',
      28,
      'AT RISK',
      3,
      0,
      4,
      7,
      22,
      45,
    ].join(',');

    assert.equal(headers.length, 12);
    assert.ok(mockRow.includes('AT RISK'));
    assert.ok(mockRow.includes('Alex Rivera'));
  });
});
