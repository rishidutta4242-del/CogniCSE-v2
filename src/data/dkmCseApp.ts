import { DKMNode } from "../types";

export const CSE_APP_NODES: DKMNode[] = [
  // --- TRACK: Web Application Development ---
  {
    id: 'pdo_mysql_port',
    name: 'PHP PDO & MySQL Port Configuration',
    domain: 'cse',
    track: 'Web Application Development',
    category: 'Database Connectivity',
    description: 'Configuring TCP socket bindings and standard port numbers for PDO database connection strings.',
    keyConcept: 'MySQL daemon listens on TCP port 3306 by default, whereas port 80 is reserved for standard HTTP web traffic.',
    typicalTrap: 'Specifying port 80 or web ports inside the PDO DSN, triggering SQLSTATE[HY000] [2002] Connection refused.',
    codeLanguage: 'php',
    starterCodeSnippet: `<?php
// Attempting to establish a persistent PDO connection
$host = 'localhost';
$port = '80'; // <-- Look closely here
$db   = 'university_cse';
$user = 'root';
$pass = '';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db";
    $pdo = new PDO($dsn, $user, $pass);
    echo "Connected successfully to MySQL!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>`,
    starterErrorLog: 'Fatal error: Uncaught PDOException: SQLSTATE[HY000] [2002] Connection refused in /var/www/html/db.php:12\nStack trace:\n#0 /var/www/html/db.php(12): PDO->__construct(\'mysql:host=loca...\', \'root\', \'\')\n#1 {main}',
    prerequisites: ['Client-Server Architecture', 'TCP/IP Sockets', 'HTTP vs MySQL Protocols'],
    status: 'RED',
    mastery: 0.25,
    errorCount: 3,
    solvedCount: 0,
  },
  {
    id: 'http_statelessness',
    name: 'HTTP Statelessness & Session Tokens',
    domain: 'cse',
    track: 'Web Application Development',
    category: 'Web Architecture',
    description: 'Understanding how HTTP handles request-response boundaries without native session persistence.',
    keyConcept: 'Every HTTP transaction is isolated. Application state requires client-side tokens, cookies, or database session identifiers.',
    typicalTrap: 'Assuming a backend global variable automatically remembers an authenticated user across distinct browser tabs without cookie verification.',
    codeLanguage: 'javascript',
    starterCodeSnippet: `// Server-side route handler
let globalLoggedInUser = null; // Anti-pattern!

app.post('/api/login', (req, res) => {
  globalLoggedInUser = req.body.username; // Leaks state across all concurrent users!
  res.json({ status: "Logged in as " + globalLoggedInUser });
});

app.get('/api/profile', (req, res) => {
  // Bug: Every user now sees whoever logged in last!
  res.json({ user: globalLoggedInUser });
});`,
    starterErrorLog: 'Security Alert: Race condition and state bleed detected. Concurrent session #402 overwritten by session #403 in global scope.',
    prerequisites: ['HTTP Request Lifecycle', 'Variable Scope in Node.js'],
    status: 'YELLOW',
    mastery: 0.50,
    errorCount: 1,
    solvedCount: 1,
  },
  {
    id: 'async_event_loop',
    name: 'JavaScript Event Loop & Microtasks',
    domain: 'cse',
    track: 'Web Application Development',
    category: 'Async Runtime',
    description: 'Order of execution between synchronous code, microtask queue (Promises), and macrotask queue (setTimeout).',
    keyConcept: 'The call stack clears synchronous frames first, then executes the microtask queue completely before dequeuing macrotasks.',
    typicalTrap: 'Expecting setTimeout(fn, 0) to execute before a Promise.resolve().then() callback.',
    codeLanguage: 'javascript',
    starterCodeSnippet: `console.log("A: Start");

setTimeout(() => {
  console.log("B: Macrotask Timer");
}, 0);

Promise.resolve().then(() => {
  console.log("C: Microtask Promise");
});

console.log("D: End");
// Predicted order vs actual order?`,
    starterErrorLog: 'Assertion Error: Expected output ["A", "B", "C", "D"], but received ["A", "D", "C", "B"].',
    prerequisites: ['Call Stack', 'Callback Functions', 'Promises'],
    status: 'GREEN',
    mastery: 0.85,
    errorCount: 0,
    solvedCount: 4,
  },
  {
    id: 'sql_injection_defense',
    name: 'SQL Prepared Statements vs Concatenation',
    domain: 'cse',
    track: 'Web Application Development',
    category: 'Database Security',
    description: 'Preventing SQL injection via parametrized queries instead of raw string interpolation.',
    keyConcept: 'Prepared statements separate SQL syntax compilation from literal user data, neutralizing payload injection.',
    typicalTrap: 'Using string concatenation `WHERE username = \'" . $user . "\'` which allows `\' OR 1=1 --`.',
    codeLanguage: 'php',
    starterCodeSnippet: `<?php
// Vulnerable query construction
$userInput = "admin' OR '1'='1";
$sql = "SELECT * FROM users WHERE username = '" . $userInput . "'";
// Executing raw SQL directly allows full authentication bypass!
?>`,
    starterErrorLog: 'Security Vulnerability: SQL Injection detected. Query evaluates to TRUE regardless of user authentication credentials.',
    prerequisites: ['SQL Queries', 'String Escaping'],
    status: 'YELLOW',
    mastery: 0.60,
    errorCount: 1,
    solvedCount: 2,
  },
  {
    id: 'rest_http_verbs',
    name: 'RESTful API Verbs & Idempotence',
    domain: 'cse',
    track: 'Web Application Development',
    category: 'API Design',
    description: 'Appropriate semantic use of GET, POST, PUT, PATCH, and DELETE with idempotency guarantees.',
    keyConcept: 'GET, PUT, and DELETE must be idempotent (multiple identical requests yield same server state); POST creates new resources.',
    typicalTrap: 'Using GET requests to delete database records via hyperlink query parameters.',
    codeLanguage: 'javascript',
    starterCodeSnippet: `// Flawed API design
app.get('/api/delete-user', (req, res) => {
  // Web crawlers following links will inadvertently delete accounts!
  deleteUser(req.query.id);
  res.send("User deleted");
});`,
    starterErrorLog: 'Semantic Warning: Mutating state via HTTP GET violates RFC 7231 idempotency specifications.',
    prerequisites: ['HTTP Methods', 'Resource URIs'],
    status: 'GREEN',
    mastery: 0.90,
    errorCount: 0,
    solvedCount: 5,
  },
  {
    id: 'cors_preflight',
    name: 'CORS Preflight & Header Negotiation',
    domain: 'cse',
    track: 'Web Application Development',
    category: 'Browser Security',
    description: 'How browsers enforce the Same-Origin Policy and trigger HTTP OPTIONS preflight checks.',
    keyConcept: 'Non-simple cross-origin HTTP requests require an OPTIONS preflight exchange before the browser issues the actual payload.',
    typicalTrap: 'Disabling CORS entirely on production or failing to respond with Access-Control-Allow-Methods.',
    codeLanguage: 'javascript',
    starterCodeSnippet: `// Client fetch on https://app.example.com
fetch('https://api.backend.com/data', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer 123', 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: "book" })
});`,
    starterErrorLog: 'Access to fetch at \'https://api.backend.com/data\' has been blocked by CORS policy: Response to preflight request doesn\'t pass access control check.',
    prerequisites: ['Same-Origin Policy', 'HTTP Headers'],
    status: 'YELLOW',
    mastery: 0.65,
    errorCount: 2,
    solvedCount: 2,
  },

  // --- TRACK: Data Structures & Algorithms ---
  {
    id: 'recursion_base_case',
    name: 'Recursion Base Case & Stack Frames',
    domain: 'cse',
    track: 'Data Structures & Algorithms',
    category: 'Recursion & Dynamic Programming',
    description: 'Preventing infinite recursive descent by designing sound termination conditions.',
    keyConcept: 'Every recursive routine must evaluate a base case prior to making the next self-call; each step must strictly advance toward the base case.',
    typicalTrap: 'Decrementing the parameter incorrectly or omitting the stopping condition, exhausting call stack memory.',
    codeLanguage: 'python',
    starterCodeSnippet: `def compute_factorial(n):
    # Missing base case: what if n == 1 or n == 0?
    return n * compute_factorial(n - 1)

print(compute_factorial(5))`,
    starterErrorLog: 'RecursionError: maximum recursion depth exceeded while calling a Python object\nStack frame count: 1000+',
    prerequisites: ['Function Scope', 'Call Stack Mechanics'],
    status: 'RED',
    mastery: 0.30,
    errorCount: 4,
    solvedCount: 0,
  },
  {
    id: 'bst_invalidation',
    name: 'Binary Search Tree Property & Traversal',
    domain: 'cse',
    track: 'Data Structures & Algorithms',
    category: 'Trees & Graphs',
    description: 'Enforcing that for every node, all keys in the left subtree are strictly less, and all keys in the right subtree are greater.',
    keyConcept: 'Checking only direct children is insufficient; whole subtrees must abide by lower and upper bound constraints.',
    typicalTrap: 'Checking only `node.left.val < node.val` without propagating global ancestor bounds.',
    codeLanguage: 'javascript',
    starterCodeSnippet: `function isValidBST(root) {
  if (!root) return true;
  // Bug: Only checks direct immediate children!
  if (root.left && root.left.val >= root.val) return false;
  if (root.right && root.right.val <= root.val) return false;
  return isValidBST(root.left) && isValidBST(root.right);
}`,
    starterErrorLog: 'Failed Test Case: Tree [10, 5, 15, null, null, 6, 20] marked valid, but node 6 is in the right subtree of 10!',
    prerequisites: ['Tree Data Structures', 'Depth-First Search'],
    status: 'YELLOW',
    mastery: 0.55,
    errorCount: 2,
    solvedCount: 1,
  },
  {
    id: 'two_pointer_technique',
    name: 'Two-Pointer Technique & Array Slicing',
    domain: 'cse',
    track: 'Data Structures & Algorithms',
    category: 'Array Algorithms',
    description: 'Reducing time complexity from O(n^2) to O(n) on sorted arrays using convergent pointers.',
    keyConcept: 'Moving left/right pointers toward each other based on comparison against target sum.',
    typicalTrap: 'Forgetting to sort the array first, or advancing both pointers simultaneously.',
    codeLanguage: 'python',
    starterCodeSnippet: `def two_sum_sorted(arr, target):
    left = 0
    right = len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return (left, right)
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return None`,
    starterErrorLog: 'Runtime Verified: Passed all edge test cases with O(n) time and O(1) space.',
    prerequisites: ['Arrays', 'Time Complexity O(n)'],
    status: 'GREEN',
    mastery: 0.92,
    errorCount: 0,
    solvedCount: 6,
  },
  {
    id: 'graph_cycle_detection',
    name: 'Graph Cycle Detection (Directed vs Undirected)',
    domain: 'cse',
    track: 'Data Structures & Algorithms',
    category: 'Trees & Graphs',
    description: 'Detecting cycles using 3-color DFS (White/Gray/Black) or Disjoint Set Union (Union-Find).',
    keyConcept: 'In directed graphs, an edge to an ancestor in the active recursion call stack (Gray node) confirms a back-edge and cycle.',
    typicalTrap: 'Using a simple visited boolean array without distinguishing between active call ancestors and finished nodes.',
    codeLanguage: 'python',
    starterCodeSnippet: `def has_cycle_flawed(graph, node, visited):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor in visited:
            return True # False positive if neighbor was visited in a previously completed branch!
        if has_cycle_flawed(graph, neighbor, visited):
            return True
    return False`,
    starterErrorLog: 'False Positive: Marked diamond DAG (A->B, A->C, B->D, C->D) as cyclic when no cycle exists.',
    prerequisites: ['Depth-First Search', 'Directed Graphs'],
    status: 'RED',
    mastery: 0.35,
    errorCount: 3,
    solvedCount: 1,
  },
  {
    id: 'dp_memoization_table',
    name: 'Dynamic Programming: Overlapping Subproblems',
    domain: 'cse',
    track: 'Data Structures & Algorithms',
    category: 'Recursion & Dynamic Programming',
    description: 'Transforming exponential O(2^n) recursion into polynomial O(n) via memoization tables.',
    keyConcept: 'Memoization caches computed subproblem answers to avoid redundant re-computation of identical states.',
    typicalTrap: 'Not passing the memo dictionary across recursive branches or indexing memo keys with mutable objects.',
    codeLanguage: 'python',
    starterCodeSnippet: `def fib(n, memo={}):
    # Note on default mutable arguments in Python
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]`,
    starterErrorLog: 'Code Analysis: Memoization table functioning, but beware of shared default dictionary instances across test suites.',
    prerequisites: ['Recursion', 'Time Complexity Analysis'],
    status: 'GREEN',
    mastery: 0.88,
    errorCount: 1,
    solvedCount: 4,
  },
  {
    id: 'linked_list_fast_slow',
    name: 'Linked List Cycle: Floyd\'s Tortoise & Hare',
    domain: 'cse',
    track: 'Data Structures & Algorithms',
    category: 'Linked Lists',
    description: 'Detecting loops in linear pointer chains in O(n) time and O(1) auxiliary memory.',
    keyConcept: 'Slow pointer steps by 1; fast pointer steps by 2. If a cycle exists, they must collide within the loop.',
    typicalTrap: 'Dereferencing fast.next.next without verifying that fast.next is not null.',
    codeLanguage: 'javascript',
    starterCodeSnippet: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    starterErrorLog: 'Runtime Verified: Passed all edge cases including single-node cycles and null heads.',
    prerequisites: ['Pointers & References', 'Linked Lists'],
    status: 'GREEN',
    mastery: 0.95,
    errorCount: 0,
    solvedCount: 7,
  },

];