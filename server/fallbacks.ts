export function getTutoringFallback(tutorReq: any) {
  const { workflow, student_input, code_snippet, execution_logs, islm_profile, current_topic, visualizer_mode } = tutorReq;
  const trimmedInput = (student_input || '').trim();
  const isGreeting = /^(hi|hello|hey|greetings|howdy|good\s+(morning|afternoon|evening)|yo|hola|start|sup|welcome)(\s+.*)?$/i.test(trimmedInput);
  const isDemandingAnswer = /give\s+(me\s+)?(the\s+)?(fixed\s+)?(code|solution|answer)|write\s+(the\s+)?(code|program|assignment)|solve\s+(it|this)|fix\s+my\s+code\s+directly/i.test(trimmedInput);

  if (isGreeting) {
    return {
      workflow: workflow || 'CHATS',
      diagnosis: {
        issue_type: 'CONCEPTUAL_GAP',
        identified_gap: 'CSE Technical Orientation & Problem Identification',
        confidence_score: 0.99,
      },
      scaffolding_response: {
        current_tier: 1,
        refusal_reason: '',
        tutor_message: "Hello! I am your CogniCSE Technical Tutor. How can I help you master Computer Science or Mechanical Engineering today?\n\nWe can explore core tracks like:\n• Mechanical Engineering (CAD) (2D Sketch DOF, Constraints, Hub/Bore Concentricity, Mass Evaluation, FOS >= 2.0)\n• Data Structures & Algorithms (Trees, Graphs, Dijkstra, Dynamic Programming)\n• Computer Systems & OS (Pointers, Memory Allocation, Caching, Concurrency)\n• Computer Networks (Sockets, OSI Layers, TCP Handshake, Ports)\n• Or debug your current code/model in the Polyglot Sandbox!",
        socratic_question: 'Which engineering track or concept would you like to explore first?',
      },
      visualizer_data: {
        mode: 'Text Response',
      },
      islm_updates: {
        updated_topic_mastery: { [current_topic || 'Core_Concept']: islm_profile?.overall_mastery || 0.75 },
        memory_tree_node_status: {
          node_id: (current_topic || 'topic_core').toLowerCase().replace(/[^a-z0-9]/g, '_'),
          node_name: current_topic || 'Core Concept',
          status: 'GREEN',
        },
        increment_error_count: false,
        next_scaffolding_tier: 1,
      },
      content_hooks: {
        trigger_ai_video: false,
        flag_for_mock_test: false,
      },
      research_telemetry: {
        scaffolding_fading_index: islm_profile?.scaffolding_tier_required ? +(0.15 * islm_profile.scaffolding_tier_required).toFixed(2) : 0.25,
        estimated_time_to_resolution_mins: 1,
        error_recurrence_drop: '0%',
      },
    };
  }

  const currentTier = Math.min(Math.max(islm_profile?.scaffolding_tier_required || 1, 1), 4);
  let issueType = 'CONCEPTUAL_GAP';
  let refusalReason = '';
  let tutorMessage = '';
  let socraticQuestion = '';
  let identifiedGap = 'Understanding system abstractions and runtime mechanics';
  let effectiveMode = visualizer_mode || 'Text Response';

  if (isDemandingAnswer) {
    refusalReason = 'Direct code generation withheld under Socratic Anti-Answer protocol.';
    tutorMessage = "I'm here to help you master this step-by-step so you can solve it independently! Let's break down where you're currently stuck rather than pasting the solution.";
    socraticQuestion = "What is the very first step your algorithm or function needs to perform when it receives input?";
    issueType = 'MISCONCEPTION';
  } else {
    const q = (trimmedInput + ' ' + (code_snippet || '') + ' ' + (execution_logs || '')).toLowerCase();

    if (q.includes('dijkstra') || q.includes('shortest path') || q.includes('a*') || q.includes('navigation') || q.includes('graph')) {
      identifiedGap = 'Shortest Path Graph Traversal & Priority Queue Mechanics';
      tutorMessage = "Navigation applications model road intersections as graph vertices and streets as weighted edges. Dijkstra's algorithm uses a min-priority queue to always greedily expand the vertex with the lowest cumulative distance from the origin.\n\nA* extends this by adding an admissible heuristic h(n) (like Euclidean distance) to direct the exploration towards the target faster.";
      socraticQuestion = "Why must the heuristic in A* never overestimate the true remaining distance in order to guarantee an optimal path?";
      effectiveMode = visualizer_mode === 'Text Response' ? 'Text Response' : 'Flowchart';
    } else if (q.includes('caching') || q.includes('locality') || q.includes('matrix')) {
      identifiedGap = 'Hardware Cache Hierarchy & Spatial/Temporal Locality in Memory Loops';
      tutorMessage = "Modern CPUs fetch data into cache lines (typically 64 bytes) rather than individual single variables. When you iterate across a 2D matrix in row-major order (A[i][j] in C++), contiguous memory addresses are pre-loaded into the L1/L2 cache (Spatial Locality).\n\nIf you iterate column-major (A[j][i]), each step jumps across an entire row, causing constant cache line evictions and cycle stalls.";
      socraticQuestion = "How does changing loop nesting from `for j ... for i` to `for i ... for j` dramatically decrease CPU cache misses in C++?";
      effectiveMode = visualizer_mode === 'Text Response' ? 'Text Response' : 'Diagrams';
    } else if (q.includes('recursion') || q.includes('base case') || q.includes('call stack') || q.includes('stack overflow')) {
      identifiedGap = 'Missing or unreachable termination condition (base case) in recursive function';
      issueType = 'CONCEPTUAL_GAP';
      tutorMessage = "Every time a function invokes itself, the runtime pushes a new stack frame onto the thread call stack (saving local state and return addresses).\n\nWithout an explicit termination condition (base case) that halts recursion and returns a base value, frames stack up until thread stack memory is exhausted.";
      socraticQuestion = "What input condition or check at the very top of your function should cause it to return immediately without recursing further?";
      effectiveMode = visualizer_mode === 'Text Response' ? 'Text Response' : 'Timeline';
    } else if (q.includes('leak') || q.includes('pointer') || q.includes('malloc') || q.includes('free') || q.includes('garbage')) {
      identifiedGap = 'Manual Heap Allocation Lifecycle & Memory Reclamation';
      issueType = 'CONCEPTUAL_GAP';
      tutorMessage = "In languages with manual memory management like C/C++, `malloc()` reserves heap chunks from the OS. If the pointer referencing that address goes out of scope before `free()` is called, the memory remains allocated yet unreferenced — creating a memory leak.";
      socraticQuestion = "How do modern C++ RAII smart pointers like `std::unique_ptr` eliminate memory leaks automatically?";
      effectiveMode = visualizer_mode === 'Text Response' ? 'Text Response' : 'Simulator';
    } else if (q.includes('blue') || q.includes('dof') || q.includes('under-constrained') || q.includes('degree of freedom') || q.includes('degrees of freedom')) {
      identifiedGap = 'Under-constrained 2D sketch with free degrees of freedom (blue geometry)';
      issueType = 'cad_constraint_error';
      effectiveMode = 'Diagrams';
      if (currentTier === 1) {
        tutorMessage = "In parametric CAD modeling, entity color directly communicates constraint status. Notice how the solver highlights entities that still have free movement.";
        socraticQuestion = "In parametric sketchers like Fusion 360 or SolidWorks, what does a blue line signify regarding its remaining degrees of freedom?";
      } else if (currentTier === 2) {
        tutorMessage = "A 2D planar point has 2 translational degrees of freedom (X and Y). Fully constrained sketch entities have 0 degrees of freedom and turn black. Extruding blue sketches is a common trap (82% frequency) that causes downstream parametric drift.";
        socraticQuestion = "What geometric constraint or datum reference can anchor the floating endpoint to eliminate its translational freedom?";
      } else if (currentTier === 3) {
        tutorMessage = "Socratic Micro-Drill: If you click and drag any vertex of this blue sketch line in your viewport, you observe it stretching along the plane because its coordinates are not uniquely determined by solver equations.";
        socraticQuestion = "Does this entity require a positional constraint (like Coincident to origin) or a dimensional constraint (like length/distance)?";
      } else {
        tutorMessage = "Direct Line Guidance: Your sketch profile endpoint has free translational degrees of freedom because it lacks an anchor to the sketch origin or coordinate axes. Select the endpoint and the origin point to apply a Coincident constraint, then verify all sketch lines turn black.";
        socraticQuestion = "Apply the Coincident constraint to the sketch origin and verify whether all curves turn black.";
      }
    } else if (q.includes('tangent') || q.includes('concentric') || q.includes('symmetric') || q.includes('coincident') || q.includes('constraint')) {
      identifiedGap = 'Geometric relationship constraint definition (tangency, concentricity, or symmetry)';
      issueType = 'cad_constraint_error';
      effectiveMode = 'Flowchart';
      if (currentTier === 1) {
        tutorMessage = "Geometric constraints eliminate degrees of freedom through relational topology rather than numeric dimensions. Review the connection between your adjacent sketch entities.";
        socraticQuestion = "What geometric relationship ensures smooth slope continuity (G1 tangency) between a linear edge and a circular arc without forming a sharp cusp?";
      } else if (currentTier === 2) {
        tutorMessage = "Coincident locks points together; Concentric aligns centerlines of revolving features; Tangent forces shared slope vectors (G1 continuity); Symmetric balances geometry across a mirror plane.";
        socraticQuestion = "Why is applying a Tangent constraint preferable to manually dimensioning angles when creating an arc blend?";
      } else if (currentTier === 3) {
        tutorMessage = "Socratic Micro-Drill: Look closely at the vertex where your arc meets the linear wall. The solver detects a C0 positional junction with a slope discontinuity.";
        socraticQuestion = "Which constraint forces the first derivative of both curves to be equal at that junction?";
      } else {
        tutorMessage = "Direct Line Guidance: The arc and linear profile meet at a sharp corner because the Tangent constraint is omitted between the two sketch entities. Select both curves and apply Tangent, avoiding redundant angle dimensions.";
        socraticQuestion = "Apply the Tangent constraint to the arc-line junction to achieve G1 continuity.";
      }
    } else if (q.includes('fos') || q.includes('factor of safety') || q.includes('stress') || q.includes('yield') || q.includes('von mises')) {
      identifiedGap = 'Factor of Safety evaluation below structural threshold (target FOS >= 2.0)';
      issueType = 'cad_tolerance_mismatch';
      effectiveMode = 'Charts & Graphs';
      if (currentTier === 1) {
        tutorMessage = "In mechanical design, the Factor of Safety (FOS) represents your structural margin against material yielding under rated load.";
        socraticQuestion = "How is Factor of Safety calculated in terms of material yield strength and maximum equivalent stress?";
      } else if (currentTier === 2) {
        tutorMessage = "FOS = yield_strength / max_stress. Structural engineering standards mandate a target FOS >= 2.0 for ductile static equipment. Assuming FOS ~ 1.1 is acceptable is a severe misconception because it leaves zero margin for dynamic shock, fatigue, or tool marks.";
        socraticQuestion = "If finite element analysis reveals localized peak stress concentrated at a sharp 90-degree internal corner, what geometric feature can you add to lower that stress concentration?";
      } else if (currentTier === 3) {
        tutorMessage = "Socratic Micro-Drill: Peterson's Stress Concentration analysis shows sharp re-entrant corners create theoretical infinite stress notches (Kt -> inf).";
        socraticQuestion = "How does increasing the internal fillet radius redistribute load streamlines and raise the calculated FOS?";
      } else {
        tutorMessage = "Direct Line Guidance: Your component exhibits high localized Von Mises stress at the internal sharp shoulder, pulling FOS below 2.0. Adding an internal transition fillet radius (R >= 3mm) will smooth out the stress notch and bring the design above the FOS >= 2.0 threshold.";
        socraticQuestion = "Insert a transition fillet on the internal shoulder and re-evaluate the maximum stress tensor.";
      }
    } else if (q.includes('mass') || q.includes('density') || q.includes('volume') || q.includes('g/cm3') || q.includes('weight')) {
      identifiedGap = 'Confusing geometric volume with physical mass and metric density conversion';
      issueType = 'cad_tolerance_mismatch';
      effectiveMode = 'Simulator';
      if (currentTier === 1) {
        tutorMessage = "Consider the fundamental physical relationship between the space an object occupies and its gravitational mass.";
        socraticQuestion = "What physical property connects an object's geometric volume to its total mass?";
      } else if (currentTier === 2) {
        tutorMessage = "Mass equals density multiplied by volume (m = rho * V). Confusing volume with mass is a common trap. Two parts with identical 500 cm³ volumes will have vastly different masses if one is 1018 Steel (7.85 g/cm³) and the other is 6061 Aluminum (2.70 g/cm³). Also recall that 1 cm³ = 1000 mm³.";
        socraticQuestion = "If volume is measured in mm³, what conversion factor must be applied before multiplying by density in g/cm³?";
      } else if (currentTier === 3) {
        tutorMessage = "Socratic Micro-Drill: If a part has volume = 200,000 mm³ and density = 2.70 g/cm³, converting volume to cm³ yields 200 cm³.";
        socraticQuestion = "What is the resulting mass in kilograms (200 * 2.70 = 540 grams)?";
      } else {
        tutorMessage = "Direct Line Guidance: The mass evaluation failed because volume in cubic millimeters was directly multiplied by density in g/cm³ without dividing by 1,000, creating a 1000x calculation error. Convert mm³ to cm³ first, then multiply by the material density.";
        socraticQuestion = "Divide volume by 1000 cm³/mm³ before multiplying by density to obtain the correct mass.";
      }
    } else if (q.includes('hub') || q.includes('bore') || q.includes('runout') || q.includes('concentricity') || q.includes('coaxial')) {
      identifiedGap = 'Hub/bore coaxial datum alignment and concentricity runout tolerance';
      issueType = 'cad_tolerance_mismatch';
      effectiveMode = 'Diagrams';
      if (currentTier === 1) {
        tutorMessage = "In rotating machinery, alignment of shaft and housing centerlines is critical for dynamic balance.";
        socraticQuestion = "What assembly constraint or geometric datum alignment ensures two revolving cylindrical features share a common centerline?";
      } else if (currentTier === 2) {
        tutorMessage = "Coaxial and Concentric constraints align rotational axes (Datum A). Radial eccentricity causes centrifugal unbalance force (F = m * e * omega^2) that escalates with the square of rotational speed.";
        socraticQuestion = "Why does radial runout between a shaft and bore cause severe vibration at high RPM?";
      } else if (currentTier === 3) {
        tutorMessage = "Socratic Micro-Drill: Mating two cylindrical components using planar face contacts alone leaves the radial degrees of freedom unconstrained.";
        socraticQuestion = "Which constraint type explicitly locks the cylindrical axis of the shaft to the cylindrical axis of the bore?";
      } else {
        tutorMessage = "Direct Line Guidance: The shaft is exhibiting eccentric runout because it was assembled using planar edge contact rather than a coaxial cylindrical mate. Apply a Concentric/Coaxial mate between the outer shaft cylinder and the inner bore cylinder.";
        socraticQuestion = "Select both cylindrical faces and apply the Concentric constraint to align their datum axes.";
      }
    } else if (q.includes('tcp') || q.includes('handshake') || q.includes('osi') || q.includes('syn') || q.includes('ack')) {
      identifiedGap = 'Layer 4 Transport Handshake & Service Port Assignment';
      issueType = 'CONCEPTUAL_GAP';
      tutorMessage = "TCP establishes reliable connection state using the 3-Way Handshake: Client sends SYN -> Server responds with SYN-ACK -> Client confirms with ACK.\n\nService ports identify specific listener daemons: Port 80 for HTTP, 443 for HTTPS, 3306 for MySQL, and 5432 for PostgreSQL.";
      socraticQuestion = "If a client attempts to send database queries directly to HTTP port 80, why does the host daemon reject the connection with 'Connection refused'?";
      effectiveMode = visualizer_mode === 'Text Response' ? 'Text Response' : 'Flowchart';
    } else if (workflow === 'CODE_SANDBOX_TUTORING' && (execution_logs || code_snippet)) {
      if (q.includes('port') || q.includes('pdo') || q.includes('connection refused') || q.includes('2002')) {
        identifiedGap = 'Incorrect database port specified in PDO connection string (using HTTP port 80 instead of MySQL port 3306)';
        issueType = 'PRACTICAL_EXECUTION_ERROR';
        if (currentTier === 1) {
          tutorMessage = "Notice how your script is attempting to reach the database server. Look closely at the connection parameters you supplied to the PDO constructor.";
          socraticQuestion = "In computer networking, port 80 is reserved for standard HTTP web traffic. What is the standard default port number where MySQL servers listen for client queries?";
        } else if (currentTier === 2) {
          tutorMessage = "Databases and web servers run as distinct daemon services on separate TCP ports. Connecting to the wrong port causes immediate protocol rejection.";
          socraticQuestion = "When configuring a connection string like 'mysql:host=localhost;port=XYZ', what numeric value should replace XYZ for MySQL?";
        } else {
          tutorMessage = "Direct Line Guidance: In your connection string on line 1, you specified `port=80`. Change `80` to the default MySQL port `3306` to allow the handshake.";
          socraticQuestion = "Update your code to use port 3306 and click 'Run & Verify' to test if the connection succeeds!";
        }
        effectiveMode = 'Flowchart';
      } else {
        identifiedGap = 'Logic discrepancy between algorithm design and runtime evaluation';
        tutorMessage = "Let's trace your program's execution step by step. Look at the inputs entering your logic and the exact condition being evaluated.";
        socraticQuestion = "What exact value does your variable hold right before the problematic line executes?";
      }
    } else {
      identifiedGap = 'Algorithmic Problem-Solving & Step-by-Step Breakdown';
      tutorMessage = `Let's analyze this concept from foundational principles: "${trimmedInput}". In software engineering, dividing complex behavior into discrete stages makes debugging much easier.`;
      socraticQuestion = "What is the expected output or state change you want to achieve at this step?";
    }
  }

  return {
    workflow: workflow || 'CHATS',
    diagnosis: {
      issue_type: issueType,
      identified_gap: identifiedGap,
      confidence_score: 0.96,
    },
    scaffolding_response: {
      current_tier: currentTier,
      refusal_reason: refusalReason,
      tutor_message: tutorMessage,
      socratic_question: socraticQuestion,
    },
    visualizer_data: {
      mode: effectiveMode,
      structure: {
        nodes: [
          { id: '1', label: 'Problem Formulation' },
          { id: '2', label: 'Concept Abstraction' },
          { id: '3', label: 'Runtime Evaluation' },
          { id: '4', label: 'Socratic Resolution' },
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '3', to: '4' },
        ],
      },
    },
    islm_updates: {
      updated_topic_mastery: {
        [current_topic || 'Core_Concept']: Math.min(1.0, ((islm_profile?.topic_mastery?.[current_topic || ''] || 0.4) + 0.05)),
      },
      memory_tree_node_status: {
        node_id: (current_topic || 'topic_core').toLowerCase().replace(/[^a-z0-9]/g, '_'),
        node_name: current_topic || 'Core Concept',
        status: currentTier >= 3 ? 'RED' : 'YELLOW',
      },
      increment_error_count: issueType === 'PRACTICAL_EXECUTION_ERROR',
      next_scaffolding_tier: Math.min(currentTier + 1, 4),
    },
    content_hooks: {
      trigger_ai_video: false,
      flag_for_mock_test: false,
    },
    research_telemetry: {
      scaffolding_fading_index: +(0.15 + currentTier * 0.1).toFixed(2),
      estimated_time_to_resolution_mins: Math.max(1, 5 - currentTier),
      error_recurrence_drop: `${Math.round(18 + currentTier * 8)}%`,
    },
  };
}

