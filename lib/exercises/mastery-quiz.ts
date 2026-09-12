// The default "confident" mastery-gate route: a 10-question quiz per
// quiz-route topic (design.md §6.13, requirements.md §12.2). Hand-authored
// against the real AQA spec content already transcribed in
// lib/spec/spec-content.ts - every question is checkable by plain logic
// only (exact/accepted-answer matching), no AI grader.
//
// This is a NEW interface, not a reuse of SteppedExercise (see
// design.md's decision #21) - that type is shaped around a checked
// sequence of named fields (trace tables, FSM traces), not a
// single-answer quiz item.

export type MasteryQuizQuestion = {
  id: string;
  prompt: string;
  // Present for multiple-choice; absent for short-answer.
  options?: string[];
  // Accepted answer(s), matched case/whitespace-insensitively. For MC,
  // this is the exact text of the correct option.
  accept: string[];
};

// Topics whose "confident" mastery gate is a quiz (everything except
// MASTERY_CHALLENGE_TOPICS in mastery-challenges.ts). Kept here, not
// re-derived, so the two lists are each other's complement by
// construction and a Vitest test can assert every topic appears in
// exactly one.
export const MASTERY_QUIZ_TOPICS = [
  'computation',
  'data-representation',
  'computer-systems',
  'architecture',
  'consequences',
  'networking',
  'databases',
  'big-data',
  'software-dev',
] as const;

// Plain-logic grading only (requirements.md §12.2) - case/whitespace
// -insensitive match against the accepted-answer set. Mirrors the
// trim-before-compare habit in lib/exercises/python-output.ts's
// outputsMatch, applied to a single short answer instead of a stdout
// blob.
export function isQuizAnswerCorrect(
  question: MasteryQuizQuestion,
  given: string
): boolean {
  const normalized = given.trim().toLowerCase();
  return question.accept.some(
    (accepted) => accepted.trim().toLowerCase() === normalized
  );
}

