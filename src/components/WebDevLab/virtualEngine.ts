import {
  VirtualDirectory,
  VirtualFile,
  VirtualMySQLDatabase,
  WebLabErrorCategory,
  ProactiveNudge,
} from './types';
import {
  DOCROOT_PATH,
  normalizeVirtualPath,
  findNodeByPath,
  getDirectoryEntries,
} from './virtualFileSystem';

export const INITIAL_MYSQL_DB: VirtualMySQLDatabase = {
  students: [
    { id: 101, name: 'Alice Chen', email: 'alice.chen@university.edu', major: 'Computer Science', gpa: 3.92 },
    { id: 102, name: 'Bob Martinez', email: 'bob.m@university.edu', major: 'Computer Engineering', gpa: 3.65 },
    { id: 103, name: 'Carol Danvers', email: 'carol.d@university.edu', major: 'Software Engineering', gpa: 3.88 },
    { id: 104, name: 'David Kim', email: 'david.k@university.edu', major: 'Data Science', gpa: 3.45 },
  ],
  courses: [
    { id: 301, code: 'CSE301', title: 'Web Application Development', credits: 4, department: 'CSE' },
    { id: 302, code: 'CSE302', title: 'Relational Database Architecture', credits: 4, department: 'CSE' },
    { id: 303, code: 'CSE303', title: 'Computer Systems & Sockets', credits: 3, department: 'CSE' },
  ],
};

export interface ExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
  detectedError?: {
    category: WebLabErrorCategory;
    title: string;
    description: string;
    nudge: ProactiveNudge;
  };
}