export function getVideoFallback(topic?: string, misconception?: string) {
  return {
    title: `60s Micro-Mastery: ${topic || 'Database Ports & Network Sockets'}`,
    concept: topic || 'Network Sockets & Port Bindings',
    duration_secs: 60,
    key_takeaway: 'Ports identify distinct processes on a machine. Database services listen on dedicated ports (e.g., MySQL 3306), distinct from HTTP (80/443).',
    scenes: [
      {
        scene_num: 1,
        time_range: '00:00 - 00:15',
        title: 'The Analogy: The Server Apartment Complex',
        visual_description: 'An animated server high-rise building with distinct front doors: Door 80 (Web Traffic), Door 443 (Secure Web), Door 3306 (MySQL Vault), Door 5432 (PostgreSQL).',
        narration: 'Imagine a server as an office building with hundreds of dedicated doors. An IP address gets you to the street address, but the port number picks the exact room inside.',
        animation_type: 'network_packet',
        visual_elements: ['Server Tower', 'Door 80 [HTTP]', 'Door 3306 [MySQL]', 'Driver Packet'],
      },
      {
        scene_num: 2,
        time_range: '00:15 - 00:38',
        title: 'The Collision: Knocking on the Wrong Door',
        visual_description: 'PHP PDO driver arrives at Door 80 holding SQL credentials. Door 80 is an Apache/Nginx web worker speaking HTTP. It rejects the raw MySQL protocol with Connection Refused.',
        narration: 'When your script connects to port 80 with database queries, the web server has no idea what language you are speaking and slams the door shut.',
        animation_type: 'comparison',
        visual_elements: ['PHP PDO Client', 'HTTP Server Rejection', 'Error 2002 Badge'],
      },
      {
        scene_num: 3,
        time_range: '00:38 - 00:60',
        title: 'The Solution: Clean Port Handshake',
        visual_description: 'Connection string changes port to 3306. Packet enters MySQL vault, receives handshake ACK, and returns green authenticated state.',
        narration: 'Point your driver to port 3306, and MySQL validates your credentials instantly. One number difference, total connection success!',
        animation_type: 'code_diff',
        visual_elements: ['port=3306 Highlighted', 'Authenticated Badge', 'Query Ready'],
      },
    ],
  };
}

