import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialFileSystem,
  findNodeByPath,
  writeVirtualFile,
  DOCROOT_PATH,
  DESKTOP_PATH,
} from '../src/components/WebDevLab/virtualFileSystem.js';
import {
  executeCommand,
  executePHPScript,
  executeMySQLQuery,
  INITIAL_MYSQL_DB,
} from '../src/components/WebDevLab/virtualEngine.js';

describe('Web Dev Practical Lab - Virtual Environment', () => {
  it('creates initial virtual file system with Apache DocumentRoot and user folders', () => {
    const fs = createInitialFileSystem();
    const htdocs = findNodeByPath(fs, DOCROOT_PATH);
    assert.ok(htdocs, 'C:\\xampp\\htdocs should exist');
    assert.equal(htdocs?.isDirectory, true);

    const desktop = findNodeByPath(fs, DESKTOP_PATH);
    assert.ok(desktop, 'C:\\Users\\Student\\Desktop should exist');
    assert.equal(desktop?.isDirectory, true);
  });

  it('detects saving file to Desktop vs DocumentRoot', () => {
    const fs = createInitialFileSystem();

    // Saving to Desktop
    const desktopSave = writeVirtualFile(
      fs,
      `${DESKTOP_PATH}\\index.html`,
      '<h1>Hello from Desktop</h1>'
    );
    assert.equal(desktopSave.success, true);
    const desktopFile = findNodeByPath(fs, `${DESKTOP_PATH}\\index.html`);
    assert.ok(desktopFile, 'File should exist on Desktop');

    // DocumentRoot should NOT have index.html yet
    const docrootBefore = findNodeByPath(fs, `${DOCROOT_PATH}\\index.html`);
    assert.equal(docrootBefore, null, 'index.html should not yet be in DocumentRoot');

    // Saving to DocumentRoot
    const docrootSave = writeVirtualFile(
      fs,
      `${DOCROOT_PATH}\\index.html`,
      '<h1>Hello from Apache</h1>'
    );
    assert.equal(docrootSave.success, true);
    const docrootFile = findNodeByPath(fs, `${DOCROOT_PATH}\\index.html`);
    assert.ok(docrootFile, 'File should exist in DocumentRoot');
  });

  it('runs command emulator: help, pwd, dir, cd, type', () => {
    const fs = createInitialFileSystem();
    const cwd = DOCROOT_PATH;

    // help
    const helpRes = executeCommand('help', cwd, fs);
    assert.equal(helpRes.result.exitCode, 0);
    assert.ok(helpRes.result.output.includes('CogniCSE Virtual Windows Shell'));

    // pwd
    const pwdRes = executeCommand('pwd', cwd, fs);
    assert.equal(pwdRes.result.output, DOCROOT_PATH);

    // dir
    const dirRes = executeCommand('dir', cwd, fs);
    assert.equal(dirRes.result.exitCode, 0);
    assert.ok(dirRes.result.output.includes('welcome.html'));

    // cd to Desktop
    const cdRes = executeCommand(`cd ${DESKTOP_PATH}`, cwd, fs);
    assert.equal(cdRes.result.exitCode, 0);
    assert.equal(cdRes.newCwd, DESKTOP_PATH);

    // cd to non-existent path triggers directory_error
    const badCd = executeCommand('cd C:\\nonexistent\\folder', cwd, fs);
    assert.equal(badCd.result.exitCode, 1);
    assert.equal(badCd.result.detectedError?.category, 'directory_error');
  });

  it('executes MySQL interactive client and queries students & courses tables', () => {
    const fs = createInitialFileSystem();
    const cwd = DOCROOT_PATH;

    // mysql without root
    const failRes = executeCommand('mysql', cwd, fs);
    assert.equal(failRes.result.exitCode, 1);
    assert.equal(failRes.result.detectedError?.category, 'db_connection');

    // mysql with root user
    const loginRes = executeCommand('mysql -u root', cwd, fs);
    assert.equal(loginRes.result.exitCode, 0);
    assert.equal(loginRes.newIsMySQLMode, true);

    // query students table
    const queryStudents = executeMySQLQuery('SELECT * FROM students;', INITIAL_MYSQL_DB, 1);
    assert.ok(queryStudents.output.includes('Alice Chen'));
    assert.ok(queryStudents.output.includes('Computer Science'));

    // query courses table
    const queryCourses = executeMySQLQuery('SELECT * FROM courses;', INITIAL_MYSQL_DB, 1);
    assert.ok(queryCourses.output.includes('CSE301'));
    assert.ok(queryCourses.output.includes('Web Application Development'));
  });

  it('detects PHP PDO Port 80 trap and raises Connection Refused', () => {
    const buggyCode = `<?php
$host = 'localhost';
$port = '80'; // TRAP
$db   = 'university_cse';
$pdo = new PDO("mysql:host=$host;port=$port;dbname=$db", 'root', '');
echo "Connected!";
?>`;

    const result = executePHPScript(buggyCode, 'C:\\xampp\\htdocs\\db.php', INITIAL_MYSQL_DB, 1);
    assert.equal(result.exitCode, 1);
    assert.ok(result.output.includes('PDOException'));
    assert.ok(result.output.includes('Connection refused'));
    assert.equal(result.detectedError?.category, 'db_connection');
  });

  it('accepts correct PHP PDO connection on port 3306', () => {
    const correctCode = `<?php
$host = 'localhost';
$port = '3306';
$db   = 'university_cse';
$pdo = new PDO("mysql:host=$host;port=$port;dbname=$db", 'root', '');
echo "Connected!";
?>`;

    const result = executePHPScript(correctCode, 'C:\\xampp\\htdocs\\db.php', INITIAL_MYSQL_DB, 1);
    assert.equal(result.exitCode, 0);
    assert.ok(result.output.includes('Connected successfully'));
  });

  it('detects raw SQL string concatenation and recommends prepared statements', () => {
    const vulnerableCode = `<?php
$pdo = new PDO("mysql:host=localhost;port=3306;dbname=university_cse", 'root', '');
$userMajor = "Computer Science";
$sql = "SELECT * FROM students WHERE major = '" . $userMajor . "'";
$res = $pdo->query($sql);
?>`;

    const result = executePHPScript(vulnerableCode, 'C:\\xampp\\htdocs\\query.php', INITIAL_MYSQL_DB, 1);
    assert.equal(result.detectedError?.category, 'sql_query');
    assert.ok(result.detectedError?.nudge.socraticQuestion.includes('prepare()'));

    const preparedCode = `<?php
$pdo = new PDO("mysql:host=localhost;port=3306;dbname=university_cse", 'root', '');
$stmt = $pdo->prepare("SELECT * FROM students WHERE major = ?");
$stmt->execute(['Computer Science']);
?>`;

    const secureResult = executePHPScript(preparedCode, 'C:\\xampp\\htdocs\\query.php', INITIAL_MYSQL_DB, 1);
    assert.equal(secureResult.exitCode, 0);
    assert.ok(secureResult.output.includes('Prepared statement compiled'));
  });
});
