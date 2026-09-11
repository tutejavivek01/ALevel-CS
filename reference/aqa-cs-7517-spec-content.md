# AQA A-Level Computer Science (7517) — Full Specification Content Reference

Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content
Compiled from AQA's official subject-content pages, one per topic (URLs given per section below).
Use this file as the authoritative content source for topic detail pages — don't re-scrape AQA's site from inside the app; treat this as ground truth and update it by hand if AQA revises the spec.

---

## 4.1 Fundamentals of Programming
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-programming

### 4.1.1 Programming
**4.1.1.1 Data Types** — Understand data type concepts. Use appropriately: integer, real/float, Boolean, character, string, date/time, pointer/reference, records, arrays. Define and use user-defined data types based on built-in types.

**4.1.1.2 Programming Concepts** — Combine statement types: variable declaration, constant declaration, assignment, iteration, selection, subroutines. Use definite and indefinite iteration (condition at start or end). Implement nested selection and iteration structures. Use meaningful identifier names.

**4.1.1.3 Arithmetic Operations** — Addition, subtraction, multiplication. Real/float division, integer division with remainders. Exponentiation, rounding, truncation.

**4.1.1.4 Relational Operations** — Equal to, not equal to, less than, greater than, less than or equal to, greater than or equal to.

**4.1.1.5 Boolean Operations** — NOT, AND, OR, XOR.

**4.1.1.6 Constants and Variables** — Explain differences between variables and constants. Explain advantages of named constants.

**4.1.1.7 String-Handling Operations** — Length, position, substring, concatenation. Character ↔ character code conversions. String conversion operations (string/integer/float/date/time conversions).

**4.1.1.8 Random Number Generation** — Familiar with and use random number generation.

**4.1.1.9 Exception Handling** — Understand exception handling concepts. Use exception handling in programming languages.

**4.1.1.10 Subroutines (Procedures/Functions)** — Understand subroutines and their uses. Know subroutines as named, out-of-line code blocks. Explain advantages of using subroutines.

**4.1.1.11 Parameters of Subroutines** — Describe parameter use for data passing. Use subroutines with interfaces.

**4.1.1.12 Returning Values** — Use subroutines that return values to calling routines.

**4.1.1.13 Local Variables** — Understand local variables exist only during subroutine execution, accessible only within the subroutine. Use local variables and explain best practices.

**4.1.1.14 Global Variables** — Contrast local variables with global variables.

**4.1.1.15 Stack Frames in Subroutine Calls** — Explain how stack frames store return addresses, parameters, and local variables.

**4.1.1.16 Recursive Techniques** — Use recursive techniques (general and base cases). Solve simple problems using recursion.

### 4.1.2 Programming Paradigms
**4.1.2.1 Overview** — Understand procedural and object-oriented paradigms through practical experience.

**4.1.2.2 Procedural-Oriented Programming** — Understand structured program design and construction. Construct and use hierarchy charts. Explain advantages of a structured approach.

**4.1.2.3 Object-Oriented Programming** — Familiar with: class, object, instantiation, encapsulation, inheritance, aggregation, composition, polymorphism, overriding. Know why the object-oriented paradigm is used. Apply design principles: encapsulate what varies, favour composition over inheritance, program to interfaces. Write object-oriented programs (abstract, virtual, static methods; inheritance; aggregation; polymorphism; access specifiers). Draw and interpret class diagrams (single inheritance, composition, aggregation, access specifiers).

---

## 4.2 Fundamentals of Data Structures
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-data-structures

**4.2.1 Data Structures and Abstract Data Types** — Understand the concept of data structures and their practical applications. Single- and multi-dimensional arrays: use arrays (or equivalent) in the design of solutions to simple problems; apply 1D arrays (vectors) and 2D arrays (matrices); work with n-dimensional arrays. Fields, records and files: read/write operations with text files and binary files. Abstract data types: understand and use queues, stacks, graphs, trees, hash tables, dictionaries, vectors; distinguish static vs dynamic structures; compare advantages/disadvantages of each approach; create and maintain data in queues (linear, circular, priority), stacks, and hash tables.

**4.2.2 Queues** — Add/remove items; test for empty or full states; apply operations to linear, circular, and priority queues.

**4.2.3 Stacks** — Push and pop operations; peek/top returns the value of the top element without removing it; test for empty/full conditions.

**4.2.4 Graphs** — Understand graphs as complex relationship representations. Explain vertices, edges, weighted graphs, directed/undirected graphs. Represent graphs using adjacency matrices and adjacency lists. Compare representation methods.