export function executeCommand(
  cmdLine: string,
  cwd: string,
  fsRoot: VirtualDirectory,
  db: VirtualMySQLDatabase = INITIAL_MYSQL_DB,
  isMySQLMode: boolean = false,
  tier: number = 1
): { result: ExecutionResult; newCwd: string; newIsMySQLMode: boolean } {
  const trimmed = cmdLine.trim();
  if (!trimmed) {
    return { result: { output: '', exitCode: 0 }, newCwd: cwd, newIsMySQLMode: isMySQLMode };
  }

  // Interactive MySQL Mode
  if (isMySQLMode) {
    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
      return {
        result: { output: 'Bye', exitCode: 0 },
        newCwd: cwd,
        newIsMySQLMode: false,
      };
    }
    return {
      result: executeMySQLQuery(trimmed, db, tier),
      newCwd: cwd,
      newIsMySQLMode: true,
    };
  }

  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case 'help': {
      const helpText = [
        'CogniCSE Virtual Windows Shell (simulated Apache & MySQL Environment)',
        '---------------------------------------------------------------------',
        'Available commands:',
        '  cd <path>        Change current working directory (e.g. cd C:\\xampp\\htdocs)',
        '  dir | ls         List files and directories in current working directory',
        '  pwd              Print current working directory',
        '  type | cat <f>   Display contents of a file',
        '  mkdir <dir>      Create a new directory',
        '  php <file>       Run PHP script via the virtual Zend Engine runtime',
        '  mysql -u root    Launch interactive MySQL client session',
        '  cls | clear      Clear terminal screen output',
        '  help             Show this reference table',
        '',
        'Environment: Apache DocumentRoot is set to C:\\xampp\\htdocs',
      ].join('\n');
      return { result: { output: helpText, exitCode: 0 }, newCwd: cwd, newIsMySQLMode: false };
    }

    case 'pwd': {
      return { result: { output: cwd, exitCode: 0 }, newCwd: cwd, newIsMySQLMode: false };
    }

    case 'cd': {
      const target = args[0] || 'C:\\xampp\\htdocs';
      let resolved = target;

      if (target === '..') {
        const lastSlash = cwd.lastIndexOf('\\');
        resolved = lastSlash > 2 ? cwd.substring(0, lastSlash) : 'C:';
      } else if (!target.startsWith('C:') && !target.startsWith('c:')) {
        resolved = `${cwd}\\${target}`;
      }

      resolved = normalizeVirtualPath(resolved);
      const node = findNodeByPath(fsRoot, resolved);

      if (!node || !node.isDirectory) {
        const isOutside = !resolved.toLowerCase().startsWith('c:\\xampp\\htdocs');
        const nudge: ProactiveNudge = {
          id: `ndg_${Date.now()}`,
          tier,
          title: 'Path Resolution Diagnosis',
          message: `The system cannot find directory "${target}". Look at your current path: ${cwd}.`,
          socraticQuestion: 'Where in the directory tree does your web project live, and what is its absolute path from C:?',
          errorCategory: 'directory_error',
          timestamp: new Date().toLocaleTimeString(),
        };

        return {
          result: {
            output: `The system cannot find the path specified: ${target}`,
            exitCode: 1,
            detectedError: {
              category: 'directory_error',
              title: 'Invalid Directory Path',
              description: `Cannot cd to ${target}`,
              nudge,
            },
          },
          newCwd: cwd,
          newIsMySQLMode: false,
        };
      }

      return { result: { output: '', exitCode: 0 }, newCwd: resolved, newIsMySQLMode: false };
    }

    case 'dir':
    case 'ls': {
      const entries = getDirectoryEntries(fsRoot, cwd);
      const lines = [
        ` Volume in drive C has no label.`,
        ` Directory of ${cwd}`,
        '',
      ];

      entries.forEach(entry => {
        const dateStr = '2026-11-02  12:00 PM';
        const typeStr = entry.isDirectory ? '<DIR>          ' : '     ';
        const sizeStr = entry.isDirectory ? '       ' : `${(entry as VirtualFile).content.length.toString().padStart(7, ' ')} bytes `;
        lines.push(`${dateStr}  ${typeStr} ${sizeStr} ${entry.name}`);
      });

      lines.push('');
      lines.push(`       ${entries.length} File(s) / Dir(s) listed`);
      return { result: { output: lines.join('\n'), exitCode: 0 }, newCwd: cwd, newIsMySQLMode: false };
    }

    case 'type':
    case 'cat': {
      if (args.length === 0) {
        return { result: { output: 'The syntax of the command is incorrect. Usage: type <filename>', exitCode: 1 }, newCwd: cwd, newIsMySQLMode: false };
      }
      const fname = args[0];
      const fullPath = fname.includes(':') ? normalizeVirtualPath(fname) : normalizeVirtualPath(`${cwd}\\${fname}`);
      const node = findNodeByPath(fsRoot, fullPath);

      if (!node || node.isDirectory) {
        return {
          result: { output: `File not found - ${fname}`, exitCode: 1 },
          newCwd: cwd,
          newIsMySQLMode: false,
        };
      }

      return { result: { output: (node as VirtualFile).content, exitCode: 0 }, newCwd: cwd, newIsMySQLMode: false };
    }

    case 'mkdir': {
      if (args.length === 0) {
        return { result: { output: 'Usage: mkdir <directory_name>', exitCode: 1 }, newCwd: cwd, newIsMySQLMode: false };
      }
      return { result: { output: `Directory created: ${args[0]}`, exitCode: 0 }, newCwd: cwd, newIsMySQLMode: false };
    }

    case 'mysql': {
      const userArgIdx = args.indexOf('-u');
      const user = userArgIdx !== -1 ? args[userArgIdx + 1] : undefined;

      if (!user || user !== 'root') {
        const nudge: ProactiveNudge = {
          id: `ndg_${Date.now()}`,
          tier,
          title: 'Database Authentication Credentials',
          message: 'Access denied for MySQL user. Standard development servers configure an administrative root account without a password by default.',
          socraticQuestion: 'What command-line flag assigns the administrative user when connecting to MySQL via CLI?',
          errorCategory: 'db_connection',
          timestamp: new Date().toLocaleTimeString(),
        };
        return {
          result: {
            output: 'ERROR 1045 (28000): Access denied for user (using password: NO)',
            exitCode: 1,
            detectedError: {
              category: 'db_connection',
              title: 'Access Denied',
              description: 'MySQL connection refused without valid user flag',
              nudge,
            },
          },
          newCwd: cwd,
          newIsMySQLMode: false,
        };
      }

      const welcome = [
        'Welcome to the MariaDB/MySQL monitor. Commands end with ; or \\g.',
        'Server version: 10.4.28-MariaDB Source distribution',
        'Database connection active on TCP port 3306.',
        'Type \'help;\' or \'\\h\' for help. Type \'exit\' or \'quit\' to leave.',
      ].join('\n');

      return { result: { output: welcome, exitCode: 0 }, newCwd: cwd, newIsMySQLMode: true };
    }

    case 'php': {
      if (args.length === 0) {
        return { result: { output: 'Usage: php <filename.php>', exitCode: 1 }, newCwd: cwd, newIsMySQLMode: false };
      }
      const fname = args[0];
      const targetPath = fname.includes(':') ? normalizeVirtualPath(fname) : normalizeVirtualPath(`${cwd}\\${fname}`);
      const node = findNodeByPath(fsRoot, targetPath);

      if (!node || node.isDirectory) {
        const nudge: ProactiveNudge = {
          id: `ndg_${Date.now()}`,
          tier,
          title: 'PHP Script Not Found in Path',
          message: `Could not open input file: ${fname}. Current directory is ${cwd}.`,
          socraticQuestion: 'Which directory is your terminal currently in, versus where your PHP script was saved?',
          errorCategory: 'directory_error',
          timestamp: new Date().toLocaleTimeString(),
        };
        return {
          result: {
            output: `Could not open input file: ${fname}`,
            exitCode: 1,
            detectedError: {
              category: 'directory_error',
              title: 'Missing File',
              description: `php could not find ${fname}`,
              nudge,
            },
          },
          newCwd: cwd,
          newIsMySQLMode: false,
        };
      }

      const fileContent = (node as VirtualFile).content;
      return {
        result: executePHPScript(fileContent, targetPath, db, tier),
        newCwd: cwd,
        newIsMySQLMode: false,
      };
    }

    case 'cls':
    case 'clear': {
      return { result: { output: '__CLEAR__', exitCode: 0 }, newCwd: cwd, newIsMySQLMode: false };
    }

    default:
      return {
        result: {
          output: `'${command}' is not recognized as an internal or external command, operable program or batch file. Type 'help' for available commands.`,
          exitCode: 1,
        },
        newCwd: cwd,
        newIsMySQLMode: false,
      };
  }
}

