import { RES, aqa, type Resource } from './resources';

export type Topic = {
  id: string;
  ref: string;
  title: string;
  unit: string;
  blurb: string;
  items: string[];
  resources: Resource[];
  hasExercises?: boolean;
};

// Ported verbatim from reference/prototype.html's TOPICS array (design.md:
// content lives in code, checked against the real AQA 7517 spec per
// principles.md §2 / conventions.md's content-accuracy workflow - this is
// a direct migration of already-reviewed content, not new authoring).
export const TOPICS: Topic[] = [
  {
    id: 'programming',
    ref: '4.1',
    title: 'Fundamentals of Programming',
    unit: 'Units 1 & 5',
    blurb:
      'The core language toolkit: data types, control structures, subroutines and the two big paradigms (procedural and object-oriented).',
    items: [
      'Data types & user-defined types (records, arrays)',
      'Sequence, selection & iteration (definite and indefinite)',
      'Arithmetic, relational & Boolean operators',
      'String-handling operations',
      'Exception handling',
      'Subroutines: parameters, return values, local vs global scope',
      'Stack frames & recursive techniques',
      'Procedural design & hierarchy charts',
      'OOP: class, object, inheritance, encapsulation, polymorphism',
      'Drawing & interpreting class diagrams',
    ],
    resources: [aqa('fundamentals-of-programming'), RES.isaac, RES.pmtProg],
  },
  {
    id: 'data-structures',
    ref: '4.2',
    title: 'Fundamentals of Data Structures',
    unit: 'Units 1 & 5',
    blurb:
      'How data is organised in memory: arrays and files, then the abstract data types built from them.',
    items: [
      '1D, 2D and n-dimensional arrays',
      'Records, and text/binary file I/O',
      'Stacks — push, pop, peek',
      'Queues — linear, circular, priority',
      'Graphs — adjacency matrix & adjacency list',
      'Trees — binary trees & binary search trees',
      'Hash tables & collision handling',
      'Dictionaries & vectors',
    ],
    resources: [aqa('fundamentals-of-data-structures'), RES.isaac, RES.craig],
  },
  {
    id: 'algorithms',
    ref: '4.3',
    title: 'Fundamentals of Algorithms',
    unit: 'Units 1 & 5',
    blurb:
      'Standard algorithms for traversing, searching, sorting and pathfinding — and being able to trace and compare them.',
    items: [
      'Breadth-first & depth-first graph traversal',
      'Pre-, in- and post-order tree traversal',
      'Infix ↔ Reverse Polish Notation conversion',
      'Linear search & binary search',
      'Bubble sort & merge sort',
      "Dijkstra's shortest path algorithm",
      'Comparing algorithms by time complexity',
    ],
    resources: [aqa('fundamentals-of-algorithms'), RES.isaac, RES.codewars],
  },
  {
    id: 'computation',
    ref: '4.4',
    title: 'Theory of Computation',
    unit: 'Unit 2 — current focus',
    blurb:
      'Computational thinking, pseudocode fluency, abstraction, and finite state machines — plus regular languages, BNF and Turing machines later in the course.',
    items: [
      'Computational thinking: decomposition & abstraction',
      'Reading & writing AQA-style pseudocode',
      'Hand-tracing algorithms (trace tables)',
      'Types of abstraction: representational, procedural, functional, data, information hiding',
      'Finite state machines — state transition diagrams & tables',
      'Mealy machines (FSMs with output)',
      'Regular expressions & set notation',
      'BNF & context-free languages',
      'Big-O notation & tractable/intractable problems',
      'Turing machines',
    ],
    resources: [aqa('theory-of-computation'), RES.pmtFsm, RES.craig],
    hasExercises: true,
  },
  {
    id: 'data-representation',
    ref: '4.5',
    title: 'Fundamentals of Data Representation',
    unit: 'Unit 3',
    blurb:
      'How numbers, text, images, sound and errors are represented and manipulated in binary.',
    items: [
      'Number bases: decimal, binary, hexadecimal conversions',
      'Units of information & binary/decimal prefixes',
      "Unsigned binary & two's complement",
      'Fixed-point & floating-point representation',
      'Rounding, absolute & relative error',
      'ASCII, Unicode & error detection (parity, checksums)',
      'Bitmap & vector graphics',
      'Digital sound: sampling rate, resolution, Nyquist theorem, MIDI',
      'Compression: run-length & dictionary-based',
      'Caesar & Vernam ciphers',
    ],
    resources: [aqa('fundamentals-of-data-representation'), RES.sme, RES.seneca],
  },
  {
    id: 'computer-systems',
    ref: '4.6',
    title: 'Fundamentals of Computer Systems',
    unit: 'Unit 4',
    blurb:
      'Software classification, translators, and the digital logic that underpins every circuit.',
    items: [
      'Hardware vs software, system vs application software',
      'Operating system roles',
      'Compilers, interpreters & assemblers',
      'Logic gates & truth tables',
      'Half-adders & full-adders',
      'D-type flip-flops',
      "Boolean algebra & De Morgan's laws",
    ],
    resources: [aqa('fundamentals-of-computer-systems'), RES.craig, RES.pmt],
  },
  {
    id: 'architecture',
    ref: '4.7',
    title: 'Computer Organisation & Architecture',
    unit: 'Units 1 & 5',
    blurb:
      'What happens inside the processor: registers, the fetch-execute cycle, and the hardware around it.',
    items: [
      'Von Neumann vs Harvard architecture',
      'The stored program concept',
      'CPU registers (PC, CIR, MAR, MBR, status)',
      'The fetch-execute cycle',
      'Instruction sets & addressing modes',
      'Machine code & assembly-language operations',
      'Interrupts & the interrupt service routine',
      'Performance factors: cores, cache, clock speed, bus width',
      'Input/output devices & secondary storage',
    ],
    resources: [
      aqa('fundamentals-of-computer-organisation-and-architecture'),
      RES.craig,
      RES.isaac,
    ],
  },
  {
    id: 'consequences',
    ref: '4.8',
    title: 'Consequences of Uses of Computing',
    unit: '',
    blurb:
      'The moral, social, legal and cultural dimension of computer science — argued from case studies, not just definitions.',
    items: [
      'Moral, social, legal & cultural issues in computing',
      'Privacy, surveillance & data aggregation',
      'Responsibility of computer scientists & software engineers',
      'Case studies: algorithmic bias, scale, regulation',
    ],
    resources: [aqa('consequences-of-uses-of-computing'), RES.sme, RES.seneca],
  },
  {
    id: 'networking',
    ref: '4.9',
    title: 'Communication & Networking',
    unit: 'Unit 6',
    blurb:
      'How data physically moves between machines — from a single cable to the whole internet.',
    items: [
      'Serial vs parallel, synchronous vs asynchronous transmission',
      'Baud rate, bit rate, bandwidth, latency',
      'Network topologies (star, bus)',
      'Peer-to-peer vs client-server networking',
      'Wireless networking, CSMA/CA, WPA',
      'Packet switching, routers & DNS',
      'Firewalls, encryption & digital certificates',
      'The TCP/IP four-layer stack',
      'Application protocols: HTTP, FTP, SMTP, SSH',
      'IP addressing, subnetting, DHCP & NAT',
    ],
    resources: [aqa('fundamentals-of-communication-and-networking'), RES.craig, RES.pmt],
  },
  {
    id: 'databases',
    ref: '4.10',
    title: 'Fundamentals of Databases',
    unit: 'Databases module',
    blurb:
      'Modelling data as entities and relationships, then querying and protecting it with SQL.',
    items: [
      'Entity relationship modelling',
      'Relational database concepts (primary & foreign keys)',
      'Normalisation to third normal form (3NF)',
      'SQL: SELECT, INSERT, UPDATE, DELETE, table definitions',
      'Client-server databases & concurrent access control',
    ],
    resources: [aqa('fundamentals-of-databases'), RES.isaac, RES.sme],
  },
  {
    id: 'big-data',
    ref: '4.11',
    title: 'Big Data',
    unit: 'Databases module',
    blurb: 'Why the relational model breaks down at scale, and what replaces it.',
    items: [
      'Volume, velocity & variety',
      'Why relational databases struggle with Big Data',
      'Distributed processing & the link to functional programming',
      'Fact-based & graph schema data models',
    ],
    resources: [aqa('big-data'), RES.sme, RES.seneca],
  },
  {
    id: 'functional',
    ref: '4.12',
    title: 'Fundamentals of Functional Programming',
    unit: '',
    blurb:
      'A different paradigm entirely: functions as data, and programs built from composing them.',
    items: [
      'Function notation & first-class functions',
      'Function application & partial application',
      'Composition of functions',
      'Higher-order functions: map, filter, reduce',
      'Writing simple functional programs',
      'Lists as head : tail structures',
    ],
    resources: [aqa('fundamentals-of-functional-programming'), RES.isaac, RES.pmt],
  },
  {
    id: 'software-dev',
    ref: '4.13',
    title: 'Systematic Approach to Problem Solving',
    unit: 'Software development module',
    blurb:
      'The analysis → design → implementation → testing → evaluation cycle — the same methodology the NEA is marked against.',
    items: [
      'Analysis: defining requirements through user interaction',
      'Design: data structures, algorithms, modular structure, UI',
      'Implementation: turning designs into working code',
      'Testing: normal, boundary & erroneous data',
      'Evaluation criteria for a computer system',
    ],
    resources: [aqa('systematic-approach-to-problem-solving'), RES.neaGuide, RES.sme],
  },
];
