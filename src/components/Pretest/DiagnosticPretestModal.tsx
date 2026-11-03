import React, { useState } from 'react';
import { useTutor } from '../../context/TutorContext';
import { Award, CheckCircle, XCircle, ArrowRight, ArrowLeft, Brain, Sparkles, X, Settings2 } from 'lucide-react';

interface DiagnosticPretestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CSE_PRETEST_QUESTIONS = [
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

const MECH_PRETEST_QUESTIONS = [
  {
    id: 'cad_dof_2d',
    question: 'In Fusion 360 a sketch line is blue instead of black. What does this signify?',
    options: [
      'Under-constrained, still has free degrees of freedom',
      'The sketch entity is fully constrained and ready for production extrusion',
      'The entity is a construction reference line that does not define boundaries',
      'An over-constraint or geometric conflict error has occurred',
    ],
    correct: 0,
    topicName: 'Degrees of Freedom in a 2D Sketch',
  },
  {
    id: 'cad_geometric_constraints',
    question: 'Which geometric constraint must be applied between a linear edge and an arc to ensure smooth G1 slope continuity without forming a sharp cusp?',
    options: [
      'Tangent constraint',
      'Coincident constraint',
      'Concentric constraint',
      'Collinear constraint',
    ],
    correct: 0,
    topicName: 'Geometric Constraints (G1 Tangency)',
  },
  {
    id: 'cad_driving_parameters',
    question: 'In ISO/ASME mechanical drafting and parametric modeling, what is the standardized default base unit for length?',
    options: [
      'Millimeters (mm)',
      'Centimeters (cm)',
      'Meters (m)',
      'Inches (in)',
    ],
    correct: 0,
    topicName: 'Dimensions & Driving Parameters (mm vs cm)',
  },
  {
    id: 'cad_material_mass_properties',
    question: 'An extruded steel bracket has volume = 250,000 mm³. Given mild steel density = 7.85 g/cm³, what is its calculated mass?',
    options: [
      '1.96 kg (1,962.5 grams)',
      '1,962.5 kg',
      '250 grams',
      '0.25 kg',
    ],
    correct: 0,
    topicName: 'Material, Volume and Mass Properties',
  },
  {
    id: 'cad_stress_fos',
    question: 'Why is a calculated Factor of Safety (FOS) of 1.1 considered unacceptable for ductile static mechanical machinery?',
    options: [
      'Target FOS must be >= 2.0 to provide structural margin against dynamic shock, tool notches, and plastic yielding.',
      'CAD solvers crash when FOS is under 1.5.',
      'FOS cannot mathematically drop below 1.0 in FEA.',
      'Ductile materials can only withstand infinite stress if FOS = 5.0.',
    ],
    correct: 0,
    topicName: 'Static Stress and Factor of Safety (FOS >= 2.0)',
  },
];

export const DiagnosticPretestModal: React.FC<DiagnosticPretestModalProps> = ({ isOpen, onClose }) => {
  const { runDiagnosticPretestComplete, activeTrack, setActiveTrack } = useTutor();

  const isInitiallyMech =
    activeTrack === 'Mechanical Engineering (CAD)' ||
    activeTrack.toLowerCase().includes('mech') ||
    activeTrack.toLowerCase().includes('cad');

  const [selectedTrack, setSelectedTrack] = useState<'mech' | 'cse'>(isInitiallyMech ? 'mech' : 'cse');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync track if activeTrack changes externally
  React.useEffect(() => {
    const isMech =
      activeTrack === 'Mechanical Engineering (CAD)' ||
      activeTrack.toLowerCase().includes('mech') ||
      activeTrack.toLowerCase().includes('cad');
    setSelectedTrack(isMech ? 'mech' : 'cse');
    setCurrentIdx(0);
    setAnswers({});
  }, [activeTrack]);

  if (!isOpen) return null;

  const currentQuestions = selectedTrack === 'mech' ? MECH_PRETEST_QUESTIONS : CSE_PRETEST_QUESTIONS;
  const currentQ = currentQuestions[currentIdx];

  const handleSelectTrack = (track: 'mech' | 'cse') => {
    setSelectedTrack(track);
    setActiveTrack(track === 'mech' ? 'Mechanical Engineering (CAD)' : 'Web Application Development');
    setCurrentIdx(0);
    setAnswers({});
    setIsCompleted(false);
  };

  const handleSelect = (optIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleFinish = () => {
    let score = 0;
    const missedTopics: string[] = [];

    currentQuestions.forEach((q, idx) => {
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
      <div className="bg-[#0c1421] border border-[#1a273b] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Diagnostic Pretest
                </span>
                {/* Track Switcher */}
                <div className="flex items-center gap-1 bg-[#060b13] p-1 rounded-lg border border-[#1a273b]">
                  <button
                    onClick={() => handleSelectTrack('mech')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      selectedTrack === 'mech'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mechanical (CAD)
                  </button>
                  <button
                    onClick={() => handleSelectTrack('cse')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      selectedTrack === 'cse'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Computer Science
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-100 mt-2.5">
                {selectedTrack === 'mech' ? 'Mechanical (CAD)' : 'Computer Science'} Diagnostic ({currentIdx + 1}/{currentQuestions.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedTrack === 'mech'
                  ? 'Diagnoses your 2D sketch constraint reasoning, GD&T runout, mass evaluation, and FEA Factor of Safety margin.'
                  : 'Calibrates your starting Individual Student Learning Model and initializes your Memory Tree.'}
              </p>
            </div>

            {/* Question Card */}
            <div className="p-4 bg-[#070d18] rounded-xl border border-[#1a273b] space-y-3">
              <span className="text-xs font-mono text-blue-300 font-semibold block">
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
                          ? 'bg-blue-950/80 border-blue-500 text-blue-200 ring-1 ring-blue-500/50'
                          : 'bg-[#0c1421] border-[#1a273b] text-slate-300 hover:bg-[#111b2b]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded bg-[#070d18] border border-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
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
                className="px-3 py-1.5 bg-[#111b2b] hover:bg-[#162235] text-slate-300 rounded-lg text-xs disabled:opacity-40 cursor-pointer border border-[#1a273b]"
              >
                Previous
              </button>

              {currentIdx < currentQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  disabled={answers[currentIdx] === undefined}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={answers[currentIdx] === undefined}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer shadow-md"
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
              <h2 className="text-xl font-bold text-slate-100">
                {selectedTrack === 'mech' ? 'Mechanical CAD Diagnostic Calibrated!' : 'Diagnostic Calibrated!'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {selectedTrack === 'mech'
                  ? 'Your CAD parametric knowledge state is now calibrated in your ISLM profile. Gaps have been updated in your Memory Tree for Socratic coaching.'
                  : 'Your Individual Student Learning Model (ISLM) has been configured. Knowledge gaps were mapped to your Memory Tree as RED nodes for progressive Socratic tutoring.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Enter Cognitive Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
