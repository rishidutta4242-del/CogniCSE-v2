import { SupportedLanguage } from '../types';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  version: string;
  extension: string;
  defaultCode: string;
  buggyPreset: {
    title: string;
    description: string;
    code: string;
    errorLog: string;
    fixCheck: (code: string) => { isFixed: boolean; feedback: string };
    tier1Hint: string;
    tier2Concept: string;
    tier3Drill: string;
    tier4Guidance: string;
  };
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    id: 'python',
    name: 'Python',
    version: '3.12',
    extension: 'py',
    defaultCode: `# Python 3.12 Sandbox
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("Student"))
`,
    buggyPreset: {
      title: 'Python: Mutable Default Argument Pitfall',
      description: 'Default argument list is evaluated only once when function is defined, causing state bleed across calls.',
      code: `def add_item_to_cart(item, cart=[]):
    # Bug: cart default list is shared across ALL invocations!
    cart.append(item)
    return cart

print("Session 1:", add_item_to_cart("Laptop"))
print("Session 2:", add_item_to_cart("Notebook")) # Unexpected: ['Laptop', 'Notebook']!
`,
      errorLog: `AssertionError: Expected ['Notebook'] for Session 2, but received ['Laptop', 'Notebook']
Warning: Function 'add_item_to_cart' mutates its default argument object reference (id: 0x7f9a8c20).`,
      fixCheck: (c) => {
        const hasNoneDefault = /cart\s*=\s*None/i.test(c);
        const hasInitInside = /if\s+cart\s+is\s+None:\s+cart\s*=\s*\[\]/i.test(c) || /cart\s*=\s*\[\]\s+if\s+cart\s+is\s+None/i.test(c);
        if (hasNoneDefault && hasInitInside) {
          return {
            isFixed: true,
            feedback: 'Mastered! Using `cart=None` and initializing inside the body ensures a fresh list for every caller.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Default argument is still mutable. Set default parameter to `None` and check `if cart is None: cart = []`.',
        };
      },
      tier1Hint: 'In Python, when does the default argument get created: when the function is defined, or every time it is called?',
      tier2Concept: 'Default arguments in Python are evaluated once at module load time. For mutable types like lists or dicts, always use None as the default value.',
      tier3Drill: 'What immutable sentinel value should you assign to `cart=` in the parameter list to represent an unsupplied argument?',
      tier4Guidance: 'Change `def add_item_to_cart(item, cart=[])` to `def add_item_to_cart(item, cart=None): if cart is None: cart = []`.',
    },
  },
  {
    id: 'java',
    name: 'Java',
    version: 'OpenJDK 21',
    extension: 'java',
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java 21!");
    }
}
`,
    buggyPreset: {
      title: 'Java: String Comparison `==` vs `.equals()`',
      description: 'Using `==` compares heap memory reference addresses rather than String content characters.',
      code: `public class Main {
    public static void main(String[] args) {
        String tokenA = new String("AUTH_BEARER_8810");
        String tokenB = new String("AUTH_BEARER_8810");

        // Common student trap in Java:
        if (tokenA == tokenB) {
            System.out.println("Access Granted: Valid Session");
        } else {
            System.err.println("Access Denied: Token mismatch! (== compares references)");
        }
    }
}
`,
      errorLog: `Runtime Output:
Access Denied: Token mismatch! (== compares references)
[Test Failure]: Expected 'Access Granted' because string contents are identical, but reference check evaluated to FALSE.`,
      fixCheck: (c) => {
        if (/tokenA\.equals\(\s*tokenB\s*\)/i.test(c) || /tokenB\.equals\(\s*tokenA\s*\)/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Excellent! `.equals()` checks character-by-character semantic equality across Java object instances.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Code still uses `==` for String object reference comparison. Use `.equals()` instead.',
        };
      },
      tier1Hint: 'In Java, does `==` compare what is inside the objects, or where the objects live in heap memory?',
      tier2Concept: 'The `==` operator tests reference identity. To compare the logical contents of two objects in Java, invoke the `.equals()` method.',
      tier3Drill: 'Which method on java.lang.String performs deep character equality instead of reference comparison?',
      tier4Guidance: 'Replace `if (tokenA == tokenB)` with `if (tokenA.equals(tokenB))`.',
    },
  },
  {
    id: 'cpp',
    name: 'C++',
    version: 'C++20 (GCC)',
    extension: 'cpp',
    defaultCode: `#include <iostream>