export const MASTERY_QUIZZES: Record<string, MasteryQuizQuestion[]> = {
  computation: [
    {
      id: 'computation-q1',
      prompt:
        'Which of these is NOT one of the four types of abstraction listed in the AQA spec?',
      options: [
        'Procedural abstraction',
        'Data abstraction',
        'Functional abstraction',
        'Numerical abstraction',
      ],
      accept: ['Numerical abstraction'],
    },
    {
      id: 'computation-q2',
      prompt:
        'In a finite state transition diagram, what is the name for a state where the machine may legitimately stop?',
      accept: ['final state', 'accepting state', 'accept state'],
    },
    {
      id: 'computation-q3',
      prompt:
        'A Mealy machine differs from a simple FSM because it also produces:',
      options: ['an output', 'a stack', 'an infinite tape', 'a queue'],
      accept: ['an output'],
    },
    {
      id: 'computation-q4',
      prompt:
        "Give the regular-expression metacharacter that means 'zero or more of the preceding element'.",
      accept: ['*'],
    },
    {
      id: 'computation-q5',
      prompt: 'BNF (Backus-Naur Form) is used to define:',
      options: [
        'context-free languages',
        'regular languages',
        'machine code',
        'floating point formats',
      ],
      accept: ['context-free languages'],
    },
    {
      id: 'computation-q6',
      prompt:
        'What is the name of the complexity class describing an algorithm whose running time is proportional to log(n)?',
      accept: ['logarithmic', 'o(log n)', 'log n'],
    },
    {
      id: 'computation-q7',
      prompt:
        'Which of these is the classic example of a non-computable problem?',
      options: [
        'The Halting Problem',
        'Binary search',
        'Bubble sort',
        'The Travelling Salesman Problem',
      ],
      accept: ['The Halting Problem'],
    },
    {
      id: 'computation-q8',
      prompt:
        'In a Turing machine, what is the name of the component that reads and writes symbols on the tape and can move left or right?',
      accept: ['read-write head', 'head'],
    },
    {
      id: 'computation-q9',
      prompt: "Which best describes a 'tractable' problem?",
      options: [
        'Solvable in polynomial time',
        'Solvable only by guessing',
        'Impossible to solve',
        'Solvable only with unlimited memory',
      ],
      accept: ['Solvable in polynomial time'],
    },
    {
      id: 'computation-q10',
      prompt:
        'Set comprehension, subsets and Cartesian products are part of which spec area?',
      options: [
        'Set mathematics',
        'Regular expressions',
        'BNF',
        'Turing machines',
      ],
      accept: ['Set mathematics'],
    },
  ],

  'data-representation': [
    {
      id: 'data-representation-q1',
      prompt: 'Convert the denary number 23 to 8-bit unsigned binary.',
      accept: ['00010111', '10111'],
    },
    {
      id: 'data-representation-q2',
      prompt: 'How many different values can be represented using 5 bits?',
      accept: ['32'],
    },
    {
      id: 'data-representation-q3',
      prompt: "In two's complement, how do you negate a binary number?",
      options: [
        'Invert all bits and add 1',
        'Invert all bits',
        'Add 1 to the most significant bit',
        'Reverse the bit order',
      ],
      accept: ['Invert all bits and add 1'],
    },
    {
      id: 'data-representation-q4',
      prompt: 'What is 1 KiB in bytes?',
      accept: ['1024'],
    },
    {
      id: 'data-representation-q5',
      prompt: 'A parity bit is used to:',
      options: [
        'detect a single-bit transmission error',
        'encrypt the data',
        'compress the data',
        'address memory',
      ],
      accept: ['detect a single-bit transmission error'],
    },
    {
      id: 'data-representation-q6',
      prompt:
        'In floating-point representation, what is the name for the part of the number holding the significant digits?',
      accept: ['mantissa'],
    },
    {
      id: 'data-representation-q7',
      prompt:
        'Which encoding scheme can represent every character in every modern writing system, unlike ASCII?',
      options: ['Unicode', 'BCD', 'RLE', 'MIDI'],
      accept: ['Unicode'],
    },
    {
      id: 'data-representation-q8',
      prompt:
        'Name the lossless compression technique that replaces runs of a repeated value with a count and the value.',
      accept: ['run-length encoding', 'rle'],
    },
    {
      id: 'data-representation-q9',
      prompt: 'The Caesar cipher is considered weak chiefly because:',
      options: [
        'it has very few possible keys, so it can be brute-forced',
        'it requires a computer to encrypt',
        'it only works on numbers',
        'it cannot be decrypted at all',
      ],
      accept: ['it has very few possible keys, so it can be brute-forced'],
    },
    {
      id: 'data-representation-q10',
      prompt:
        'The Nyquist rate states a signal must be sampled at what rate, relative to its highest frequency component?',
      accept: ['twice the highest frequency', '2x', 'double'],
    },
  ],

  'computer-systems': [
    {
      id: 'computer-systems-q1',
      prompt:
        'Which of these is application software rather than system software?',
      options: [
        'A word processor',
        'An operating system',
        'A device driver',
        'A compiler',
      ],
      accept: ['A word processor'],
    },
    {
      id: 'computer-systems-q2',
      prompt:
        'Name the type of translator that converts an entire high-level program into machine code before it runs.',
      accept: ['compiler'],
    },
    {
      id: 'computer-systems-q3',
      prompt:
        'Name the type of translator that executes a high-level program line by line without producing a separate executable.',
      accept: ['interpreter'],
    },
    {
      id: 'computer-systems-q4',
      prompt: 'What does a NAND gate output when both inputs are 1?',
      options: ['0', '1', 'Undefined', 'Depends on a third input'],
      accept: ['0'],
    },
    {
      id: 'computer-systems-q5',
      prompt:
        'How many rows are in the truth table for a logic circuit with 3 inputs?',
      accept: ['8'],
    },
    {
      id: 'computer-systems-q6',
      prompt: 'A half-adder differs from a full-adder in that it:',
      options: [
        'does not take a carry-in input',
        'cannot produce a carry-out',
        'only works with negative numbers',
        'has no inputs',
      ],
      accept: ['does not take a carry-in input'],
    },
    {
      id: 'computer-systems-q7',
      prompt: "Apply De Morgan's law: what is the equivalent of NOT (A AND B)?",
      accept: ['not a or not b', '(not a) or (not b)'],
    },
    {
      id: 'computer-systems-q8',
      prompt: 'A D-type flip-flop is primarily used as a:',
      options: [
        'memory/storage unit',
        'arithmetic unit',
        'translator',
        'network protocol',
      ],
      accept: ['memory/storage unit'],
    },
    {
      id: 'computer-systems-q9',
      prompt:
        'Name the operating-system responsibility of deciding which process gets the CPU next.',
      accept: ['scheduling', 'process scheduling', 'processor scheduling'],
    },
    {
      id: 'computer-systems-q10',
      prompt: 'Which best describes the role of a library in system software?',
      options: [
        'Pre-written code that other programs can call on',
        'A type of secondary storage',
        'A logic gate',
        'An assembly-language instruction',
      ],
      accept: ['Pre-written code that other programs can call on'],
    },
  ],

  architecture: [
    {
      id: 'architecture-q1',
      prompt:
        'In the Von Neumann architecture, what do program instructions and data share?',
      options: [
        'The same memory',
        'Separate memory',
        'The same register only',
        'Nothing, they are never both present',
      ],
      accept: ['The same memory'],
    },
    {
      id: 'architecture-q2',
      prompt:
        'Name the register that holds the address of the next instruction to be fetched.',
      accept: ['program counter', 'pc'],
    },
    {
      id: 'architecture-q3',
      prompt:
        "Name the register that temporarily holds an instruction while it's being decoded and executed.",
      accept: ['current instruction register', 'cir'],
    },
    {
      id: 'architecture-q4',
      prompt: 'Which stage of the fetch-execute cycle comes first?',
      options: ['Fetch', 'Decode', 'Execute', 'Store'],
      accept: ['Fetch'],
    },
    {
      id: 'architecture-q5',
      prompt:
        "In 'immediate addressing', what does the operand actually represent?",
      accept: [
        'the value/data itself',
        'the actual data',
        'the data itself',
        'the value itself',
      ],
    },
    {
      id: 'architecture-q6',
      prompt: 'An interrupt is best described as a signal that:',
      options: [
        'causes the processor to temporarily stop the current process and handle another task',
        'permanently halts the processor',
        'only happens on startup',
        'is part of the ALU',
      ],
      accept: [
        'causes the processor to temporarily stop the current process and handle another task',
      ],
    },
    {
      id: 'architecture-q7',
      prompt:
        'Name one factor (other than clock speed) that affects processor performance.',
      accept: [
        'number of cores',
        'cores',
        'cache',
        'cache size',
        'word length',
        'bus width',
      ],
    },
    {
      id: 'architecture-q8',
      prompt: 'Which secondary storage type has no moving parts?',
      options: ['SSD', 'Hard disk', 'Optical disk', 'Magnetic tape'],
      accept: ['SSD'],
    },
    {
      id: 'architecture-q9',
      prompt: 'What does ALU stand for?',
      accept: ['arithmetic logic unit'],
    },
    {
      id: 'architecture-q10',
      prompt: 'A wider data bus primarily improves performance by:',
      options: [
        'transferring more bits at once',
        'increasing clock speed',
        'adding more registers',
        'reducing heat',
      ],
      accept: ['transferring more bits at once'],
    },
  ],

  consequences: [
    {
      id: 'consequences-q1',
      prompt:
        "Which of these is most accurately described as an 'ethical' rather than purely legal issue?",
      options: [
        "Whether an algorithm's use is morally justified even if legal",
        'Whether software is copyrighted',
        'Whether a contract was signed',
        'Whether a server is physically secure',
      ],
      accept: ["Whether an algorithm's use is morally justified even if legal"],
    },
    {
      id: 'consequences-q2',
      prompt:
        "Give one risk associated with computer systems' capacity to aggregate personal data at scale.",
      accept: ['privacy loss', 'surveillance', 'profiling', 'loss of privacy'],
    },
    {
      id: 'consequences-q3',
      prompt:
        "Software and algorithms are said to 'embed moral and cultural values' because:",
      options: [
        'design choices reflect the assumptions/priorities of their creators',
        'all code is written in English',
        'software never changes over time',
        'algorithms are always neutral',
      ],
      accept: [
        'design choices reflect the assumptions/priorities of their creators',
      ],
    },
    {
      id: 'consequences-q4',
      prompt:
        'Name one stakeholder group particularly affected by decisions computer scientists make about data collection.',
      accept: ['users', 'the public', 'consumers', 'society'],
    },
    {
      id: 'consequences-q5',
      prompt: "The 'scale' consideration in this topic refers to:",
      options: [
        "how a piece of software's global reach can create both large benefits and large harms",
        'the physical size of a computer',
        'the number of bits in a word',
        'the clock speed of a processor',
      ],
      accept: [
        "how a piece of software's global reach can create both large benefits and large harms",
      ],
    },
    {
      id: 'consequences-q6',
      prompt:
        'Give one reason regulating the digital age is difficult for legislators.',
      accept: [
        'technology changes faster than law',
        'global reach crosses jurisdictions',
        'technology changes too quickly',
      ],
    },
    {
      id: 'consequences-q7',
      prompt:
        'Which of these is a suggested pedagogical approach for this topic, per the specification?',
      options: [
        'Hypothetical scenarios isolating an ethical principle',
        'Memorising legal statutes',
        'Writing a compiler',
        'Tracing a Turing machine',
      ],
      accept: ['Hypothetical scenarios isolating an ethical principle'],
    },
    {
      id: 'consequences-q8',
      prompt:
        'Name one right that can be in tension with the commercial value of collected data.',
      accept: ['privacy', 'individual rights', 'informed consent'],
    },
    {
      id: 'consequences-q9',
      prompt:
        "Computer scientists 'have power, and responsibilities that go with it' mainly because:",
      options: [
        'their systems can monitor behaviour and disseminate information at scale',
        'they are legally required to be certified',
        'they always work for governments',
        'they cannot be held accountable',
      ],
      accept: [
        'their systems can monitor behaviour and disseminate information at scale',
      ],
    },
    {
      id: 'consequences-q10',
      prompt:
        'Name one real-world case-study theme this topic is typically taught through.',
      accept: [
        'algorithmic bias',
        'surveillance',
        'data breaches',
        'social media influence',
        'bias',
      ],
    },
  ],

  networking: [
    {
      id: 'networking-q1',
      prompt: 'Serial transmission sends bits:',
      options: [
        'one after another down a single wire',
        'all at once down multiple wires',
        'only in one direction, ever',
        'only between two computers on the same desk',
      ],
      accept: ['one after another down a single wire'],
    },
    {
      id: 'networking-q2',
      prompt: 'Give the term for the number of bits transmitted per second.',
      accept: ['bit rate'],
    },
    {
      id: 'networking-q3',
      prompt: 'In a star topology, all devices are physically connected to:',
      options: [
        'a central switch/hub',
        'each other directly',
        'a single shared bus cable',
        'nothing, it is wireless only',
      ],
      accept: ['a central switch/hub'],
    },
    {
      id: 'networking-q4',
      prompt:
        'Name the networking model where every device has equal status, as opposed to client-server.',
      accept: ['peer-to-peer', 'p2p'],
    },
    {
      id: 'networking-q5',
      prompt: 'WPA/WPA2 is used on a wireless network primarily to provide:',
      options: [
        'encryption/security',
        'a faster signal',
        'a longer range',
        'a lower cost',
      ],
      accept: ['encryption/security'],
    },
    {
      id: 'networking-q6',
      prompt: 'What does DNS stand for?',
      accept: ['domain name system', 'domain name service'],
    },
    {
      id: 'networking-q7',
      prompt:
        'Which application-layer protocol is used to securely log in to and manage a remote machine?',
      options: ['SSH', 'HTTP', 'SMTP', 'FTP'],
      accept: ['SSH'],
    },
    {
      id: 'networking-q8',
      prompt: 'What does NAT stand for?',
      accept: ['network address translation'],
    },
    {
      id: 'networking-q9',
      prompt:
        'In the TCP/IP model, which layer is responsible for routing packets between networks?',
      options: [
        'Network layer',
        'Application layer',
        'Link layer',
        'Transport layer',
      ],
      accept: ['Network layer'],
    },
    {
      id: 'networking-q10',
      prompt:
        'Give one advantage of a thin-client over a thick-client computing model.',
      accept: [
        'less processing/storage needed on the client',
        'centralised management',
        'easier updates',
        'less processing needed on the client',
      ],
    },
  ],

  databases: [
    {
      id: 'databases-q1',
      prompt:
        'In an entity-relationship diagram, what is the term for a field (or fields) that uniquely identifies each row?',
      accept: ['primary key'],
    },
    {
      id: 'databases-q2',
      prompt: 'A foreign key in one table is:',
      options: [
        'a primary key from another table, used to link the two',
        "always the same as that table's own primary key",
        'never allowed to repeat',
        'only used for security',
      ],
      accept: ['a primary key from another table, used to link the two'],
    },
    {
      id: 'databases-q3',
      prompt:
        "To what normal form does AQA's specification require students to normalise relations?",
      accept: ['third normal form', '3nf'],
    },
    {
      id: 'databases-q4',
      prompt: 'Which SQL keyword is used to remove rows from a table?',
      options: ['DELETE', 'DROP', 'REMOVE', 'CLEAR'],
      accept: ['DELETE'],
    },
    {
      id: 'databases-q5',
      prompt: "Which SQL keyword defines a new table's structure?",
      accept: ['create table', 'create'],
    },
    {
      id: 'databases-q6',
      prompt:
        "The 'lost update' problem in a client-server database occurs when:",
      options: [
        "two clients edit the same record simultaneously and one client's change overwrites the other's",
        'a record is accidentally deleted',
        'a query returns no rows',
        'a table has no primary key',
      ],
      accept: [
        "two clients edit the same record simultaneously and one client's change overwrites the other's",
      ],
    },
    {
      id: 'databases-q7',
      prompt:
        'Give one method (besides record locking) for controlling concurrent access to a database.',
      accept: [
        'serialisation',
        'serialization',
        'timestamp ordering',
        'commitment ordering',
      ],
    },
    {
      id: 'databases-q8',
      prompt: 'Normalisation is primarily done to:',
      options: [
        'reduce data redundancy and avoid update anomalies',
        'make queries slower',
        'increase storage requirements',
        'remove the need for primary keys',
      ],
      accept: ['reduce data redundancy and avoid update anomalies'],
    },
    {
      id: 'databases-q9',
      prompt:
        'In entity notation Student(StudentID, Name, ...), how is the primary key conventionally shown?',
      accept: ['underlined'],
    },
    {
      id: 'databases-q10',
      prompt: 'Which SQL keyword adds new rows to a table?',
      options: ['INSERT', 'ADD', 'APPEND', 'NEW'],
      accept: ['INSERT'],
    },
  ],

  'big-data': [
    {
      id: 'big-data-q1',
      prompt:
        "Which of the '3 Vs' of Big Data refers to how quickly data arrives?",
      options: ['Velocity', 'Volume', 'Variety', 'Validity'],
      accept: ['Velocity'],
    },
    {
      id: 'big-data-q2',
      prompt:
        'Give one reason relational databases struggle with unstructured Big Data.',
      accept: [
        'they need a fixed schema',
        "unstructured data doesn't fit rows and columns",
        'no fixed schema',
      ],
    },
    {
      id: 'big-data-q3',
      prompt: "Big Data's 'volume' characteristic means the dataset:",
      options: [
        'exceeds what a single server can handle',
        'is stored on a single hard disk',
        'is always numerical',
        'never changes',
      ],
      accept: ['exceeds what a single server can handle'],
    },
    {
      id: 'big-data-q4',
      prompt:
        'Name the programming paradigm the specification links to enabling efficient distributed processing of Big Data.',
      accept: ['functional programming', 'functional'],
    },
    {
      id: 'big-data-q5',
      prompt:
        'Which property of functional programming particularly helps distributed processing?',
      options: [
        'Immutable data structures',
        'Global mutable variables',
        'Nested loops',
        'Recursion only',
      ],
      accept: ['Immutable data structures'],
    },
    {
      id: 'big-data-q6',
      prompt:
        'In a graph-schema data model, name the two basic components used to represent data.',
      accept: ['nodes and edges', 'nodes, edges'],
    },
    {
      id: 'big-data-q7',
      prompt:
        'Which technique is typically needed to find patterns in large volumes of unstructured data?',
      options: [
        'Machine learning',
        'Manual inspection',
        'A single SQL query',
        'A spreadsheet',
      ],
      accept: ['Machine learning'],
    },
    {
      id: 'big-data-q8',
      prompt:
        'In the fact-based data model, what does each individual fact represent?',
      accept: [
        'one information element',
        'one information item',
        'a single information element',
      ],
    },
    {
      id: 'big-data-q9',
      prompt: 'Why is variety a challenge for Big Data systems?',
      options: [
        'Data arrives structured, unstructured and in many formats',
        'All data is always the same type',
        'Variety refers only to different countries',
        'Variety means different file sizes',
      ],
      accept: ['Data arrives structured, unstructured and in many formats'],
    },
    {
      id: 'big-data-q10',
      prompt:
        'Give one reason Big Data processing is split across multiple machines rather than one.',
      accept: [
        'single-server capacity limits',
        'scalability',
        'exceeds single-server capacity',
        'scalability limits',
      ],
    },
  ],

  'software-dev': [
    {
      id: 'software-dev-q1',
      prompt:
        'Name the stage of the development lifecycle in which requirements are established through user interaction.',
      accept: ['analysis'],
    },
    {
      id: 'software-dev-q2',
      prompt:
        "Which stage involves creating diagrams, prose, pseudo-code or screenshots to communicate a solution before it's built?",
      options: ['Design', 'Testing', 'Evaluation', 'Analysis'],
      accept: ['Design'],
    },
    {
      id: 'software-dev-q3',
      prompt:
        'Name the two approaches mentioned that support an iterative process at design and implementation stages.',
      accept: [
        'prototyping and agile',
        'agile and prototyping',
        'prototyping',
        'agile',
      ],
    },
    {
      id: 'software-dev-q4',
      prompt:
        'Which of these is a boundary test-data value for a field accepting integers 1 to 10?',
      options: ['10', '5', '50', '-5'],
      accept: ['10'],
    },
    {
      id: 'software-dev-q5',
      prompt:
        'Name the category of test data that is outside the valid range and should be rejected.',
      accept: ['erroneous', 'erroneous data'],
    },
    {
      id: 'software-dev-q6',
      prompt: 'Acceptance testing is conducted with:',
      options: [
        'intended end-users',
        'only the original programmer',
        'a compiler',
        'no humans at all, automatically',
      ],
      accept: ['intended end-users'],
    },
    {
      id: 'software-dev-q7',
      prompt:
        'Which stage of the lifecycle assesses how well the finished system meets its original requirements?',
      accept: ['evaluation'],
    },
    {
      id: 'software-dev-q8',
      prompt:
        'Structuring a solution into modular components with documented interfaces happens at which stage?',
      options: ['Design', 'Testing', 'Analysis', 'Evaluation'],
      accept: ['Design'],
    },
    {
      id: 'software-dev-q9',
      prompt:
        'Give one reason prototyping is useful during requirements clarification.',
      accept: [
        'helps clarify requirements with users early',
        'reveals misunderstandings early',
        'validates requirements with users early',
      ],
    },
    {
      id: 'software-dev-q10',
      prompt:
        'Gathering user feedback to validate a system against its specification happens primarily during:',
      options: ['Testing', 'Design', 'Analysis only', 'Never'],
      accept: ['Testing'],
    },
  ],
};
