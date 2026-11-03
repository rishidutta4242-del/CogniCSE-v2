import { DKMNode } from "../types";

export const CSE_SYS_NODES: DKMNode[] = [
  // --- TRACK: Operating Systems ---
  {
    id: 'deadlock_four_conditions',
    name: 'Deadlock: Coffman Conditions & Banker\'s Algorithm',
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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
    domain: 'cse',
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