#include <vector>

int main() {
    std::cout << "CogniCSE C++20 Sandbox" << std::endl;
    return 0;
}
`,
    buggyPreset: {
      title: 'C++: Vector Iterator Invalidation on Push_Back',
      description: 'Modifying a std::vector while iterating over it causes memory reallocation and leaves iterators dangling.',
      code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {10, 20, 30};
    
    // Bug: push_back reallocates heap memory, invalidating the iterator!
    for (auto it = numbers.begin(); it != numbers.end(); ++it) {
        if (*it == 20) {
            numbers.push_back(99); 
        }
    }
    std::cout << "Done" << std::endl;
    return 0;
}
`,
      errorLog: `Segmentation fault (core dumped)
AddressSanitizer:DEADLYSIGNAL
=================================================================
==4812==ERROR: AddressSanitizer: SEGV on unknown address 0x000000000000
AddressSanitizer can not provide additional info.
SUMMARY: AddressSanitizer: SEGV in main.cpp:10`,
      fixCheck: (c) => {
        const avoidsDirectPush = !/numbers\.push_back\s*\(\s*99\s*\)/.test(c) || /to_add/i.test(c) || /indices/i.test(c) || /numbers\.reserve/i.test(c);
        if (avoidsDirectPush) {
          return {
            isFixed: true,
            feedback: 'Superb! Collecting items to add after the loop or updating iterators prevents dangling references.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Iterator invalidation still present: vector cannot reallocate its storage buffer while active iterators are traversing it.',
        };
      },
      tier1Hint: 'What happens to the internal memory buffer of std::vector when push_back exceeds current capacity?',
      tier2Concept: 'When a std::vector reallocates its memory buffer to grow, all existing raw pointers and iterators pointing into the old buffer become invalid dangling pointers.',
      tier3Drill: 'Name two safe alternatives: index-based loops or collecting elements into a secondary container before appending?',
      tier4Guidance: 'Store items to append in a temporary vector `to_add` during the loop, then insert them after the iteration concludes.',
    },
  },
  {
    id: 'c',
    name: 'C (GCC)',
    version: 'C17 (GCC)',
    extension: 'c',
    defaultCode: `#include <stdio.h>

int main() {
    printf("CogniCSE C17 Environment\\n");
    return 0;
}
`,
    buggyPreset: {
      title: 'C: Uninitialized Pointer Dereference',
      description: 'Dereferencing a wild pointer points to an arbitrary address in memory causing SIGSEGV.',
      code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int* ptr; // Wild uninitialized pointer!
    
    // Bug: Writing to whatever random memory address ptr happens to hold!
    *ptr = 42; 
    
    printf("Value: %d\\n", *ptr);
    return 0;
}
`,
      errorLog: `Segmentation fault (core dumped)
Signal 11 (SIGSEGV) code=1 (SEGV_MAPERR), fault addr=0x7ffe420
Process finished with exit code 139`,
      fixCheck: (c) => {
        if (/malloc\s*\(\s*sizeof\s*\(\s*int\s*\)\s*\)/i.test(c) || /int\s+val\s*=\s*42/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Correct! Memory must be allocated via malloc() or assigned to the address of a declared stack variable (&x).',
          };
        }
        return {
          isFixed: false,
          feedback: 'Pointer must be initialized to valid allocated heap memory or a stack address before dereferencing.',
        };
      },
      tier1Hint: 'What address does a newly declared local pointer variable hold if it was not assigned any value?',
      tier2Concept: 'In C, automatic local variables contain arbitrary garbage values left on the stack. Assigning through `*ptr` attempts to write to an unmapped OS memory page.',
      tier3Drill: 'Which standard library function from <stdlib.h> reserves heap memory of a specified byte size?',
      tier4Guidance: 'Initialize ptr with `int* ptr = (int*)malloc(sizeof(int));` and remember to call `free(ptr);` before exiting.',
    },
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    version: 'ES2024 (V8)',
    extension: 'js',
    defaultCode: `// Modern JavaScript Sandbox
function calculateStats(scores) {
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

console.log("Average:", calculateStats([90, 85, 95]));
`,
    buggyPreset: {
      title: 'JavaScript: Array Equality `[] == []` Misconception',
      description: 'In JavaScript, array objects are compared by reference, not value, even with double equals.',
      code: `function verifySessionKeys(keyA, keyB) {
  // Bug: [1, 2, 3] == [1, 2, 3] always evaluates to FALSE!
  if (keyA == keyB) {
    return "MATCH_CONFIRMED";
  }
  return "MISMATCH_DETECTED";
}

const userKeys = [101, 202, 303];
const authKeys = [101, 202, 303];

console.log(verifySessionKeys(userKeys, authKeys));
`,
      errorLog: `Assertion Failed: Expected 'MATCH_CONFIRMED', but received 'MISMATCH_DETECTED'.
[JS Evaluation]: userKeys and authKeys refer to distinct heap Array instances; keyA == keyB evaluates to false.`,
      fixCheck: (c) => {
        if (/JSON\.stringify/i.test(c) || /every/i.test(c) || /join/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Solved! Comparing serialized JSON or iterating array indices evaluates actual element values.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Arrays in JS must be compared element-by-element (e.g. `keyA.every((v, i) => v === keyB[i])`) or via JSON stringification.',
        };
      },
      tier1Hint: 'Does JavaScript compare objects and arrays by their content or by their identity in memory?',
      tier2Concept: 'In JS, complex types (Arrays, Objects) are reference types. Even two identical literals `[1] == [1]` evaluate to false because they are distinct objects in memory.',
      tier3Drill: 'How can you convert both arrays into strings or test their elements to verify identical content?',
      tier4Guidance: 'Use `JSON.stringify(keyA) === JSON.stringify(keyB)` or `keyA.length === keyB.length && keyA.every((val, idx) => val === keyB[idx])`.',
    },
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    version: '5.4',
    extension: 'ts',
    defaultCode: `interface Student {
  id: string;
  name: string;
  mastery: number;
}

const stu: Student = { id: "STU_1", name: "Alex", mastery: 0.85 };
console.log(stu);
`,
    buggyPreset: {
      title: 'TypeScript: Nullable Property Access Under Strict Mode',
      description: 'Accessing nested properties on possibly undefined object properties causes runtime exceptions.',
      code: `interface UserProfile {
  name: string;
  contact?: {
    email?: string;
  };
}

function sendWelcomeEmail(user: UserProfile) {
  // Bug: What if user.contact is undefined?
  const emailUpper = user.contact.email.toUpperCase();
  console.log("Sending to:", emailUpper);
}

sendWelcomeEmail({ name: "Alex" }); // Crashes!
`,
      errorLog: `TypeError: Cannot read properties of undefined (reading 'email')
at sendWelcomeEmail (sandbox.ts:10:27)
Strict Null Checks: Object is possibly 'undefined'.`,
      fixCheck: (c) => {
        if (/user\.contact\?\.email/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Perfect! Optional chaining `user.contact?.email` prevents runtime null dereferences safely.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Code still performs unsafe nested property access. Use optional chaining `user.contact?.email`.',
        };
      },
      tier1Hint: 'What happens if a caller passes a user object that lacks the optional `contact` object?',
      tier2Concept: 'TypeScript strict null checking warns you when an object property might be undefined. Optional chaining `?.` short-circuits gracefully.',
      tier3Drill: 'Which operator introduced in ES2020 allows safe access to deeply nested properties without manual `if (user && user.contact)` checks?',
      tier4Guidance: 'Use optional chaining: `const email = user.contact?.email?.toUpperCase();` with a fallback default.',
    },
  },
  {
    id: 'php',
    name: 'PHP',
    version: '8.3',
    extension: 'php',
    defaultCode: `<?php
echo "CogniCSE PHP 8.3 Sandbox\\n";
?>
`,
    buggyPreset: {
      title: 'PHP: PDO MySQL Connection Port 80 vs 3306',
      description: 'Attempting to bind a MySQL database client connection to HTTP web port 80.',
      code: `<?php
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
      errorLog: `Fatal error: Uncaught PDOException: SQLSTATE[HY000] [2002] Connection refused in db.php:11
Stack trace:
#0 db.php(11): PDO->__construct('mysql:host=localhost;port=80;dbname=test', 'root', '')
#1 {main}`,
      fixCheck: (c) => {
        if (/port\s*=\s*['"]?3306['"]?/i.test(c) && !/port\s*=\s*['"]?80['"]?/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Verified! You correctly updated the socket port to 3306 for the MySQL daemon.',
          };
        }
        return {
          isFixed: false,
          feedback: 'The PDO connection string still refers to port 80. MySQL default listening port is 3306.',
        };
      },
      tier1Hint: 'Notice how your PHP application is targeting port 80. What standard protocol is port 80 reserved for in networking?',
      tier2Concept: 'Port 80 is the standardized TCP port for HTTP web servers (Apache, Nginx). MySQL database daemons listen on TCP port 3306.',
      tier3Drill: 'What is the standard 4-digit TCP port number assigned by IANA for MySQL servers?',
      tier4Guidance: 'Change `$port = \'80\';` to `$port = \'3306\';`.',
    },
  },
  {
    id: 'go',
    name: 'Go (Golang)',
    version: 'Go 1.22',
    extension: 'go',
    defaultCode: `package main

import "fmt"

func main() {
    fmt.Println("CogniCSE Go 1.22 Sandbox")
}
`,
    buggyPreset: {
      title: 'Go: Goroutine Loop Variable Capture Bug',
      description: 'Before Go 1.22, spawning goroutines inside loops captured the loop variable reference rather than value.',
      code: `package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    values := []string{"Alpha", "Beta", "Gamma"}

    for _, v := range values {
        wg.Add(1)
        go func() {
            defer wg.Done()
            // Bug: In older Go models, v was shared across all spawned goroutines!
            fmt.Println(v)
        }()
    }
    wg.Wait()
}
`,
      errorLog: `Non-deterministic / Race condition detected:
Output often prints:
Gamma
Gamma
Gamma
Data race warning on variable 'v'.`,
      fixCheck: (c) => {
        if (/go\s+func\s*\(\s*val\s+string\s*\)/i.test(c) || /go\s+func\s*\(\s*v\s+string\s*\)/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Brilliant! Passing the loop variable as an explicit argument copies it into each goroutine stack.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Pass the iteration variable `v` as a parameter to the anonymous function: `go func(val string) { ... }(v)`.',
        };
      },
      tier1Hint: 'How does Go allocate loop variables: does each iteration get its own distinct variable or is the variable reused?',
      tier2Concept: 'In Go, passing a variable as an argument to a goroutine captures its value at invocation time by copy.',
      tier3Drill: 'How can you pass `v` into the goroutine closure to create an isolated stack frame parameter?',
      tier4Guidance: 'Change the call to `go func(val string) { fmt.Println(val) }(v)`.',
    },
  },
  {
    id: 'rust',
    name: 'Rust',
    version: 'Rust 1.78',
    extension: 'rs',
    defaultCode: `fn main() {
    println!("CogniCSE Rust 1.78 Sandbox");
}
`,
    buggyPreset: {
      title: 'Rust: Use After Move (Borrow Checker)',
      description: 'Passing a non-Copy type by value transfers ownership, invalidating the original binding.',
      code: `fn print_payload(s: String) {
    println!("Received: {}", s);
}

fn main() {
    let message = String::from("CRITICAL_SECURITY_PACKET");
    
    // Bug: Ownership of message is moved into print_payload!
    print_payload(message);
    
    // Attempting to reuse moved value:
    println!("Length: {}", message.len());
}
`,
      errorLog: `error[E0382]: borrow of moved value: \`message\`
  --> src/main.rs:11:28
   |
7  |     let message = String::from("CRITICAL_SECURITY_PACKET");
   |         ------- move occurs because \`message\` has type \`String\`, which does not implement the \`Copy\` trait
8  |     print_payload(message);
   |                   ------- value moved here
...
11 |     println!("Length: {}", message.len());
   |                            ^^^^^^^ value borrowed here after move`,
      fixCheck: (c) => {
        if (/print_payload\s*\(\s*&message\s*\)/i.test(c) || /print_payload\s*\(\s*message\.clone\(\)\s*\)/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Solved! Borrowing `&message` or cloning avoids relinquishing ownership to the callee.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Rust compiler forbids using moved values. Borrow `&message` instead of transferring ownership.',
        };
      },
      tier1Hint: 'What happens to the ownership of a `String` when it is passed to a function taking `s: String` instead of `s: &str`?',
      tier2Concept: 'Rust enforces affine types: a value can only have one owner at a time. To inspect a value without moving it, borrow it via a shared reference `&`.',
      tier3Drill: 'What symbol prefix creates an immutable borrowed reference to a variable in Rust?',
      tier4Guidance: 'Change the parameter in `print_payload` to `&str` or `&String`, and pass `&message` on line 8.',
    },
  },
  {
    id: 'sql',
    name: 'SQL (PostgreSQL / SQLite)',
    version: 'ANSI SQL',
    extension: 'sql',
    defaultCode: `-- SQL Playground
SELECT 'CogniCSE SQL Environment' AS status;
`,
    buggyPreset: {
      title: 'SQL: Unparameterized String Injection',
      description: 'Concatenating raw user inputs into dynamic SQL strings opens critical injection vectors.',
      code: `-- Vulnerable Authentication Query
-- Assume $input = "' OR '1'='1"
SELECT * FROM users 
WHERE username = '' OR '1'='1' 
AND password_hash = 'xyz';
`,
      errorLog: `SECURITY VULNERABILITY ALERT [CWE-89]:
Query parsed without parameterized binding. 
Authentication condition bypassed: ('1'='1') evaluates to TRUE for all table rows!
Entire customer database dumped.`,
      fixCheck: (c) => {
        if (/\?/i.test(c) || /:\w+/i.test(c) || /\$1/i.test(c) || /PREPARE/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Secure! Parameterized placeholders separate SQL grammatical tokens from literal user payloads.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Use parameter placeholders (e.g. `WHERE username = ? AND password_hash = ?`) instead of string interpolation.',
        };
      },
      tier1Hint: 'Why is it dangerous when untrusted user text can modify the grammar and logic tree of a database query?',
      tier2Concept: 'Prepared statements pre-compile the SQL grammar once. User inputs are treated strictly as data literals, neutralizing injected quotes or boolean clauses.',
      tier3Drill: 'What character symbol is standard in prepared statements to denote a query parameter placeholder?',
      tier4Guidance: 'Use parameterized queries: `SELECT * FROM users WHERE username = ? AND password_hash = ?`.',
    },
  },
  {
    id: 'ruby',
    name: 'Ruby',
    version: '3.3',
    extension: 'rb',
    defaultCode: `puts "CogniCSE Ruby 3.3 Sandbox"
`,
    buggyPreset: {
      title: 'Ruby: NilClass NoMethodError in Chained Calls',
      description: 'Invoking methods on nil when an associative array or database lookup misses.',
      code: `user_data = { "name" => "Rishi" }

# Bug: "email" key does not exist; returns nil!
domain = user_data["email"].split("@").last

puts "Domain: #{domain}"
`,
      errorLog: `undefined method \`split' for nil:NilClass (NoMethodError)
    domain = user_data["email"].split("@").last
                               ^^^^^^`,
      fixCheck: (c) => {
        if (/user_data\["email"\]\?\.split/i.test(c) || /user_data\.dig/i.test(c) || /if\s+user_data\["email"\]/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Protected! Safe navigation `&.` or `dig` prevents NoMethodError crashes on nil.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Use Ruby safe navigation operator `&.` (e.g. `user_data["email"]&.split("@")&.last`).',
        };
      },
      tier1Hint: 'What does a Ruby hash return when you query a key that does not exist?',
      tier2Concept: 'Accessing a missing key in Ruby returns `nil`. Calling any method on `nil` (except nil methods) triggers a NoMethodError.',
      tier3Drill: 'Which safe navigation operator introduced in Ruby 2.3 checks for nil before sending a method call?',
      tier4Guidance: 'Use `user_data["email"]&.split("@")&.last || "No Email Provided"`.',
    },
  },
  {
    id: 'swift',
    name: 'Swift',
    version: '5.10',
    extension: 'swift',
    defaultCode: `import Foundation

print("CogniCSE Swift 5.10 Sandbox")
`,
    buggyPreset: {
      title: 'Swift: Force Unwrapping Optional Crash',
      description: 'Using the `!` operator on a nil optional causes fatal runtime crashes.',
      code: `var parsedScore: Int? = Int("InvalidScoreNumber") // Returns nil!

// Bug: Force unwrapping with '!' assumes value is never nil!
let finalScore: Int = parsedScore! 

print("Student Score: \\(finalScore)")
`,
      errorLog: `Fatal error: Unexpectedly found nil while unwrapping an Optional value
Current stack trace:
0   libswiftCore.so                    0x00007f35b6d77320 swift_reportError + 48
1   libswiftCore.so                    0x00007f35b6d9e030 _swift_runtime_on_report + 32
2   Main                               0x000055743b17c244 main + 244`,
      fixCheck: (c) => {
        if (/if\s+let/i.test(c) || /guard\s+let/i.test(c) || /\?\?/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Safe! Using `if let`, `guard let`, or the nil-coalescing operator `??` guarantees crash-free optional handling.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Never use force unwrap `!`. Use `if let score = parsedScore` or nil-coalescing `parsedScore ?? 0`.',
        };
      },
      tier1Hint: 'What happens when `Int("some text")` cannot parse numbers into an integer?',
      tier2Concept: 'In Swift, optionals explicitly signal the possible absence of a value. Force unwrapping with `!` bypasses compiler safety.',
      tier3Drill: 'Which binary operator `??` provides a fallback default value for a Swift Optional?',
      tier4Guidance: 'Use nil coalescing: `let finalScore = parsedScore ?? 0` or `if let score = parsedScore { ... }`.',
    },
  },
  {
    id: 'html',
    name: 'HTML / CSS',
    version: 'HTML5',
    extension: 'html',
    defaultCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #0f172a; color: #fff; }
  </style>
</head>
<body>
  <h1>CogniCSE Web Preview</h1>
</body>
</html>
`,
    buggyPreset: {
      title: 'HTML: Missing Viewport Meta Tag for Mobile Devices',
      description: 'Without a viewport meta tag, mobile browsers render responsive sites with desktop 980px zoom out.',
      code: `<!DOCTYPE html>
<html>
<head>
  <title>Student Portal</title>
  <!-- Bug: Missing mobile viewport declaration! -->
</head>
<body>
  <div style="width: 100%; font-size: 16px;">
    Mobile devices will render this tiny and unreadable!
  </div>
</body>
</html>
`,
      errorLog: `Lighthouse Audit Warning [Mobile Friendliness]:
- No <meta name="viewport"> tag found in document <head>.
- Tap targets are not sized appropriately.
- Text is too small to read on mobile viewports.`,
      fixCheck: (c) => {
        if (/name\s*=\s*['"]viewport['"]/i.test(c) && /width=device-width/i.test(c)) {
          return {
            isFixed: true,
            feedback: 'Compliant! `<meta name="viewport" content="width=device-width, initial-scale=1.0">` ensures crisp mobile responsiveness.',
          };
        }
        return {
          isFixed: false,
          feedback: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1.0">` inside the `<head>` tag.',
        };
      },
      tier1Hint: 'How does a smartphone browser know whether your page was designed for mobile screen widths or desktop screens?',
      tier2Concept: 'Mobile browsers default to a desktop virtual viewport (typically 980px) and scale it down unless instructed via viewport meta.',
      tier3Drill: 'What attribute name on `<meta>` configures viewport scale and dimensions?',
      tier4Guidance: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1.0">` to the `<head>`.',
    },
  },
];