export function executeMySQLQuery(query: string, db: VirtualMySQLDatabase, tier: number): ExecutionResult {
  const clean = query.trim().replace(/;$/, '');
  const lower = clean.toLowerCase();

  if (lower.startsWith('show databases')) {
    return {
      output: '+--------------------+\n| Database           |\n+--------------------+\n| information_schema |\n| mysql              |\n| performance_schema |\n| university_cse     |\n+--------------------+\n4 rows in set (0.001 sec)',
      exitCode: 0,
    };
  }

  if (lower.startsWith('show tables') || lower === 'tables') {
    return {
      output: '+--------------------------+\n| Tables_in_university_cse |\n+--------------------------+\n| courses                  |\n| students                 |\n+--------------------------+\n2 rows in set (0.001 sec)',
      exitCode: 0,
    };
  }

  if (lower.startsWith('select * from students') || lower.startsWith('select * from `students`')) {
    const lines = [
      '+-----+-----------------+------------------------------+----------------------+------+',
      '| id  | name            | email                        | major                | gpa  |',
      '+-----+-----------------+------------------------------+----------------------+------+',
    ];
    db.students.forEach(s => {
      lines.push(`| ${s.id.toString().padEnd(3)} | ${s.name.padEnd(15)} | ${s.email.padEnd(28)} | ${s.major.padEnd(20)} | ${s.gpa.toFixed(2)} |`);
    });
    lines.push('+-----+-----------------+------------------------------+----------------------+------+');
    lines.push(`${db.students.length} rows in set (0.002 sec)`);
    return { output: lines.join('\n'), exitCode: 0 };
  }

  if (lower.startsWith('select * from courses')) {
    const lines = [
      '+-----+--------+------------------------------------+---------+------------+',
      '| id  | code   | title                              | credits | department |',
      '+-----+--------+------------------------------------+---------+------------+',
    ];
    db.courses.forEach(c => {
      lines.push(`| ${c.id.toString().padEnd(3)} | ${c.code.padEnd(6)} | ${c.title.padEnd(34)} | ${c.credits.toString().padEnd(7)} | ${c.department.padEnd(10)} |`);
    });
    lines.push('+-----+--------+------------------------------------+---------+------------+');
    lines.push(`${db.courses.length} rows in set (0.002 sec)`);
    return { output: lines.join('\n'), exitCode: 0 };
  }

  // Syntax or unsupported query
  return {
    output: `Query OK, 0 rows affected (0.001 sec) [Executed: ${clean}]`,
    exitCode: 0,
  };
}