export function getMockTestFallback(track?: string) {
  return {
    test_id: `MOCK_${Date.now()}`,
    title: `${track || 'CSE Core'} Comprehensive Adaptive Assessment`,
    time_limit_mins: 15,
    total_questions: 5,
    negative_marking_rate: 0.25,
    questions: [
      {
        id: 'q1',
        topic_id: 'pdo_mysql_port',
        topic_name: 'Database Sockets & Ports',
        question: 'A PHP script attempts to instantiate PDO with: `new PDO("mysql:host=localhost;port=80;dbname=store", $u, $p)`. Why does this throw SQLSTATE[HY000] [2002] Connection refused?',
        options: [
          'Port 80 is designated for HTTP; MySQL listens on 3306 by default.',
          'PHP cannot connect to MySQL over localhost without an SSL certificate.',
          'Port 80 is strictly blocked by the operating system kernel for all non-root programs.',
          'The dbname parameter must be specified before the port in the DSN.',
        ],
        correct_option_index: 0,
        explanation: 'Port 80 is the standardized port for unencrypted HTTP traffic. MySQL daemon processes listen on TCP port 3306. Connecting to 80 causes connection refusal because the web server does not negotiate MySQL handshake packets.',
        distractor_explanations: [
          'Correct answer!',
          'Incorrect: SSL certificates are optional for local MySQL connections.',
          'Incorrect: Non-root programs can connect as clients to port 80; they only cannot bind as listeners without privileges.',
          'Incorrect: DSN parameter ordering is arbitrary and does not impact port parsing.',
        ],
      },
      {
        id: 'q2',
        topic_id: 'recursion_base_case',
        topic_name: 'Recursion & Call Stack',
        question: 'What is the primary consequence of omitting a base case from a recursive function that decrements its integer parameter?',
        options: [
          'A compilation syntax error will prevent executable generation.',
          'Stack Overflow Error due to infinite allocation of activation records.',
          'The function will return undefined/null as soon as the integer reaches 0.',
          'The operating system will preemptively terminate the compiler.',
        ],
        correct_option_index: 1,
        explanation: 'Every recursive invocation pushes a new stack frame (containing return address, arguments, and local variables). Without a base case, recursion continues until the thread call stack memory limit is exceeded, triggering a StackOverflow exception.',
        distractor_explanations: [
          'Incorrect: Recursion is a runtime control-flow construct; compilers do not detect missing base cases as syntax errors.',
          'Correct answer!',
          'Incorrect: Without an explicit `if (n <= 0) return ...`, execution proceeds into negative numbers indefinitely.',
          'Incorrect: The error occurs at program runtime, not compile time.',
        ],
      },
      {
        id: 'q3',
        topic_id: 'http_statelessness',
        topic_name: 'Web Architecture & Protocols',
        question: 'Why is the HTTP protocol termed "stateless"?',
        options: [
          'Servers immediately power down memory chips after sending responses.',
          'Each request is executed independently without the server natively retaining context from prior requests.',
          'Clients cannot send query parameters or payloads in standard GET requests.',
          'IP packets are discarded whenever network congestion occurs.',
        ],
        correct_option_index: 1,
        explanation: 'HTTP is stateless by design: the server treats each request as entirely independent and does not preserve client context across transactions without application-layer mechanisms like Cookies, Session IDs, or JWT tokens.',
        distractor_explanations: [
          'Incorrect: Hardware memory is not powered down between HTTP transactions.',
          'Correct answer!',
          'Incorrect: GET requests regularly carry query strings and headers.',
          'Incorrect: Packet loss is a layer-3/4 network occurrence, not the definition of HTTP statelessness.',
        ],
      },
      {
        id: 'q4',
        topic_id: 'pointers_memory_leak',
        topic_name: 'Memory Management',
        question: 'In C/C++, dynamically allocating an integer array with `malloc()` or `new` inside a loop without calling `free()` or `delete[]` results in:',
        options: [
          'Segmentation fault upon program startup.',
          'Dangling pointer exception.',
          'Memory leak: heap memory remains reserved and unreachable after pointers go out of scope.',
          'Automatic garbage collection triggers after 1000 iterations.',
        ],
        correct_option_index: 2,
        explanation: 'C and C++ do not have automatic garbage collection. Dynamically allocated heap memory must be manually released. If the pointer variable leaves scope without calling `free()`, the allocated memory stays marked as occupied, leaking heap capacity.',
        distractor_explanations: [
          'Incorrect: Allocation succeeds initially; crash only occurs if system runs completely out of memory.',
          'Incorrect: Dangling pointers happen when pointing to already freed memory, not unfreed memory.',
          'Correct answer!',
          'Incorrect: Standard C/C++ runtimes have no built-in generational garbage collector.',
        ],
      },
      {
        id: 'q5',
        topic_id: 'osi_transport_layer',
        topic_name: 'Computer Networks',
        question: 'Which OSI layer is responsible for end-to-end communication, port addressing, flow control, and segmentation (e.g., TCP & UDP)?',
        options: [
          'Layer 2 - Data Link Layer',
          'Layer 3 - Network Layer',
          'Layer 4 - Transport Layer',
          'Layer 7 - Application Layer',
        ],
        correct_option_index: 2,
        explanation: 'Layer 4 (Transport Layer) manages end-to-end process-to-process communication, port assignment, TCP segment reassembly, flow control, and reliability.',
        distractor_explanations: [
          'Incorrect: Layer 2 handles MAC addressing and physical framing.',
          'Incorrect: Layer 3 handles logical IP addressing and inter-network routing.',
          'Correct answer!',
          'Incorrect: Layer 7 interfaces directly with end-user software protocols like HTTP, SMTP, and FTP.',
        ],
      },
    ],
  };
}

