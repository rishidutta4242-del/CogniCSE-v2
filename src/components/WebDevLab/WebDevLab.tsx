import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  Terminal,
  Monitor,
  Lightbulb,
  Award,
} from 'lucide-react';
import { useTutor } from '../../context/TutorContext';
import {
  LabExercise,
  ProactiveNudge,
  VirtualDirectory,
  WebLabErrorCategory,
} from './types';
import {
  createInitialFileSystem,
  writeVirtualFile,
  DOCROOT_PATH,
  DESKTOP_PATH,
} from './virtualFileSystem';
import {
  executeCommand,
  INITIAL_MYSQL_DB,
  executePHPScript,
} from './virtualEngine';
import { ProactiveTutorDrawer } from './ProactiveTutorDrawer';
import { VirtualTerminal } from './VirtualTerminal';
import { VirtualBrowser } from './VirtualBrowser';
import { WebDevEditor } from './WebDevEditor';

export const LAB_EXERCISES: LabExercise[] = [
  {
    id: 'docroot_index',
    conceptId: 'web_apache_docroot',
    conceptName: 'Apache DocumentRoot Mapping',
    title: 'Document Root index.html',
    tier: 1,
    summary: 'Save index.html to DocumentRoot (C:\\xampp\\htdocs) and verify in Virtual Browser at http://localhost/index.html',
    instruction: 'Create and save an index.html file into C:\\xampp\\htdocs. Then open http://localhost/index.html in the virtual browser.',
    recommendedFile: 'index.html',
    recommendedDir: DOCROOT_PATH,
    expectedUrl: 'http://localhost/index.html',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CogniCSE Student Web App</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    .card { background: #1e293b; padding: 1.5rem; border-radius: 12px; border: 1px solid #334155; }
    h1 { color: #38bdf8; margin-top: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello from Apache DocumentRoot!</h1>
    <p>This web page is being served from <code>C:\\xampp\\htdocs\\index.html</code> via standard HTTP port 80.</p>
  </div>
</body>
</html>`,
    hints: [
      'Apache server maps the root URL http://localhost/ directly to C:\\xampp\\htdocs on Windows.',
      'Saving to C:\\Users\\Student\\Desktop causes Apache to respond with HTTP 404 Not Found.',
      'Make sure the save location in the editor is set to C:\\xampp\\htdocs.',
    ],
  },
  {
    id: 'pdo_connection',
    conceptId: 'pdo_mysql_port',
    conceptName: 'PHP PDO & MySQL Port Configuration',
    title: 'PHP PDO Database Connection',
    tier: 1,
    summary: 'Configure PDO DSN with TCP port 3306 and connect to MySQL database university_cse.',
    instruction: 'Fix the PDO connection string in db.php. Notice port 80 is an HTTP port; MySQL listens on port 3306.',
    recommendedFile: 'db.php',
    recommendedDir: DOCROOT_PATH,
    expectedUrl: 'http://localhost/db.php',
    starterCode: `<?php
// Attempting to establish a persistent PDO connection
$host = 'localhost';
$port = '80'; // <-- TRAP: Is 80 the database port or the web server port?
$db   = 'university_cse';
$user = 'root';
$pass = '';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db";
    $pdo = new PDO($dsn, $user, $pass);
    echo "Connected successfully to MySQL on port $port!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>`,
    hints: [
      'TCP port 80 is used by Apache for web requests. What port is used by MySQL?',
      'The default IANA port for MySQL and MariaDB servers is 3306.',
      'Change $port = "80"; to $port = "3306"; in db.php.',
    ],
  },
  {
    id: 'prepared_select',
    conceptId: 'sql_injection_defense',
    conceptName: 'SQL Prepared Statements vs Concatenation',
    title: 'Prepared-Statement SELECT Query',
    tier: 1,
    summary: 'Query table students using $pdo->prepare() and bound parameters rather than string concatenation.',
    instruction: 'Replace the raw string concatenation with a prepared statement ($stmt = $pdo->prepare(...); $stmt->execute(...)).',
    recommendedFile: 'students.php',
    recommendedDir: DOCROOT_PATH,
    expectedUrl: 'http://localhost/students.php',
    starterCode: `<?php
// Secure Data Retrieval using Prepared Statements
$host = 'localhost';
$port = '3306';
$db   = 'university_cse';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db", $user, $pass);

    // TRAP: Insecure raw concatenation vulnerable to SQL injection
    $majorFilter = "Computer Science";
    $sql = "SELECT * FROM students WHERE major = '" . $majorFilter . "'";
    
    // TODO: Refactor to:
    // $stmt = $pdo->prepare("SELECT * FROM students WHERE major = :major");
    // $stmt->execute(['major' => $majorFilter]);
    
    echo "Executing: $sql";
} catch (PDOException $e) {
    echo "Query failed: " . $e->getMessage();
}
?>`,
    hints: [
      'String concatenation inside SQL strings allows malicious input to alter query syntax.',
      'Prepared statements compile the SQL query first, keeping parameters strictly isolated.',
      'Use $stmt = $pdo->prepare("SELECT * FROM students WHERE major = ?"); and $stmt->execute([$majorFilter]);',
    ],
  },
];

export const WebDevLab: React.FC = () => {
  const {
    userProfile,
    dkmNodes,
    recordObservation,
    recordAttempt,
  } = useTutor();

  const [fsRoot, setFsRoot] = useState<VirtualDirectory>(() => createInitialFileSystem());
  const [cwd, setCwd] = useState<string>(DOCROOT_PATH);
  const [isMySQLMode, setIsMySQLMode] = useState<boolean>(false);
  const [currentExercise, setCurrentExercise] = useState<LabExercise>(LAB_EXERCISES[0]);
  const [activeNudge, setActiveNudge] = useState<ProactiveNudge | null>(null);
  const [lastBKT, setLastBKT] = useState<{ prior: number; posterior: number; isRepeated: boolean } | null>(null);
  const [terminalLines, setTerminalLines] = useState<Array<{ id: string; type: 'input' | 'output' | 'error'; text: string }>>([
    {
      id: 'init_1',
      type: 'output',
      text: 'CogniCSE Virtual Web Environment initialized.\nApache DocumentRoot: C:\\xampp\\htdocs\nMySQL Daemon listening on TCP 3306\nType \'help\' for command reference.',
    },
  ]);

  const currentTier = useMemo(() => {
    const targetNode = dkmNodes.find(n => n.id === currentExercise.conceptId);
    if (!targetNode) return 1;
    return targetNode.mastery < 0.4 ? 3 : targetNode.mastery < 0.7 ? 2 : 1;
  }, [dkmNodes, currentExercise]);

  // Log and record pedagogical event + observation
  const triggerPedagogicalObservation = (
    conceptId: string,
    isCorrect: boolean,
    errorCategory?: WebLabErrorCategory,
    feedbackMsg?: string
  ) => {
    const priorNode = dkmNodes.find(n => n.id === conceptId);
    const priorPL = priorNode ? priorNode.mastery : 0.5;

    const { updatedNode } = recordObservation({
      conceptId,
      isCorrect,
      isIndependent: false,
      source: 'web_lab',
      errorCategory,
      tierUsed: currentTier,
    });

    const posteriorPL = updatedNode.mastery;

    if (recordAttempt) {
      recordAttempt({
        conceptId,
        kind: 'web_lab',
        passed: isCorrect,
        tierUsed: currentTier,
        hintsRequested: 0,
        durationSec: 15,
        errorCategory,
        details: feedbackMsg,
      }).catch(err => console.warn('Web lab attempt logging:', err));
    }

    setLastBKT({
      prior: priorPL,
      posterior: posteriorPL,
      isRepeated: Boolean(errorCategory && priorNode && (priorNode.errorCount || 0) > 1),
    });

    return { priorPL, posteriorPL };
  };

  // Handle Save File in WebDevEditor
  const handleSaveFile = (directory: string, filename: string, content: string) => {
    const fullPath = `${directory}\\${filename}`;
    const writeResult = writeVirtualFile(fsRoot, fullPath, content);

    if (!writeResult.success) {
      const nudge: ProactiveNudge = {
        id: `ndg_${Date.now()}`,
        tier: currentTier,
        title: 'File System Error',
        message: writeResult.error || 'Failed to save file.',
        socraticQuestion: 'Does the target directory exist in the virtual drive?',
        errorCategory: 'file_management',
        timestamp: new Date().toLocaleTimeString(),
      };
      setActiveNudge(nudge);
      return;
    }

    // Refresh FS tree trigger
    setFsRoot({ ...fsRoot });

    // CHECK: Did the student save outside the Apache DocumentRoot? (Acceptance test!)
    const isDesktop = directory.toLowerCase().includes('desktop');
    const isOutsideDocroot = !directory.toLowerCase().startsWith('c:\\xampp\\htdocs');

    if (isDesktop || isOutsideDocroot) {
      const nudge: ProactiveNudge = {
        id: `ndg_${Date.now()}`,
        tier: currentTier,
        title: 'DocumentRoot Misplacement Detected',
        message: `You saved "${filename}" to "${directory}". In a standard Apache/XAMPP web stack, Apache maps http://localhost/ to C:\\xampp\\htdocs, NOT to your Desktop or user folders.`,
        socraticQuestion: 'Where does Apache look for web assets when an HTTP request arrives, and why does saving to Desktop result in HTTP 404?',
        errorCategory: 'directory_error',
        timestamp: new Date().toLocaleTimeString(),
      };
      setActiveNudge(nudge);

      // Record negative observation
      triggerPedagogicalObservation(
        currentExercise.conceptId,
        false,
        'directory_error',
        `File saved outside DocumentRoot to ${directory}`
      );
      return;
    }

    // Check PHP code for port 80 trap
    if (filename.endsWith('.php')) {
      const hasPort80 = /port\s*=\s*['"]?80['"]?/i.test(content);
      if (hasPort80) {
        const nudge: ProactiveNudge = {
          id: `ndg_${Date.now()}`,
          tier: currentTier,
          title: 'TCP Port Collision (Port 80 vs 3306)',
          message: 'Saved PHP file contains port 80 in the PDO connection string. Port 80 is the HTTP web server port, not the MySQL database socket.',
          socraticQuestion: 'What is the standard TCP port that the MySQL daemon listens on?',
          errorCategory: 'db_connection',
          timestamp: new Date().toLocaleTimeString(),
        };
        setActiveNudge(nudge);
        triggerPedagogicalObservation(
          'pdo_mysql_port',
          false,
          'db_connection',
          'PHP PDO DSN port 80 specified'
        );
        return;
      }

      // Check for SQL injection concatenation in exercise 3
      if (currentExercise.id === 'prepared_select' && /SELECT/i.test(content)) {
        const hasConcat = /\$sql\s*=\s*["'][^"']*\.\s*\$|\$sql\s*=\s*["'][^"']*\$[a-zA-Z_]/i.test(content);
        const hasPrepare = /->prepare\s*\(/i.test(content);
        if (hasConcat && !hasPrepare) {
          const nudge: ProactiveNudge = {
            id: `ndg_${Date.now()}`,
            tier: currentTier,
            title: 'SQL Concatenation Anti-Pattern',
            message: 'Your query interpolates variables directly into the SQL string. This leaves the database vulnerable to SQL injection.',
            socraticQuestion: 'How can you rewrite this query using $pdo->prepare() and bound placeholders (:name or ?)?',
            errorCategory: 'sql_query',
            timestamp: new Date().toLocaleTimeString(),
          };
          setActiveNudge(nudge);
          triggerPedagogicalObservation(
            'sql_injection_defense',
            false,
            'sql_query',
            'SQL string concatenation used without PDO prepare'
          );
          return;
        }
      }
    }

    // If correctly saved in C:\xampp\htdocs\index.html, clear error and notify
    if (filename === 'index.html' && directory.toLowerCase() === DOCROOT_PATH.toLowerCase()) {
      setActiveNudge(null);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      triggerPedagogicalObservation(
        'web_apache_docroot',
        true,
        undefined,
        'index.html placed accurately in DocumentRoot C:\\xampp\\htdocs'
      );
    }
  };

  // Handle Terminal Execution
  const handleTerminalExecute = (cmd: string) => {
    const inputLineId = `line_${Date.now()}_in`;
    const newLines = [...terminalLines, { id: inputLineId, type: 'input' as const, text: `${cwd}> ${cmd}` }];

    const { result, newCwd, newIsMySQLMode } = executeCommand(
      cmd,
      cwd,
      fsRoot,
      INITIAL_MYSQL_DB,
      isMySQLMode,
      currentTier
    );

    setCwd(newCwd);
    setIsMySQLMode(newIsMySQLMode);

    if (result.output === '__CLEAR__') {
      setTerminalLines([]);
      return;
    }

    if (result.detectedError) {
      setActiveNudge(result.detectedError.nudge);
      triggerPedagogicalObservation(
        currentExercise.conceptId,
        false,
        result.detectedError.category,
        result.detectedError.description
      );
    }

    const outputLineId = `line_${Date.now()}_out`;
    setTerminalLines([
      ...newLines,
      {
        id: outputLineId,
        type: result.exitCode !== 0 ? ('error' as const) : ('output' as const),
        text: result.output,
      },
    ]);
  };

  // Handle Virtual Browser Request
  const handleBrowserRequest = (requestUrl: string, status: number, isFound: boolean) => {
    if (status === 200 && isFound) {
      setActiveNudge(null);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      triggerPedagogicalObservation(
        currentExercise.conceptId,
        true,
        undefined,
        `Browser successfully loaded ${requestUrl} from DocumentRoot with HTTP 200 OK`
      );
    } else {
      // 404 Trigger
      const nudge: ProactiveNudge = {
        id: `ndg_${Date.now()}`,
        tier: currentTier,
        title: 'Apache HTTP 404 Not Found',
        message: `Apache checked DocumentRoot (C:\\xampp\\htdocs), but the requested resource could not be found.`,
        socraticQuestion: 'Did you save your file into C:\\xampp\\htdocs with the exact matching filename and extension?',
        errorCategory: 'directory_error',
        timestamp: new Date().toLocaleTimeString(),
      };
      setActiveNudge(nudge);
      triggerPedagogicalObservation(
        currentExercise.conceptId,
        false,
        'directory_error',
        `Browser 404 on ${requestUrl}`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-[#0b1320] border border-[#1a273b] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="p-1.5 bg-blue-950 text-blue-400 rounded-lg border border-blue-800/60">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              CSE Systems & Web Infrastructure Lab
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Virtual environment (simulated)
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">
            Practical Web Server, DocumentRoot & MySQL Sockets Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Simulates real-world difficulties encountered in Web Architecture: Apache DocumentRoot directory mapping,
            PHP PDO TCP socket configuration (port 3306 vs 80), and SQL injection defenses.
          </p>
        </div>

        {/* Current Concept Status Card */}
        <div className="flex items-center gap-3 shrink-0 bg-[#070c14] border border-[#162438] px-3.5 py-2 rounded-xl">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <div className="text-slate-400 text-[10px]">Active Concept:</div>
            <div className="font-bold text-slate-200">{currentExercise.conceptName}</div>
          </div>
        </div>
      </div>

      {/* PROACTIVE SOCRATIC NUDGE DRAWER */}
      <ProactiveTutorDrawer
        nudge={activeNudge}
        onDismiss={() => setActiveNudge(null)}
        priorPL={lastBKT?.prior}
        posteriorPL={lastBKT?.posterior}
        isRepeatedError={lastBKT?.isRepeated}
      />

      {/* TOP WORKSPACE: EDITOR */}
      <div className="h-[360px]">
        <WebDevEditor
          currentExercise={currentExercise}
          onSaveFile={handleSaveFile}
          onSelectExercise={setCurrentExercise}
          exercises={LAB_EXERCISES}
        />
      </div>

      {/* BOTTOM SPLIT: VIRTUAL TERMINAL & VIRTUAL BROWSER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <VirtualTerminal
            cwd={cwd}
            isMySQLMode={isMySQLMode}
            onExecute={handleTerminalExecute}
            outputLines={terminalLines}
            onClear={() => setTerminalLines([])}
          />
        </div>
        <div>
          <VirtualBrowser
            fsRoot={fsRoot}
            onBrowserRequest={handleBrowserRequest}
          />
        </div>
      </div>
    </div>
  );
};
