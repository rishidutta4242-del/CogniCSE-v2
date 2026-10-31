import { DKMNode } from '../types';

export const INITIAL_DKM_NODES: DKMNode[] = [
  // --- TRACK: Web Application Development ---
  {
    id: 'pdo_mysql_port',
    name: 'PHP PDO & MySQL Port Configuration',
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

  // --- TRACK: Operating Systems ---
  {
    id: 'deadlock_four_conditions',
    name: 'Deadlock: Coffman Conditions & Banker\'s Algorithm',
    track: 'Operating Systems',
    category: 'Concurrency & Synchronization',
    description: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait causing process lockup.',
    keyConcept: 'Deadlock cannot occur if at least one of the 4 Coffman conditions is broken (e.g., global lock ordering breaks Circular Wait).',
    typicalTrap: 'Acquiring locks in arbitrary order across multiple threads (Thread A: Lock1 then Lock2; Thread B: Lock2 then Lock1).',
    codeLanguage: 'cpp',
    starterCodeSnippet: `// Thread 1
std::lock_guard<std::mutex> l1(mutexA);
std::lock_guard<std::mutex> l2(mutexB);

// Thread 2 (Opposite order!)
std::lock_guard<std::mutex> l3(mutexB);
std::lock_guard<std::mutex> l4(mutexA);`,
    starterErrorLog: 'Deadlock Detected: Thread 1 waiting on mutexB held by Thread 2. Thread 2 waiting on mutexA held by Thread 1. Circular Wait condition satisfied.',
    prerequisites: ['Threads & Processes', 'Mutex Locks'],
    status: 'RED',
    mastery: 0.28,
    errorCount: 3,
    solvedCount: 0,
  },
  {
    id: 'virtual_memory_paging',
    name: 'Virtual Memory, Page Tables & TLB Thrashing',
    track: 'Operating Systems',
    category: 'Memory Management',
    description: 'Translating virtual addresses to physical frames via multi-level page tables and hardware TLB cache.',
    keyConcept: 'Page faults occur when a requested page is not in physical RAM (present bit = 0), triggering an OS disk swap.',
    typicalTrap: 'Confusing page size with total frame count, or traversing a large matrix in column-major order causing repeated cache misses.',
    codeLanguage: 'cpp',
    starterCodeSnippet: `// Column-major traversal of row-major allocated 2D array
int matrix[4096][4096];
for (int col = 0; col < 4096; col++) {
    for (int row = 0; row < 4096; row++) {
        matrix[row][col] = 0; // Triggers a page fault / cache miss on almost every access!
    }
}`,
    starterErrorLog: 'Performance Telemetry: Page fault rate: 89.4%. Severe cache thrashing and memory bus saturation observed.',
    prerequisites: ['Physical Memory', 'Cache Locality (Spatial/Temporal)'],
    status: 'YELLOW',
    mastery: 0.45,
    errorCount: 2,
    solvedCount: 1,
  },
  {
    id: 'process_fork_exec',
    name: 'Process Creation: fork(), exec(), and waitpid()',
    track: 'Operating Systems',
    category: 'Process Management',
    description: 'Copy-on-write memory replication and child process lifecycle management in POSIX Unix systems.',
    keyConcept: 'fork() returns 0 to the child process and the child\'s PID to the parent process; both resume execution from the fork instruction.',
    typicalTrap: 'Forgetting to call wait() or waitpid() in the parent, creating zombie processes in the process table.',
    codeLanguage: 'cpp',
    starterCodeSnippet: `pid_t pid = fork();
if (pid == 0) {
    // Child process
    execlp("/bin/ls", "ls", NULL);
} else {
    // Parent process forgets wait(NULL)!
    printf("Parent finished immediately without reaping child\\n");
}`,
    starterErrorLog: 'Warning: Process with PID 1842 entered <defunct> zombie state. Parent did not reap exit status.',
    prerequisites: ['POSIX System Calls', 'Process States'],
    status: 'YELLOW',
    mastery: 0.62,
    errorCount: 1,
    solvedCount: 2,
  },
  {
    id: 'cpu_scheduling_preemption',
    name: 'CPU Scheduling: Round Robin & Quantum Sizing',
    track: 'Operating Systems',
    category: 'Scheduling',
    description: 'Preemptive time-sliced CPU allocation balancing throughput and interactive response time.',
    keyConcept: 'A tiny time quantum causes excessive context-switch overhead; an excessively large quantum degenerates into FCFS.',
    typicalTrap: 'Ignoring context switch latency when calculating CPU utilization and average turnaround time.',
    codeLanguage: 'python',
    starterCodeSnippet: `def round_robin_time(quantum, switch_overhead, tasks):
    # If quantum = 1ms and switch_overhead = 1ms, CPU efficiency is only 50%!
    effective_utilization = quantum / (quantum + switch_overhead)
    return effective_utilization`,
    starterErrorLog: 'Calculation Verified: Correctly models time slicing trade-off.',
    prerequisites: ['Context Switching', 'Process States'],
    status: 'GREEN',
    mastery: 0.82,
    errorCount: 0,
    solvedCount: 3,
  },
  {
    id: 'pointers_memory_leak',
    name: 'C/C++ Dynamic Memory & Heap Deallocation',
    track: 'Operating Systems',
    category: 'Memory Management',
    description: 'Manual memory management using malloc/free or new/delete; avoiding leaks and dangling pointers.',
    keyConcept: 'Every byte allocated on the heap remains reserved until explicitly freed. Loss of pointer reference causes irreversible memory leakage.',
    typicalTrap: 'Reassigning a pointer variable without calling `free()`, making the allocated chunk unrecoverable.',
    codeLanguage: 'cpp',
    starterCodeSnippet: `void processUserData() {
    int* buffer = (int*)malloc(1024 * sizeof(int));
    // Buffer is populated...
    // Function exits without free(buffer)! Pointer vanishes, heap memory remains locked.
}`,
    starterErrorLog: 'Valgrind Memcheck: 4,096 bytes in 1 blocks are definitely lost in loss record 1 of 1 at malloc().',
    prerequisites: ['Pointers', 'Stack vs Heap'],
    status: 'RED',
    mastery: 0.38,
    errorCount: 3,
    solvedCount: 1,
  },
  {
    id: 'semaphores_producer_consumer',
    name: 'Semaphores & Producer-Consumer Bounded Buffer',
    track: 'Operating Systems',
    category: 'Concurrency & Synchronization',
    description: 'Counting semaphores for tracking empty/full buffer slots and binary semaphores for mutex protection.',
    keyConcept: 'Empty semaphore starts at N; Full semaphore starts at 0; Mutex protects the critical section during enqueue/dequeue.',
    typicalTrap: 'Placing the mutex wait BEFORE the empty/full wait, causing immediate deadlock when the buffer is empty.',
    codeLanguage: 'cpp',
    starterCodeSnippet: `// Flawed Producer ordering:
wait(mutex); // Acquired mutex first!
wait(empty_slots); // Deadlock if buffer is full: producer holds mutex while sleeping!
// insert_item();
signal(mutex);
signal(full_slots);`,
    starterErrorLog: 'Concurrency Deadlock: Producer thread holding buffer mutex while blocked on empty_slots. Consumer cannot access buffer to consume!',
    prerequisites: ['Race Conditions', 'Atomic Operations'],
    status: 'YELLOW',
    mastery: 0.48,
    errorCount: 2,
    solvedCount: 1,
  },

  // --- TRACK: Computer Networks ---
  {
    id: 'tcp_three_way_handshake',
    name: 'TCP 3-Way Handshake (SYN, SYN-ACK, ACK)',
    track: 'Computer Networks',
    category: 'Transport Layer',
    description: 'Establishing reliable full-duplex byte stream synchronization and sequence numbering.',
    keyConcept: 'Client sends SYN(seq=x); Server replies SYN(seq=y)-ACK(ack=x+1); Client concludes with ACK(ack=y+1).',
    typicalTrap: 'Believing UDP requires a handshake, or thinking TCP resets sequence numbers on every packet.',
    codeLanguage: 'python',
    starterCodeSnippet: `import socket
# Standard TCP Socket instantiation
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# Connect initiates the 3-way handshake kernel sequence
sock.connect(('127.0.0.1', 3306))
print("TCP Connection established with MySQL Server!")`,
    starterErrorLog: 'Connection Log: SYN [seq=100] -> SYN-ACK [seq=500, ack=101] -> ACK [ack=501]. Handshake complete.',
    prerequisites: ['OSI 7-Layer Model', 'IP Addressing'],
    status: 'GREEN',
    mastery: 0.88,
    errorCount: 0,
    solvedCount: 5,
  },
  {
    id: 'dns_recursive_resolution',
    name: 'DNS Hierarchical Resolution & TTL Caching',
    track: 'Computer Networks',
    category: 'Application Layer',
    description: 'Translating human-readable hostnames to IP addresses via Root, TLD, and Authoritative Name Servers.',
    keyConcept: 'Recursive resolvers query Root servers (.), then TLD servers (.com), then Authoritative servers before caching answers according to TTL.',
    typicalTrap: 'Assuming DNS queries always hit the authoritative server directly without local or ISP resolver caching.',
    codeLanguage: 'javascript',
    starterCodeSnippet: `// DNS lookup simulation
const domain = "api.university.edu";
// Resolution chain:
// 1. Browser cache -> 2. OS hosts file -> 3. Local Recursive Resolver ->
// 4. Root (.) -> 5. TLD (.edu) -> 6. Authoritative (university.edu)`,
    starterErrorLog: 'DNS Resolution Verified: Query returned A record 198.51.100.42 with TTL 300 seconds.',
    prerequisites: ['Client-Server Model', 'UDP Protocol'],
    status: 'GREEN',
    mastery: 0.92,
    errorCount: 0,
    solvedCount: 4,
  },
  {
    id: 'cidr_subnetting_mask',
    name: 'IPv4 CIDR Subnetting & Network/Broadcast IPs',
    track: 'Computer Networks',
    category: 'Network Layer',
    description: 'Calculating network ID, broadcast address, and usable host count using prefix lengths (e.g. /24, /27).',
    keyConcept: 'In a /27 subnet, 5 host bits provide 2^5 = 32 total addresses, minus 2 (network ID & broadcast) = 30 usable host IPs.',
    typicalTrap: 'Assigning the all-zeros network address or all-ones broadcast address as a static host IP to a server interface.',
    codeLanguage: 'python',
    starterCodeSnippet: `def calculate_usable_hosts(cidr_prefix):
    host_bits = 32 - cidr_prefix
    total_ips = 2 ** host_bits
    usable_hosts = total_ips - 2 # Subtract Network Address & Broadcast Address
    return usable_hosts

print(f"/27 Usable hosts: {calculate_usable_hosts(27)}")`,
    starterErrorLog: 'Subnet Validation: Passed. Note that /31 and /32 have specialized RFC point-to-point exceptions.',
    prerequisites: ['Binary Arithmetic', 'IP Addressing'],
    status: 'YELLOW',
    mastery: 0.58,
    errorCount: 1,
    solvedCount: 2,
  },
  {
    id: 'osi_transport_layer',
    name: 'Transport Layer: TCP vs UDP Multiplexing',
    track: 'Computer Networks',
    category: 'Transport Layer',
    description: 'Port-based multiplexing, reliability, flow control, and checksum validation across network protocols.',
    keyConcept: 'TCP prioritizes lossless ordered delivery (file transfer, web, database); UDP prioritizes low-latency real-time delivery (voice, video, gaming).',
    typicalTrap: 'Attempting to use raw UDP for database queries where packet loss would silently corrupt financial transactions.',
    codeLanguage: 'python',
    starterCodeSnippet: `import socket
# Creating an unconfirmed UDP datagram socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# Sendto fires packets without waiting for delivery confirmation
sock.sendto(b"PACKET_DATA", ("127.0.0.1", 9999))`,
    starterErrorLog: 'Socket Analysis: UDP packets transmitted. No acknowledgment received (stateless datagram semantics).',
    prerequisites: ['OSI Layering', 'Port Multiplexing'],
    status: 'YELLOW',
    mastery: 0.65,
    errorCount: 1,
    solvedCount: 2,
  },
  {
    id: 'tls_handshake_crypto',
    name: 'TLS 1.3 Asymmetric Handshake & Session Keys',
    track: 'Computer Networks',
    category: 'Network Security',
    description: 'How asymmetric cryptography (RSA / Diffie-Hellman) negotiates a symmetric session key for high-speed encryption.',
    keyConcept: 'Public key encrypts; private key decrypts. Once established, AES symmetric key encrypts the entire HTTP payload for performance.',
    typicalTrap: 'Believing the public key is used to encrypt all incoming and outgoing data throughout the entire connection duration.',
    codeLanguage: 'javascript',
    starterCodeSnippet: `// Conceptual TLS exchange
// 1. ClientHello (Supported Cipher Suites)
// 2. ServerHello + Certificate (Public Key)
// 3. Key Exchange (Diffie-Hellman parameters) -> Shared Symmetric Secret derived!
// 4. Encrypted Application Data begins using symmetric AES-GCM`,
    starterErrorLog: 'Handshake Telemetry: TLS 1.3 negotiated in 1-RTT. Symmetric session key active.',
    prerequisites: ['Symmetric vs Asymmetric Encryption', 'Certificates & CAs'],
    status: 'YELLOW',
    mastery: 0.52,
    errorCount: 2,
    solvedCount: 1,
  },
  {
    id: 'arp_ip_to_mac',
    name: 'ARP Protocol: IP-to-MAC Physical Address Resolution',
    track: 'Computer Networks',
    category: 'Data Link Layer',
    description: 'Translating Layer 3 logical IP addresses to Layer 2 physical MAC hardware addresses within local broadcast domains.',
    keyConcept: 'ARP sends a broadcast frame (FF:FF:FF:FF:FF:FF) asking "Who has IP X?"; target device responds with unicast MAC.',
    typicalTrap: 'Assuming ARP queries cross router boundaries into foreign internet subnets.',
    codeLanguage: 'python',
    starterCodeSnippet: `// ARP Request: "Who has 192.168.1.1? Tell 192.168.1.100"
// Target responds: "192.168.1.1 is at 00:1A:2B:3C:4D:5E"
// Switch populates CAM table and host updates local ARP cache.`,
    starterErrorLog: 'Layer 2 Trace: Frame received. ARP entry cached with 1200 second TTL.',
    prerequisites: ['MAC Addresses', 'Broadcast Domains'],
    status: 'GREEN',
    mastery: 0.84,
    errorCount: 0,
    solvedCount: 3,
  },
];

export const INITIAL_ISLM_PROFILE = {
  student_id: 'CSE_STU_8810',
  name: 'Alex Chen',
  email: 'alex.chen@university.cse.edu',
  role: 'student' as const,
  course_track: 'Web Application Development',
  overall_mastery: 0.62,
  topic_mastery: {
    HTML_CSS: 0.95,
    PHP_Syntax: 0.80,
    MySQL_Queries: 0.70,
    PDO_Connection: 0.25,
    Recursion_Base_Case: 0.30,
    Deadlock_Conditions: 0.28,
    Virtual_Memory: 0.45,
    TCP_Handshake: 0.88,
  },
  recent_misconceptions: [
    'Confusing MySQL database port (3306) with HTTP web port (80)',
    'Omitting recursive base cases leading to call stack exhaustion',
    'Assuming global server variables provide isolated user session state',
  ],
  scaffolding_tier_required: 1,
  error_count: 8,
  independent_solves: 14,
  scaffolding_fading_index: 0.35,
  time_spent_mins: 142,
  history: [
    {
      id: 'h_1',
      timestamp: '2026-10-29 14:20',
      topic_id: 'pdo_mysql_port',
      topic_name: 'PHP PDO & MySQL Port Configuration',
      tier_used: 1,
      issue_type: 'PRACTICAL_EXECUTION_ERROR' as const,
      resolved_independently: false,
      notes: 'Student asked for direct fix code; Socratic deflection applied.',
    },
    {
      id: 'h_2',
      timestamp: '2026-10-29 16:45',
      topic_id: 'recursion_base_case',
      topic_name: 'Recursion Base Case & Stack Frames',
      tier_used: 2,
      issue_type: 'CONCEPTUAL_GAP' as const,
      resolved_independently: true,
      notes: 'Guided through base case termination condition; solved on second try.',
    },
    {
      id: 'h_3',
      timestamp: '2026-10-30 09:15',
      topic_id: 'tcp_three_way_handshake',
      topic_name: 'TCP 3-Way Handshake',
      tier_used: 1,
      issue_type: 'MISCONCEPTION' as const,
      resolved_independently: true,
      notes: 'Clarified SYN sequence numbers independently.',
    },
  ],
};