export function getLibraryVaultFallback(title?: string, track?: string) {
  return {
    summary: `Comprehensive CSE reference covering ${title || 'Key Architectural Principles'}, detailing foundational mechanics, protocol specifications, and common failure modes in software engineering.`,
    extracted_concepts: [
      {
        concept_id: 'db_connection_pooling',
        name: 'Database Connection Lifecycle & Sockets',
        difficulty: 'INTERMEDIATE',
        prerequisites: ['TCP/IP Fundamentals', 'Client-Server Architecture'],
        frequent_misconception: 'Assuming connection parameters default to web ports instead of database daemon ports.',
      },
      {
        concept_id: 'recursion_call_stack',
        name: 'Stack Frame Allocation & Termination',
        difficulty: 'BEGINNER',
        prerequisites: ['Call Stack', 'Variable Scope'],
        frequent_misconception: 'Believing recursion continues until memory is naturally exhausted rather than hitting an explicit base case.',
      },
      {
        concept_id: 'http_statelessness',
        name: 'HTTP Protocol Statelessness & Session Tokens',
        difficulty: 'INTERMEDIATE',
        prerequisites: ['Request-Response Model'],
        frequent_misconception: 'Assuming the web server inherently remembers past requests without cookies or bearer tokens.',
      },
    ],
    recommended_socratic_drills: [
      {
        drill_id: 'drill_1',
        prompt: 'If a database runs on the same physical host as your script, why might `localhost` fail while `127.0.0.1` succeeds?',
        concept_mapped: 'db_connection_pooling',
        socratic_tier: 1,
      },
      {
        drill_id: 'drill_2',
        prompt: 'What happens to local variables created in recursive frame N when frame N+1 is pushed onto the stack?',
        concept_mapped: 'recursion_call_stack',
        socratic_tier: 2,
      },
    ],
    suggested_video_topics: [
      'The Anatomy of a Database Socket Connection',
      'Visualizing Stack Overflow in Under 60 Seconds',
      'Cookies vs Sessions: Surviving HTTP Statelessness',
    ],
  };
}