export function executePHPScript(
  code: string,
  filePath: string,
  db: VirtualMySQLDatabase,
  tier: number
): ExecutionResult {
  // Check for basic syntax mistakes
  if (!code.includes('<?php')) {
    return {
      output: code, // Plain text rendered
      exitCode: 0,
    };
  }

  // Check PDO usage
  const hasPDO = /new\s+PDO\s*\(/i.test(code);

  if (hasPDO) {
    // Check port 80 trap
    const hasPort80 = /port\s*=\s*['"]?80['"]?/i.test(code) || /localhost:80/i.test(code);
    if (hasPort80) {
      const nudge: ProactiveNudge = {
        id: `ndg_${Date.now()}`,
        tier,
        title: 'TCP Port Collision Misconception',
        message: 'PDOException: SQLSTATE[HY000] [2002] Connection refused. The MySQL daemon does not communicate across port 80.',
        socraticQuestion: 'Port 80 is reserved for HTTP web server traffic. What is the standard IANA port designated for MySQL/MariaDB database sockets?',
        errorCategory: 'db_connection',
        timestamp: new Date().toLocaleTimeString(),
      };

      return {
        output: `Fatal error: Uncaught PDOException: SQLSTATE[HY000] [2002] Connection refused in ${filePath}:14\nStack trace:\n#0 ${filePath}(14): PDO->__construct('mysql:host=loca...', 'root', '')\n#1 {main}\n  thrown in ${filePath} on line 14`,
        exitCode: 1,
        detectedError: {
          category: 'db_connection',
          title: 'MySQL Port Mismatch (Port 80 vs 3306)',
          description: 'Port 80 specified for MySQL connection',
          nudge,
        },
      };
    }

    // Check wrong credentials
    const hasWrongUser = /user\s*=\s*['"](?!root['"])[^'"]+['"]/i.test(code);
    if (hasWrongUser) {
      return {
        output: `Fatal error: Uncaught PDOException: SQLSTATE[HY000] [1045] Access denied for user in ${filePath}:14`,
        exitCode: 1,
      };
    }

    // Check for string concatenation SQL injection anti-pattern
    const hasConcatInQuery =
      (/\$sql\s*=.*?\.\s*\$/s.test(code) ||
        /\$sql\s*=.*?\$[a-zA-Z_]/s.test(code) ||
        /query\s*\(.*?\.\s*\$/s.test(code)) &&
      /SELECT/i.test(code);
    const hasPreparedStatement = /->prepare\s*\(/i.test(code) && /->execute\s*\(/i.test(code);

    if (hasConcatInQuery && !hasPreparedStatement) {
      const nudge: ProactiveNudge = {
        id: `ndg_${Date.now()}`,
        tier,
        title: 'SQL String Concatenation Vulnerability',
        message: 'Warning: Direct variable concatenation into SQL string detected. This exposes your database query to SQL injection exploits.',
        socraticQuestion: 'How does PDO::prepare() with placeholders (:id or ?) protect query execution compared to raw string concatenation?',
        errorCategory: 'sql_query',
        timestamp: new Date().toLocaleTimeString(),
      };

      return {
        output: `Connected successfully to MySQL database 'university_cse' on port 3306!\n\n[Security Alert]: Insecure SQL Query Construction detected:\nRaw interpolation allows injection bypass. Use $pdo->prepare() and $stmt->execute().\n\nFetched 1 record(s) via raw string interpolation.`,
        exitCode: 0,
        detectedError: {
          category: 'sql_query',
          title: 'Unescaped SQL Query',
          description: 'Concatenated input instead of prepared statement',
          nudge,
        },
      };
    }

    if (hasPreparedStatement) {
      return {
        output: `Connected successfully to MySQL database 'university_cse' on port 3306!\nPrepared statement compiled.\nExecuting query with bound parameters...\nSuccess: Retrieved 4 student record(s) securely via PDO::FETCH_ASSOC.`,
        exitCode: 0,
      };
    }

    return {
      output: `Connected successfully to MySQL database on TCP port 3306!`,
      exitCode: 0,
    };
  }

  // General PHP output
  const echoMatches = code.match(/echo\s+['"]([^'"]+)['"]/g);
  if (echoMatches) {
    const outputs = echoMatches.map(m => m.replace(/echo\s+['"]/, '').replace(/['"]$/, ''));
    return {
      output: outputs.join('\n'),
      exitCode: 0,
    };
  }

  return {
    output: 'PHP script executed successfully with 0 warnings.',
    exitCode: 0,
  };
}
