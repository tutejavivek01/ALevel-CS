// The full AQA A-Level Computer Science (7517) subject content, one entry
// per spec section 4.1-4.13, shown on each topic's detail page
// (design.md §6.12, requirements.md §11.1).
//
// Transcribed VERBATIM from reference/aqa-cs-7517-spec-content.md - which
// is itself compiled from AQA's own subject-content pages. Per
// principles.md §2 and conventions.md's content-accuracy workflow this is
// the content the product is accountable for getting right: it must trace
// to the real AQA spec, and it must NOT be summarised down to the
// one-line checklist labels in topics.ts (those labels ARE the summary of
// this). Update this file by hand from the reference file if AQA revises
// the spec; do not scrape aqa.org.uk at build or run time.
//
// 4.14 (the NEA) is deliberately absent - it is not a topic, it lives in
// nea.ts and on the /nea route.

export type SpecPoint = {
  // The spec's own sub-number where it nests points under a heading
  // (e.g. 4.1.1.1). Omitted where the source has an unnumbered item.
  ref?: string;
  text: string;
};

export type SpecSection = {
  // Mirrors the numbered heading in the reference file: '4.4.2',
  // '4.1.1', '4.13.1.3'. Always begins with the owning topic's ref.
  ref: string;
  title: string;
  // Prose. May contain \n\n paragraph breaks (inserted only between the
  // source's own *Emphasised labels:* in the densest sections - the text
  // itself is unchanged).
  detail?: string;
  // Enumerated sub-items, used only where the spec nests numbered points
  // under a heading (4.1.1.1-16, 4.1.2.1-3).
  points?: SpecPoint[];
};

export type TopicSpecContent = {
  // Matches Topic.ref in topics.ts.
  ref: string;
  // A parenthetical context note the spec attaches to the section as a
  // whole (not to one sub-section).
  note?: string;
  sections: SpecSection[];
};