**4.2.5 Trees** — A tree is a connected, undirected graph with no cycles. Understand rooted trees with parent-child relationships. Apply binary trees (including binary search trees).

**4.2.6 Hash Tables** — Apply simple hashing algorithms. Handle collisions through rehashing.

**4.2.7 Dictionaries** — Use key-value pair structures. Apply to information retrieval tasks.

**4.2.8 Vectors** — Represent vectors as lists, functions, arrays, or geometric arrows. Perform vector addition and scalar multiplication. Calculate dot products and convex combinations. Apply vectors to angle calculations.

---

## 4.3 Fundamentals of Algorithms
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-algorithms

**4.3.1 Graph-Traversal** — Trace breadth-first and depth-first search algorithms. Applications: breadth-first = shortest path for an unweighted graph; depth-first = navigating a maze.

**4.3.2 Tree-Traversal** — Trace pre-order, post-order, and in-order traversals. Uses: pre-order = copying a tree; in-order = binary search trees, ascending order output; post-order = infix-to-RPN conversion, tree emptying.

**4.3.3 Reverse Polish** — Convert expressions between infix and Reverse Polish Notation (RPN) forms. Applications: eliminates brackets; enables stack-based evaluation in interpreters (Postscript, bytecode).

**4.3.4 Searching Algorithms** — Linear search: trace and analyse complexity O(n). Binary search: trace and analyse complexity O(log n). Binary tree search: trace and analyse complexity O(log n).

**4.3.5 Sorting Algorithms** — Bubble sort: trace and analyse O(n²) complexity; example of inefficient sorting. Merge sort: trace and analyse O(n log n) complexity; demonstrates divide-and-conquer.

**4.3.6 Optimisation Algorithms** — Dijkstra's shortest path algorithm: understand and trace the algorithm; identify applications; the algorithm's steps need not be memorised.

---

