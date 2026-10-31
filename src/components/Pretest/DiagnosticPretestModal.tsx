import React, { useState } from 'react';
import { useTutor } from '../../context/TutorContext';
import { Award, CheckCircle, XCircle, ArrowRight, ArrowLeft, Brain, Sparkles, X } from 'lucide-react';

interface DiagnosticPretestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRETEST_QUESTIONS = [
  {
    id: 'pdo_mysql_port',
    question: 'When a PHP web backend attempts to connect to a local MySQL instance using PDO, which TCP port should be specified in the connection string by default?',
    options: ['Port 80', 'Port 443', 'Port 3306', 'Port 8080'],
    correct: 2,
    topicName: 'PHP PDO & MySQL Port Configuration',
  },
  {
    id: 'recursion_base_case',
    question: 'What happens in a recursive algorithm when the stopping condition (base case) is unreachable or missing?',
    options: [
      'The code compiles but triggers a stack overflow at runtime.',
      'The compiler flags a syntax error and aborts build.',
      'The function immediately returns null.',
      'Operating system memory is completely undamaged and execution freezes safely.',
    ],
    correct: 0,
    topicName: 'Recursion Base Case & Stack Frames',
  },
  {
    id: 'deadlock_four_conditions',
    question: 'Which of the following breaks the "Circular Wait" condition to prevent deadlocks in multi-threaded programs?',
    options: [
      'Enforcing a strict global ordering on lock acquisition.',
      'Disabling thread preemption entirely.',
      'Allowing threads to hold infinite mutexes.',
      'Increasing the CPU clock frequency.',
    ],
    correct: 0,
    topicName: 'Deadlock & Concurrency Control',
  },
  {
    id: 'osi_transport_layer',
    question: 'Which layer of the OSI 7-layer architecture handles end-to-end reliability, sequence numbers, and port addressing (TCP/UDP)?',
    options: ['Layer 2 - Data Link', 'Layer 3 - Network', 'Layer 4 - Transport', 'Layer 7 - Application'],
    correct: 2,
    topicName: 'Transport Layer Protocols',
  },
  {
    id: 'http_statelessness',
    question: 'Why does an HTTP server not naturally recognize that request #2 came from the user who authenticated in request #1?',
    options: [
      'HTTP is inherently stateless; session state must be transmitted via cookies or tokens.',
      'The operating system shuts down the network card between requests.',
      'DNS servers scramble IP addresses on every packet.',
      'Database queries purge RAM after each SELECT query.',
    ],
    correct: 0,
    topicName: 'HTTP Statelessness & Session Tokens',
  },
];

export const DiagnosticPretestModal: React.FC<DiagnosticPretestModalProps> = ({ isOpen, onClose }) => {
  const { runDiagnosticPretestComplete } = useTutor();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQ = PRETEST_QUESTIONS[currentIdx];

  const handleSelect = (optIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleFinish = () => {
    let score = 0;
    const missedTopics: string[] = [];

    PRETEST_QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        score++;
      } else {
        missedTopics.push(q.id);
      }
    });

    runDiagnosticPretestComplete(score, missedTopics);
    setIsCompleted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Workflow 1: Adaptive Onboarding Diagnostic
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-2">
                Initial ISLM Diagnostic Assessment ({currentIdx + 1}/5)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calibrates your starting Individual Student Learning Model and initializes your Memory Tree.
              </p>
            </div>

            {/* Question Card */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-mono text-indigo-300 font-semibold block">
                {currentQ.topicName}
              </span>
              <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                {currentQ.question}
              </p>

              <div className="space-y-2 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = answers[currentIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(oIdx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="w-5 h-5 rounded bg-slate-950 border border-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nav Footer */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              {currentIdx < PRETEST_QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  disabled={answers[currentIdx] === undefined}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={answers[currentIdx] === undefined}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Complete Diagnostic
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Diagnostic Calibrated!</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Your Individual Student Learning Model (ISLM) has been configured. Knowledge gaps were mapped to your Memory Tree as RED nodes for progressive Socratic tutoring.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Enter Cognitive Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