export const SPEC_CONTENT: TopicSpecContent[] = [
  {
    ref: '4.1',
    sections: [
      {
        ref: '4.1.1',
        title: 'Programming',
        points: [
          {
            ref: '4.1.1.1',
            text: 'Data Types — Understand data type concepts. Use appropriately: integer, real/float, Boolean, character, string, date/time, pointer/reference, records, arrays. Define and use user-defined data types based on built-in types.',
          },
          {
            ref: '4.1.1.2',
            text: 'Programming Concepts — Combine statement types: variable declaration, constant declaration, assignment, iteration, selection, subroutines. Use definite and indefinite iteration (condition at start or end). Implement nested selection and iteration structures. Use meaningful identifier names.',
          },
          {
            ref: '4.1.1.3',
            text: 'Arithmetic Operations — Addition, subtraction, multiplication. Real/float division, integer division with remainders. Exponentiation, rounding, truncation.',
          },
          {
            ref: '4.1.1.4',
            text: 'Relational Operations — Equal to, not equal to, less than, greater than, less than or equal to, greater than or equal to.',
          },
          {
            ref: '4.1.1.5',
            text: 'Boolean Operations — NOT, AND, OR, XOR.',
          },
          {
            ref: '4.1.1.6',
            text: 'Constants and Variables — Explain differences between variables and constants. Explain advantages of named constants.',
          },
          {
            ref: '4.1.1.7',
            text: 'String-Handling Operations — Length, position, substring, concatenation. Character ↔ character code conversions. String conversion operations (string/integer/float/date/time conversions).',
          },
          {
            ref: '4.1.1.8',
            text: 'Random Number Generation — Familiar with and use random number generation.',
          },
          {
            ref: '4.1.1.9',
            text: 'Exception Handling — Understand exception handling concepts. Use exception handling in programming languages.',
          },
          {
            ref: '4.1.1.10',
            text: 'Subroutines (Procedures/Functions) — Understand subroutines and their uses. Know subroutines as named, out-of-line code blocks. Explain advantages of using subroutines.',
          },
          {
            ref: '4.1.1.11',
            text: 'Parameters of Subroutines — Describe parameter use for data passing. Use subroutines with interfaces.',
          },
          {
            ref: '4.1.1.12',
            text: 'Returning Values — Use subroutines that return values to calling routines.',
          },
          {
            ref: '4.1.1.13',
            text: 'Local Variables — Understand local variables exist only during subroutine execution, accessible only within the subroutine. Use local variables and explain best practices.',
          },
          {
            ref: '4.1.1.14',
            text: 'Global Variables — Contrast local variables with global variables.',
          },
          {
            ref: '4.1.1.15',
            text: 'Stack Frames in Subroutine Calls — Explain how stack frames store return addresses, parameters, and local variables.',
          },
          {
            ref: '4.1.1.16',
            text: 'Recursive Techniques — Use recursive techniques (general and base cases). Solve simple problems using recursion.',
          },
        ],
      },
      {
        ref: '4.1.2',
        title: 'Programming Paradigms',
        points: [
          {
            ref: '4.1.2.1',
            text: 'Overview — Understand procedural and object-oriented paradigms through practical experience.',
          },
          {
            ref: '4.1.2.2',
            text: 'Procedural-Oriented Programming — Understand structured program design and construction. Construct and use hierarchy charts. Explain advantages of a structured approach.',
          },
          {
            ref: '4.1.2.3',
            text: 'Object-Oriented Programming — Familiar with: class, object, instantiation, encapsulation, inheritance, aggregation, composition, polymorphism, overriding. Know why the object-oriented paradigm is used. Apply design principles: encapsulate what varies, favour composition over inheritance, program to interfaces. Write object-oriented programs (abstract, virtual, static methods; inheritance; aggregation; polymorphism; access specifiers). Draw and interpret class diagrams (single inheritance, composition, aggregation, access specifiers).',
          },
        ],
      },
    ],
  },

  {
    ref: '4.2',
    sections: [
      {
        ref: '4.2.1',
        title: 'Data Structures and Abstract Data Types',
        detail:
          'Understand the concept of data structures and their practical applications. Single- and multi-dimensional arrays: use arrays (or equivalent) in the design of solutions to simple problems; apply 1D arrays (vectors) and 2D arrays (matrices); work with n-dimensional arrays. Fields, records and files: read/write operations with text files and binary files. Abstract data types: understand and use queues, stacks, graphs, trees, hash tables, dictionaries, vectors; distinguish static vs dynamic structures; compare advantages/disadvantages of each approach; create and maintain data in queues (linear, circular, priority), stacks, and hash tables.',
      },
      {
        ref: '4.2.2',
        title: 'Queues',
        detail:
          'Add/remove items; test for empty or full states; apply operations to linear, circular, and priority queues.',
      },
      {
        ref: '4.2.3',
        title: 'Stacks',
        detail:
          'Push and pop operations; peek/top returns the value of the top element without removing it; test for empty/full conditions.',
      },
      {
        ref: '4.2.4',
        title: 'Graphs',
        detail:
          'Understand graphs as complex relationship representations. Explain vertices, edges, weighted graphs, directed/undirected graphs. Represent graphs using adjacency matrices and adjacency lists. Compare representation methods.',
      },
      {
        ref: '4.2.5',
        title: 'Trees',
        detail:
          'A tree is a connected, undirected graph with no cycles. Understand rooted trees with parent-child relationships. Apply binary trees (including binary search trees).',
      },
      {
        ref: '4.2.6',
        title: 'Hash Tables',
        detail:
          'Apply simple hashing algorithms. Handle collisions through rehashing.',
      },
      {
        ref: '4.2.7',
        title: 'Dictionaries',
        detail:
          'Use key-value pair structures. Apply to information retrieval tasks.',
      },
      {
        ref: '4.2.8',
        title: 'Vectors',
        detail:
          'Represent vectors as lists, functions, arrays, or geometric arrows. Perform vector addition and scalar multiplication. Calculate dot products and convex combinations. Apply vectors to angle calculations.',
      },
    ],
  },

  {
    ref: '4.3',
    sections: [
      {
        ref: '4.3.1',
        title: 'Graph-Traversal',
        detail:
          'Trace breadth-first and depth-first search algorithms. Applications: breadth-first = shortest path for an unweighted graph; depth-first = navigating a maze.',
      },
      {
        ref: '4.3.2',
        title: 'Tree-Traversal',
        detail:
          'Trace pre-order, post-order, and in-order traversals. Uses: pre-order = copying a tree; in-order = binary search trees, ascending order output; post-order = infix-to-RPN conversion, tree emptying.',
      },
      {
        ref: '4.3.3',
        title: 'Reverse Polish',
        detail:
          'Convert expressions between infix and Reverse Polish Notation (RPN) forms. Applications: eliminates brackets; enables stack-based evaluation in interpreters (Postscript, bytecode).',
      },
      {
        ref: '4.3.4',
        title: 'Searching Algorithms',
        detail:
          'Linear search: trace and analyse complexity O(n). Binary search: trace and analyse complexity O(log n). Binary tree search: trace and analyse complexity O(log n).',
      },
      {
        ref: '4.3.5',
        title: 'Sorting Algorithms',
        detail:
          'Bubble sort: trace and analyse O(n²) complexity; example of inefficient sorting. Merge sort: trace and analyse O(n log n) complexity; demonstrates divide-and-conquer.',
      },
      {
        ref: '4.3.6',
        title: 'Optimisation Algorithms',
        detail:
          "Dijkstra's shortest path algorithm: understand and trace the algorithm; identify applications; the algorithm's steps need not be memorised.",
      },
    ],
  },

  {
    ref: '4.4',
    note: "This is the section behind the school's “Unit 2 — Systematic Approach to Problem Solving” as taught; see 4.4.1–4.4.2 especially. All 4.4 content is A-level only.",
    sections: [
      {
        ref: '4.4.1',
        title: 'Abstraction and Automation',
        detail:
          'Develop and check solutions to simple logic problems. Understand algorithms as a sequence of steps that can be followed to complete a task. Express solutions using pseudo-code with sequence, assignment, selection, iteration. Hand-trace algorithms and convert pseudo-code to high-level languages. Understand representational abstraction and abstraction by generalisation. Know information hiding, procedural abstraction, functional abstraction, and data abstraction. Understand problem abstraction/reduction, decomposition, and composition. Comprehend automation through models, algorithms, code, and data structures.',
      },
      {
        ref: '4.4.2',
        title: 'Regular Languages',
        detail:
          'Finite State Machines (FSMs): draw and interpret state transition diagrams and tables for FSMs with/without output (Mealy machines).\n\nSet Mathematics: set notation, empty sets, set comprehension; finite/infinite/countably infinite sets and cardinality; subsets, proper subsets, Cartesian products; set operations — membership, union, intersection, difference.\n\nRegular Expressions: form simple regular expressions for string matching using metacharacters (*, +, ?, |); describe the relationship between regular expressions and FSMs; write regular expressions and FSMs for equivalent languages.',
      },
      {
        ref: '4.4.3',
        title: 'Context-Free Languages',
        detail:
          'Check syntax using BNF/syntax diagrams. Formulate simple production rules. Explain why BNF represents languages that regular expressions cannot.',
      },
      {
        ref: '4.4.4',
        title: 'Classification of Algorithms',
        detail:
          'Compare algorithms by complexity relative to problem size. Understand time and space efficiency. Apply Big-O notation to constant, logarithmic, linear, polynomial, exponential time. Derive algorithm time complexity. Distinguish tractable vs intractable problems. Recognise non-computable problems and the Halting Problem.',
      },
      {
        ref: '4.4.5',
        title: 'A Model of Computation',
        detail:
          'Turing Machines: understand the structure — finite states, alphabet, infinite tape, read-write head; represent transitions as functions and diagrams; hand-trace simple Turing machines; explain their importance to computation theory.',
      },
    ],
  },

  {
    ref: '4.5',
    sections: [
      {
        ref: '4.5.1',
        title: 'Number Systems',
        detail:
          'Natural numbers, integers, rational numbers, irrational numbers, real numbers, ordinal numbers. Distinguish natural numbers (counting) from real numbers (measurement).',
      },
      {
        ref: '4.5.2',
        title: 'Number Bases',
        detail:
          'Concept of number base systems. Convert between decimal (base 10), binary (base 2), and hexadecimal (base 16). Use hexadecimal as binary shorthand.',
      },
      {
        ref: '4.5.3',
        title: 'Units of Information',
        detail:
          'Bit as fundamental unit; byte = 8 bits. Apply 2ⁿ formula: n bits represent 2ⁿ different values. Binary prefixes (KiB, MiB, GiB, TiB) vs decimal prefixes (kB, MB, GB, TB).',
      },
      {
        ref: '4.5.4',
        title: 'Binary Number System',
        detail:
          'Unsigned binary: differentiate from signed; calculate min/max for n bits (0 to 2ⁿ−1); add and multiply unsigned binary integers.\n\nSigned binary (two’s complement): represent positive/negative integers; perform subtraction using two’s complement; calculate range for n bits.\n\nFractional numbers: fixed-point and floating-point binary (mantissa + exponent); convert decimal ↔ binary.\n\nRounding errors: inaccuracies in fixed/floating point; numbers incapable of exact binary representation.\n\nAbsolute and relative error: calculate both; compare for large, small, and near-unity magnitudes.\n\nRange and precision: fixed vs floating point trade-offs.\n\nNormalisation: normalise floating-point numbers with positive/negative mantissas.\n\nUnderflow and overflow: explain these conditions.',
      },
      {
        ref: '4.5.5',
        title: 'Information Coding Systems',
        detail:
          "Distinguish character code representation from pure binary. Describe ASCII and Unicode; explain Unicode's rationale. Apply parity bits, majority voting, checksums, and check digits for error detection/correction.",
      },
      {
        ref: '4.5.6',
        title: 'Representing Images, Sound, and Other Data',
        detail:
          'Bit patterns represent graphics and sound. Analogue vs digital data/signals. ADC/DAC operation principles.\n\nBitmapped graphics: resolution, colour depth, pixel dimensions; storage = size in pixels × colour depth; typical metadata.\n\nVector graphics: object property lists; primitives; compare vs bitmap.\n\nDigital sound: sample resolution, sampling rate, Nyquist theorem; calculate file sizes.\n\nMIDI: purpose and event messages; advantages for music representation.\n\nData compression: why images/sound/text need compression; lossless vs lossy; run-length encoding (RLE); dictionary-based compression.\n\nEncryption: cipher/plaintext/ciphertext terms; Caesar cipher and its vulnerability; Vernam cipher (one-time pad) and perfect security; contrast with computationally secure alternatives.',
      },
    ],
  },

  {
    ref: '4.6',
    sections: [
      {
        ref: '4.6.1',
        title: 'Hardware and Software',
        detail:
          'Define the relationship between, and distinguish, hardware and software.',
      },
      {
        ref: '4.6.1.2',
        title: 'Classification of Software',
        detail:
          'System vs application software; why different types exist and their key attributes.',
      },
      {
        ref: '4.6.1.3',
        title: 'System Software',
        detail:
          'Functions of operating systems; roles of utility programs; purpose of libraries; translators — compilers, assemblers, interpreters.',
      },
      {
        ref: '4.6.1.4',
        title: 'Role of an Operating System',
        detail:
          'Abstracting hardware complexity; managing processor, memory and I/O allocation across processes.',
      },
      {
        ref: '4.6.2',
        title: 'Classification of Programming Languages',
        detail:
          'Development and categorisation of languages. Low-level (machine code, assembly) vs high-level imperative languages. Advantages/disadvantages of each. Relationship of high-level imperative languages to low-level code.',
      },
      {
        ref: '4.6.3',
        title: 'Types of Program Translator',
        detail:
          'Roles of assembler, compiler, interpreter. Contrast compilation and interpretation. Appropriate contexts for each. Bytecode production and usage. Source code vs executable object code.',
      },
      {
        ref: '4.6.4',
        title: 'Logic Gates',
        detail:
          'Construct truth tables for NOT, AND, OR, XOR, NAND, NOR. Interpret logic gate circuit diagrams. Complete truth tables for gate circuits. Derive Boolean expressions from circuits and vice versa. Trace half-adder and full-adder logic; construct half-adder circuits. Apply D-type flip-flops as memory units.',
      },
      {
        ref: '4.6.5',
        title: 'Boolean Algebra',
        detail:
          "Use Boolean identities and De Morgan's laws to simplify expressions.",
      },
    ],
  },

  {
    ref: '4.7',
    sections: [
      {
        ref: '4.7.1',
        title: 'Internal Hardware Components',
        detail:
          'Roles of processor, main memory, address/data/control buses, I/O controllers. Component communication via buses. Von Neumann vs Harvard architectures and typical applications. Addressable memory.',
      },
      {
        ref: '4.7.2',
        title: 'The Stored Program Concept',
        detail:
          'Machine code instructions stored in main memory are fetched and executed by processors performing arithmetic/logical operations.',
      },
      {
        ref: '4.7.3',
        title: 'Processor Structure and Role',
        detail:
          'Components: arithmetic logic unit, control unit, clock; general-purpose and dedicated registers (program counter, current instruction register, memory address register, memory buffer register, status register).\n\nFetch-Execute Cycle: fetch, decode, execute stages, and register roles throughout.\n\nInstruction Set: opcode and operand(s) — values, addresses, or registers.\n\nAddressing Modes: immediate (operand is the datum) and direct (operand is the datum’s address).\n\nMachine-Code Operations: load, add, subtract, store, branching, compare, logical bitwise operators (AND, OR, NOT, XOR), shift operations, halt; express in assembly language using immediate/direct addressing.\n\nInterrupts: roles and interrupt service routines; effects on the fetch-execute cycle and preserving the volatile environment.\n\nPerformance Factors: multiple cores, cache memory, clock speed, word length, address/data bus width.',
      },
      {
        ref: '4.7.4',
        title: 'External Hardware Devices',
        detail:
          "I/O devices: characteristics/operation of barcode readers, digital cameras, laser printers, RFID.\n\nSecondary storage: why it's needed; characteristics of hard disks, optical disks, SSDs; compare capacity, access speed, suitability.",
      },
    ],
  },

  {
    ref: '4.8',
    note: 'A-level only.',
    sections: [
      {
        ref: '4.8.1',
        title:
          'Individual (Moral), Social (Ethical), Legal and Cultural Issues and Opportunities',
        detail:
          "Awareness of current individual, social, legal and cultural opportunities and risks in computing. How digital technologies have transformed communications and information flows. Computer science's capacity to monitor behaviour, aggregate personal data, and disseminate information at scale. Computer scientists and software engineers have power, and the responsibilities that go with it. Software and algorithms embed moral and cultural values. Consequences of scale — software's global reach creates potential for both significant benefit and substantial harm. Challenges legislators face regulating the digital age.\n\n(Suggested pedagogy: hypothetical scenarios to isolate ethical principles; real-world case studies examining competing ethical values and trade-offs; tensions between individual rights, cultural expectations, informed consent, service value, and commercial interests.)",
      },
    ],
  },

  {
    ref: '4.9',
    sections: [
      {
        ref: '4.9.1',
        title: 'Communication',
        detail:
          "Serial vs parallel transmission (evaluate serial's advantages). Synchronous vs asynchronous transmission; start/stop bits in asynchronous transmission. Definitions: baud rate, bit rate, bandwidth, latency, protocol. Baud rate vs bit rate (multiple bits per signal change possible). Bit rate's proportionality to bandwidth.",
      },
      {
        ref: '4.9.2',
        title: 'Networking',
        detail:
          'Topology: physical star vs logical bus; star-wired networks operating logically as bus via protocol.\n\nHost networking types: peer-to-peer (equal status) vs client-server (clients request services); appropriate use cases.\n\nWireless networking: WiFi purpose and standards; wireless network adapter and access point; security — WPA/WPA2 encryption, disabled SSID broadcast, MAC allow lists; CSMA/CA with/without RTS/CTS; SSID purpose.',
      },
      {
        ref: '4.9.3',
        title: 'The Internet',
        detail:
          'Structure: Internet architecture; packet switching and routers; packet components; router vs gateway; Internet routing; URLs; FQDN, domain name, IP address distinctions; domain name organisation; DNS purpose; Internet registries.\n\nSecurity: firewalls — packet filtering, proxy server, stateful inspection; symmetric and asymmetric encryption with key exchange; digital certificates and signatures; worms, trojans, viruses and exploited vulnerabilities; code quality, monitoring, and protection countermeasures.',
      },
      {
        ref: '4.9.4',
        title: 'TCP/IP Protocol Suite',
        detail:
          'Stack: application, transport, network, link layers; socket functions; MAC address roles; well-known ports vs client ports.\n\nApplication-layer protocols: FTP, HTTP, HTTPS, POP3, SMTP, SSH — client/server behaviour for each; SSH remote management and secure login.\n\nIP addressing: network/host identifier division; subnet masking; IPv4 and IPv6 (rationale for IPv6); public vs private (routable/non-routable) IP addresses; DHCP; NAT; port forwarding.\n\nClient-Server Model: request/response messaging; WebSocket (persistent full-duplex); Web CRUD/REST mapping to HTTP/SQL; JSON vs XML (readability, compactness, ease of creation, parsing speed).\n\nThin vs thick-client computing: compare computational distribution models.',
      },
    ],
  },

  {
    ref: '4.10',
    sections: [
      {
        ref: '4.10.1',
        title: 'Conceptual Data Models and Entity Relationship Modelling',
        detail:
          'Create data models from given requirements for scenarios with multiple entities. Produce entity relationship diagrams. Write entity descriptions as Entity1(Attribute1, Attribute2, …), underlining the primary key.',
      },
      {
        ref: '4.10.2',
        title: 'Relational Databases',
        detail:
          'What constitutes a relational database. Define attribute, primary key, composite primary key, foreign key.',
      },
      {
        ref: '4.10.3',
        title: 'Database Design and Normalisation',
        detail:
          'Normalise relations to third normal form (3NF). Properties of relations in 3NF. Rationale for normalisation.',
      },
      {
        ref: '4.10.4',
        title: 'Structured Query Language (SQL)',
        detail:
          'Use SQL to retrieve, update, insert, and delete data from multiple tables. Use SQL to define database table structures.',
      },
      {
        ref: '4.10.5',
        title: 'Client Server Databases',
        detail:
          'Client-server systems allow simultaneous access for multiple clients. Methods for controlling concurrent access: record locks, serialisation, timestamp ordering, commitment ordering. The problem of lost updates when multiple clients edit records simultaneously.',
      },
    ],
  },

  {
    ref: '4.11',
    note: 'A-level only.',
    sections: [
      {
        ref: '4.11.1',
        title: 'Big Data',
        detail:
          'Characteristics: Big Data = datasets too large for standard containers. Volume (exceeds single-server capacity); velocity (real-time streaming, milliseconds-to-seconds response); variety (structured, unstructured, text, multimedia).\n\nChallenges: analysing unstructured data is significantly harder; relational databases unsuitable for unstructured data; machine learning needed to find patterns; scalability issues beyond single-server capacity.\n\nDistributed processing: processing spans multiple machines; functional programming enables efficient distributed code (immutable data structures, statelessness, higher-order functions).\n\nData models: fact-based model (each fact = one information element); graph schema (nodes, edges, properties).',
      },
    ],
  },

  {
    ref: '4.12',
    sections: [
      {
        ref: '4.12.1',
        title: 'Functional Programming Paradigm',
        detail:
          'Function notation f: A → B (domain/co-domain). Functions as first-class objects (passed as arguments, returned from calls). Function application (e.g. add(3,4)); multi-argument functions taken one argument at a time. Partial function application (e.g. “add 4” returns a function awaiting another integer). Composition of functions: g ∘ f means f applied first, then g to the result.',
      },
      {
        ref: '4.12.2',
        title: 'Writing Functional Programs',
        detail:
          'Construct simple programs in functional languages (Haskell, Standard ML, Scheme, Lisp) or languages with functional support (Python, F#, C#, Scala, Java 8, etc.). Higher-order functions (accept/return functions). Key operations: map (applies a function to each list element), filter (keeps elements matching a condition), reduce/fold (reduces a list to a single value by repeated application).',
      },
      {
        ref: '4.12.3',
        title: 'Lists in Functional Programming',
        detail:
          'Lists as head:tail concatenation; head = single element, tail = remaining list; empty list = []. Operations: head, tail, empty test, length, construct empty list, prepend, append. Implement these in a functional language.',
      },
    ],
  },

  {
    ref: '4.13',
    note: 'This is the software-development-lifecycle methodology the NEA is marked against.',
    sections: [
      {
        ref: '4.13.1.1',
        title: 'Analysis',
        detail:
          'Define problems and establish system requirements through user interaction. Before a problem can be solved, it must be defined and requirements clarified. Apply abstraction to model real-world aspects in programs. Utilise prototyping or agile methodologies during requirements clarification.',
      },
      {
        ref: '4.13.1.2',
        title: 'Design',
        detail:
          'Plan data structures for data models. Design algorithms appropriate to the solution. Structure solutions into modular components with documented interfaces. Create human-user interface designs. Recognise design as an iterative process employing prototyping/agile approaches.',
      },
      {
        ref: '4.13.1.3',
        title: 'Implementation',
        detail:
          'Convert models and algorithms into executable data structures and code. Write, debug, and test programs effectively. Apply iterative processes and prototyping, focusing on critical-path resolution. Justify program correctness and efficiency through logical reasoning.',
      },
      {
        ref: '4.13.1.4',
        title: 'Testing',
        detail:
          'Apply test data covering normal (typical), boundary, and erroneous cases. The implementation must be tested for the presence of errors. Conduct acceptance testing with intended end-users. Gather user feedback to validate against specifications.',
      },
      {
        ref: '4.13.1.5',
        title: 'Evaluation',
        detail: 'Know the criteria for evaluating a computer system.',
      },
    ],
  },
];

export function getSpecContentForTopic(topic: {
  ref: string;
}): TopicSpecContent | undefined {
  return SPEC_CONTENT.find((entry) => entry.ref === topic.ref);
}