## 4.4 Theory of Computation
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/theory-of-computation
(This is the section behind the school's "Unit 2 — Systematic Approach to Problem Solving" as taught; see 4.4.1–4.4.2 especially.)

**4.4.1 Abstraction and Automation** — Develop and check solutions to simple logic problems. Understand algorithms as a sequence of steps that can be followed to complete a task. Express solutions using pseudo-code with sequence, assignment, selection, iteration. Hand-trace algorithms and convert pseudo-code to high-level languages. Understand representational abstraction and abstraction by generalisation. Know information hiding, procedural abstraction, functional abstraction, and data abstraction. Understand problem abstraction/reduction, decomposition, and composition. Comprehend automation through models, algorithms, code, and data structures.

**4.4.2 Regular Languages** —
*Finite State Machines (FSMs):* draw and interpret state transition diagrams and tables for FSMs with/without output (Mealy machines).
*Set Mathematics:* set notation, empty sets, set comprehension; finite/infinite/countably infinite sets and cardinality; subsets, proper subsets, Cartesian products; set operations — membership, union, intersection, difference.
*Regular Expressions:* form simple regular expressions for string matching using metacharacters (*, +, ?, |); describe the relationship between regular expressions and FSMs; write regular expressions and FSMs for equivalent languages.

**4.4.3 Context-Free Languages** — Check syntax using BNF/syntax diagrams. Formulate simple production rules. Explain why BNF represents languages that regular expressions cannot.

**4.4.4 Classification of Algorithms** — Compare algorithms by complexity relative to problem size. Understand time and space efficiency. Apply Big-O notation to constant, logarithmic, linear, polynomial, exponential time. Derive algorithm time complexity. Distinguish tractable vs intractable problems. Recognise non-computable problems and the Halting Problem.

**4.4.5 A Model of Computation** — *Turing Machines:* understand the structure — finite states, alphabet, infinite tape, read-write head; represent transitions as functions and diagrams; hand-trace simple Turing machines; explain their importance to computation theory. (All 4.4 content is A-level only.)

---

## 4.5 Fundamentals of Data Representation
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-data-representation

**4.5.1 Number Systems** — Natural numbers, integers, rational numbers, irrational numbers, real numbers, ordinal numbers. Distinguish natural numbers (counting) from real numbers (measurement).

**4.5.2 Number Bases** — Concept of number base systems. Convert between decimal (base 10), binary (base 2), and hexadecimal (base 16). Use hexadecimal as binary shorthand.

**4.5.3 Units of Information** — Bit as fundamental unit; byte = 8 bits. Apply 2ⁿ formula: n bits represent 2ⁿ different values. Binary prefixes (KiB, MiB, GiB, TiB) vs decimal prefixes (kB, MB, GB, TB).

**4.5.4 Binary Number System** — *Unsigned binary:* differentiate from signed; calculate min/max for n bits (0 to 2ⁿ−1); add and multiply unsigned binary integers. *Signed binary (two's complement):* represent positive/negative integers; perform subtraction using two's complement; calculate range for n bits. *Fractional numbers:* fixed-point and floating-point binary (mantissa + exponent); convert decimal ↔ binary. *Rounding errors:* inaccuracies in fixed/floating point; numbers incapable of exact binary representation. *Absolute and relative error:* calculate both; compare for large, small, and near-unity magnitudes. *Range and precision:* fixed vs floating point trade-offs. *Normalisation:* normalise floating-point numbers with positive/negative mantissas. *Underflow and overflow:* explain these conditions.

**4.5.5 Information Coding Systems** — Distinguish character code representation from pure binary. Describe ASCII and Unicode; explain Unicode's rationale. Apply parity bits, majority voting, checksums, and check digits for error detection/correction.

**4.5.6 Representing Images, Sound, and Other Data** — Bit patterns represent graphics and sound. Analogue vs digital data/signals. ADC/DAC operation principles. *Bitmapped graphics:* resolution, colour depth, pixel dimensions; storage = size in pixels × colour depth; typical metadata. *Vector graphics:* object property lists; primitives; compare vs bitmap. *Digital sound:* sample resolution, sampling rate, Nyquist theorem; calculate file sizes. *MIDI:* purpose and event messages; advantages for music representation. *Data compression:* why images/sound/text need compression; lossless vs lossy; run-length encoding (RLE); dictionary-based compression. *Encryption:* cipher/plaintext/ciphertext terms; Caesar cipher and its vulnerability; Vernam cipher (one-time pad) and perfect security; contrast with computationally secure alternatives.

---

## 4.6 Fundamentals of Computer Systems
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-computer-systems

**4.6.1 Hardware and Software** — Define the relationship between, and distinguish, hardware and software.
**4.6.1.2 Classification of Software** — System vs application software; why different types exist and their key attributes.
**4.6.1.3 System Software** — Functions of operating systems; roles of utility programs; purpose of libraries; translators — compilers, assemblers, interpreters.
**4.6.1.4 Role of an Operating System** — Abstracting hardware complexity; managing processor, memory and I/O allocation across processes.

**4.6.2 Classification of Programming Languages** — Development and categorisation of languages. Low-level (machine code, assembly) vs high-level imperative languages. Advantages/disadvantages of each. Relationship of high-level imperative languages to low-level code.

**4.6.3 Types of Program Translator** — Roles of assembler, compiler, interpreter. Contrast compilation and interpretation. Appropriate contexts for each. Bytecode production and usage. Source code vs executable object code.

**4.6.4 Logic Gates** — Construct truth tables for NOT, AND, OR, XOR, NAND, NOR. Interpret logic gate circuit diagrams. Complete truth tables for gate circuits. Derive Boolean expressions from circuits and vice versa. Trace half-adder and full-adder logic; construct half-adder circuits. Apply D-type flip-flops as memory units.

**4.6.5 Boolean Algebra** — Use Boolean identities and De Morgan's laws to simplify expressions.

---

## 4.7 Fundamentals of Computer Organisation and Architecture
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-computer-organisation-and-architecture

**4.7.1 Internal Hardware Components** — Roles of processor, main memory, address/data/control buses, I/O controllers. Component communication via buses. Von Neumann vs Harvard architectures and typical applications. Addressable memory.

**4.7.2 The Stored Program Concept** — Machine code instructions stored in main memory are fetched and executed by processors performing arithmetic/logical operations.

**4.7.3 Processor Structure and Role** — *Components:* arithmetic logic unit, control unit, clock; general-purpose and dedicated registers (program counter, current instruction register, memory address register, memory buffer register, status register). *Fetch-Execute Cycle:* fetch, decode, execute stages, and register roles throughout. *Instruction Set:* opcode and operand(s) — values, addresses, or registers. *Addressing Modes:* immediate (operand is the datum) and direct (operand is the datum's address). *Machine-Code Operations:* load, add, subtract, store, branching, compare, logical bitwise operators (AND, OR, NOT, XOR), shift operations, halt; express in assembly language using immediate/direct addressing. *Interrupts:* roles and interrupt service routines; effects on the fetch-execute cycle and preserving the volatile environment. *Performance Factors:* multiple cores, cache memory, clock speed, word length, address/data bus width.

**4.7.4 External Hardware Devices** — *I/O devices:* characteristics/operation of barcode readers, digital cameras, laser printers, RFID. *Secondary storage:* why it's needed; characteristics of hard disks, optical disks, SSDs; compare capacity, access speed, suitability.

---

## 4.8 Consequences of Uses of Computing
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/consequences-of-uses-of-computing

**4.8.1 Individual (Moral), Social (Ethical), Legal and Cultural Issues and Opportunities** — Awareness of current individual, social, legal and cultural opportunities and risks in computing. How digital technologies have transformed communications and information flows. Computer science's capacity to monitor behaviour, aggregate personal data, and disseminate information at scale. Computer scientists and software engineers have power, and the responsibilities that go with it. Software and algorithms embed moral and cultural values. Consequences of scale — software's global reach creates potential for both significant benefit and substantial harm. Challenges legislators face regulating the digital age. (Suggested pedagogy: hypothetical scenarios to isolate ethical principles; real-world case studies examining competing ethical values and trade-offs; tensions between individual rights, cultural expectations, informed consent, service value, and commercial interests. A-level only.)

---

## 4.9 Fundamentals of Communication and Networking
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-communication-and-networking

**4.9.1 Communication** — Serial vs parallel transmission (evaluate serial's advantages). Synchronous vs asynchronous transmission; start/stop bits in asynchronous transmission. Definitions: baud rate, bit rate, bandwidth, latency, protocol. Baud rate vs bit rate (multiple bits per signal change possible). Bit rate's proportionality to bandwidth.

**4.9.2 Networking** — *Topology:* physical star vs logical bus; star-wired networks operating logically as bus via protocol. *Host networking types:* peer-to-peer (equal status) vs client-server (clients request services); appropriate use cases. *Wireless networking:* WiFi purpose and standards; wireless network adapter and access point; security — WPA/WPA2 encryption, disabled SSID broadcast, MAC allow lists; CSMA/CA with/without RTS/CTS; SSID purpose.

**4.9.3 The Internet** — *Structure:* Internet architecture; packet switching and routers; packet components; router vs gateway; Internet routing; URLs; FQDN, domain name, IP address distinctions; domain name organisation; DNS purpose; Internet registries. *Security:* firewalls — packet filtering, proxy server, stateful inspection; symmetric and asymmetric encryption with key exchange; digital certificates and signatures; worms, trojans, viruses and exploited vulnerabilities; code quality, monitoring, and protection countermeasures.

**4.9.4 TCP/IP Protocol Suite** — *Stack:* application, transport, network, link layers; socket functions; MAC address roles; well-known ports vs client ports. *Application-layer protocols:* FTP, HTTP, HTTPS, POP3, SMTP, SSH — client/server behaviour for each; SSH remote management and secure login. *IP addressing:* network/host identifier division; subnet masking; IPv4 and IPv6 (rationale for IPv6); public vs private (routable/non-routable) IP addresses; DHCP; NAT; port forwarding. *Client-Server Model:* request/response messaging; WebSocket (persistent full-duplex); Web CRUD/REST mapping to HTTP/SQL; JSON vs XML (readability, compactness, ease of creation, parsing speed). *Thin vs thick-client computing:* compare computational distribution models.

---

## 4.10 Fundamentals of Databases
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-databases

**4.10.1 Conceptual Data Models and Entity Relationship Modelling** — Create data models from given requirements for scenarios with multiple entities. Produce entity relationship diagrams. Write entity descriptions as Entity1(Attribute1, Attribute2, …), underlining the primary key.

**4.10.2 Relational Databases** — What constitutes a relational database. Define attribute, primary key, composite primary key, foreign key.

**4.10.3 Database Design and Normalisation** — Normalise relations to third normal form (3NF). Properties of relations in 3NF. Rationale for normalisation.

**4.10.4 Structured Query Language (SQL)** — Use SQL to retrieve, update, insert, and delete data from multiple tables. Use SQL to define database table structures.

**4.10.5 Client Server Databases** — Client-server systems allow simultaneous access for multiple clients. Methods for controlling concurrent access: record locks, serialisation, timestamp ordering, commitment ordering. The problem of lost updates when multiple clients edit records simultaneously.

---

## 4.11 Big Data
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/big-data

**4.11.1 Big Data** — *Characteristics:* Big Data = datasets too large for standard containers. Volume (exceeds single-server capacity); velocity (real-time streaming, milliseconds-to-seconds response); variety (structured, unstructured, text, multimedia). *Challenges:* analysing unstructured data is significantly harder; relational databases unsuitable for unstructured data; machine learning needed to find patterns; scalability issues beyond single-server capacity. *Distributed processing:* processing spans multiple machines; functional programming enables efficient distributed code (immutable data structures, statelessness, higher-order functions). *Data models:* fact-based model (each fact = one information element); graph schema (nodes, edges, properties). (A-level only.)

---

## 4.12 Fundamentals of Functional Programming
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-functional-programming

**4.12.1 Functional Programming Paradigm** — Function notation f: A → B (domain/co-domain). Functions as first-class objects (passed as arguments, returned from calls). Function application (e.g. add(3,4)); multi-argument functions taken one argument at a time. Partial function application (e.g. "add 4" returns a function awaiting another integer). Composition of functions: g ∘ f means f applied first, then g to the result.

**4.12.2 Writing Functional Programs** — Construct simple programs in functional languages (Haskell, Standard ML, Scheme, Lisp) or languages with functional support (Python, F#, C#, Scala, Java 8, etc.). Higher-order functions (accept/return functions). Key operations: map (applies a function to each list element), filter (keeps elements matching a condition), reduce/fold (reduces a list to a single value by repeated application).

**4.12.3 Lists in Functional Programming** — Lists as head:tail concatenation; head = single element, tail = remaining list; empty list = []. Operations: head, tail, empty test, length, construct empty list, prepend, append. Implement these in a functional language.

---

## 4.13 Systematic Approach to Problem Solving
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/systematic-approach-to-problem-solving
(This is the software-development-lifecycle methodology the NEA is marked against.)

**4.13.1.1 Analysis** — Define problems and establish system requirements through user interaction. Before a problem can be solved, it must be defined and requirements clarified. Apply abstraction to model real-world aspects in programs. Utilise prototyping or agile methodologies during requirements clarification.

**4.13.1.2 Design** — Plan data structures for data models. Design algorithms appropriate to the solution. Structure solutions into modular components with documented interfaces. Create human-user interface designs. Recognise design as an iterative process employing prototyping/agile approaches.

**4.13.1.3 Implementation** — Convert models and algorithms into executable data structures and code. Write, debug, and test programs effectively. Apply iterative processes and prototyping, focusing on critical-path resolution. Justify program correctness and efficiency through logical reasoning.

**4.13.1.4 Testing** — Apply test data covering normal (typical), boundary, and erroneous cases. The implementation must be tested for the presence of errors. Conduct acceptance testing with intended end-users. Gather user feedback to validate against specifications.

**4.13.1.5 Evaluation** — Know the criteria for evaluating a computer system.

---

## 4.14 Non-Exam Assessment — The Computing Practical Project
Source: https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/non-exam-assessment-the-computing-practical-project
Full guidance PDF: https://filestore.aqa.org.uk/resources/computing/AQA-7517-NEA-GUIDE.PDF

75 marks total, 20% of the A-level, split across five sections:

| Section | Marks |
|---|---|
| Analysis | 9 |
| Documented Design | 12 |
| Technical Solution — Completeness | 15 |
| Technical Solution — Techniques Used | 27 |
| Testing | 8 |
| Evaluation | 4 |

**Analysis (9)** — Clear statement describing the problem area and specific problem being solved. Problem description and research outline. Identification of intended users/stakeholders. Numbered list of measurable, appropriate specific objectives. Problem modelling (e.g. E-R diagrams, network models).

**Documented Design (12)** — Articulate the design in a manner appropriate to the task, using diagrams, prose, pseudo-code, or screenshots. Emphasis on communicating the design, not formal notation.

**Technical Solution — Completeness (15)** — Does the system meet the project requirements.

**Technical Solution — Techniques Used (27)** — Coding proficiency assessed against three ability levels (basic/good/excellent). Program listings must be appropriately annotated, with an overview guide, entity names, and explanations of complex sections.

**Testing (8)** — Carefully selected representative samples demonstrating solution robustness: test purpose, test data, expected outcomes, actual results, with evidence (e.g. screenshots).

**Evaluation (4)** — Assessment of how outcomes meet all requirements, discussion of potential improvements, and analysis of independent feedback of a useful and realistic nature (cannot exceed Level 3 without genuine independent user feedback).

**Key requirements/pitfalls:** the problem must be A-level standard and sufficiently different from other students' work (teachers confirm this on Candidate Record Forms); an under-scoped problem causes a downward shift by two levels across every section except the technical solution; projects should be understandable by a third party without reading source code directly.
