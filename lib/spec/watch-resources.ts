// Per-topic "watch & revise" starting points shown on each topic's
// detail page (design.md §6.12, requirements.md §11.2).
//
// Transcribed from reference/aqa-cs-video-resources.md - the school's own
// recommended channel/site list, plus that file's per-topic best-fit
// mapping table. Every `url` here is a channel or site homepage / index
// page copied verbatim from that file (which states they are "verified to
// exist").
//
// HARD RULE (from the reference file): never a fabricated deep link to a
// specific lesson video - no `watch?v=`, no `youtu.be/`, no `/shorts/`.
// Those were not verified and would 404 or point at the wrong video. Each
// entry links to the source's own front door; `hint` tells the student
// what to search for once there. The __tests__/spec-integrity.test.ts
// guard rejects any video-watch-shaped URL.
//
// A future extension (requirements.md §10) could resolve a genuine
// specific-video URL per topic via a build-time lookup; `WatchResource`
// leaves room for a `resolvedVideoUrl` field then.

export type WatchResource = {
  name: string;
  // A verified channel/site homepage or index URL. Never a specific-video
  // URL.
  url: string;
  // 'watch' = a video channel; 'revise' = notes / practice / SRS site.
  kind: 'watch' | 'revise';
  // "search this channel for 4.4", "look for trees & graphs", etc.
  hint?: string;
};

export type TopicWatchResources = {
  // Matches Topic.ref in topics.ts.
  ref: string;
  resources: WatchResource[];
};

// Sources, verbatim from reference/aqa-cs-video-resources.md.
const CRAIG_ND = 'https://www.craigndave.org/';
const SMART_REVISE = 'https://smartrevise.online/';
const ISAAC = 'https://isaaccomputerscience.org/';
const COREY_SCHAFER = 'https://www.youtube.com/@coreyms';
const MOSH = 'https://www.youtube.com/@programmingwithmosh';
const FREECODECAMP = 'https://www.youtube.com/@freecodecamp';
const NEETCODE = 'https://www.youtube.com/@NeetCode';
const PMT = 'https://pmt.physicsandmathstutor.com/subject/computer-science';
const SAVE_MY_EXAMS =
  'https://www.savemyexams.com/a-level/computer-science/aqa/';
const SENECA = 'https://senecalearning.com/';
const NEA_GUIDE_PDF =
  'https://filestore.aqa.org.uk/resources/computing/AQA-7517-NEA-GUIDE.PDF';

function craig(ref: string): WatchResource {
  return {
    name: "Craig 'n' Dave",
    url: CRAIG_ND,
    kind: 'watch',
    hint: `videos mapped to the spec by reference number — search for ${ref}`,
  };
}

function isaac(hint: string): WatchResource {
  return { name: 'Isaac Computer Science', url: ISAAC, kind: 'watch', hint };
}

const PMT_NOTES: WatchResource = {
  name: 'Physics & Maths Tutor',
  url: PMT,
  kind: 'revise',
  hint: 'topic notes and past-paper questions, filterable by spec section',
};
const SAVE_MY_EXAMS_NOTES: WatchResource = {
  name: 'Save My Exams',
  url: SAVE_MY_EXAMS,
  kind: 'revise',
  hint: 'AQA revision notes',
};
const SENECA_NOTES: WatchResource = {
  name: 'Seneca Learning',
  url: SENECA,
  kind: 'revise',
  hint: 'spaced-repetition revision',
};
const SMART_REVISE_NOTES: WatchResource = {
  name: 'Smart Revise',
  url: SMART_REVISE,
  kind: 'revise',
  hint: "Craig 'n' Dave's companion revision site",
};

export const WATCH_RESOURCES: TopicWatchResources[] = [
  {
    ref: '4.1',
    resources: [
      craig('4.1'),
      isaac('strong for programming fundamentals'),
      SMART_REVISE_NOTES,
      {
        name: 'Programming with Mosh',
        url: MOSH,
        kind: 'watch',
        hint: 'Python basics and clean code',
      },
      {
        name: 'Corey Schafer',
        url: COREY_SCHAFER,
        kind: 'watch',
        hint: 'deep dives into Python, OOP and intermediate concepts',
      },
    ],
  },
  {
    ref: '4.2',
    resources: [
      craig('4.2'),
      isaac('strong for data structures'),
      SMART_REVISE_NOTES,
      {
        name: 'NeetCode',
        url: NEETCODE,
        kind: 'watch',
        hint: 'queues, stacks, hash tables, trees, graphs',
      },
    ],
  },
  {
    ref: '4.3',
    resources: [
      craig('4.3'),
      isaac('strong for algorithms'),
      SMART_REVISE_NOTES,
      {
        name: 'NeetCode',
        url: NEETCODE,
        kind: 'watch',
        hint: 'searches, sorts, tree and graph traversal, Dijkstra',
      },
    ],
  },
  {
    ref: '4.4',
    resources: [
      {
        name: "Craig 'n' Dave",
        url: CRAIG_ND,
        kind: 'watch',
        hint: 'strongest fit here — FSMs and Turing machines are hard to teach without diagrams; search for 4.4',
      },
      SMART_REVISE_NOTES,
      { ...PMT_NOTES, hint: 'FSM and Theory of Computation notes' },
    ],
  },
  {
    ref: '4.5',
    resources: [
      craig('4.5'),
      SMART_REVISE_NOTES,
      SAVE_MY_EXAMS_NOTES,
      SENECA_NOTES,
    ],
  },
  {
    ref: '4.6',
    resources: [craig('4.6'), SMART_REVISE_NOTES, PMT_NOTES],
  },
  {
    ref: '4.7',
    resources: [
      craig('4.7'),
      isaac('strong for architecture and the fetch-execute cycle'),
      SMART_REVISE_NOTES,
    ],
  },
  {
    ref: '4.8',
    resources: [
      {
        ...SAVE_MY_EXAMS_NOTES,
        hint: 'discussion-based topic — less video-driven',
      },
      SENECA_NOTES,
      craig('4.8'),
    ],
  },
  {
    ref: '4.9',
    resources: [craig('4.9'), SMART_REVISE_NOTES, PMT_NOTES],
  },
  {
    ref: '4.10',
    resources: [
      isaac('strong for databases and SQL'),
      craig('4.10'),
      SMART_REVISE_NOTES,
    ],
  },
  {
    ref: '4.11',
    resources: [
      { ...SAVE_MY_EXAMS_NOTES, hint: 'Big Data revision notes' },
      SENECA_NOTES,
      craig('4.11'),
    ],
  },
  {
    ref: '4.12',
    resources: [
      craig('4.12'),
      SMART_REVISE_NOTES,
      {
        name: 'freeCodeCamp',
        url: FREECODECAMP,
        kind: 'watch',
        hint: 'long-form functional-programming courses',
      },
    ],
  },
  {
    ref: '4.13',
    resources: [
      {
        name: 'AQA NEA guidance (PDF)',
        url: NEA_GUIDE_PDF,
        kind: 'revise',
        hint: 'the methodology the NEA is marked against',
      },
      { ...SAVE_MY_EXAMS_NOTES, hint: 'systematic-approach / NEA notes' },
      craig('4.13'),
    ],
  },
];

export function getWatchResourcesForTopic(topic: {
  ref: string;
}): TopicWatchResources | undefined {
  return WATCH_RESOURCES.find((entry) => entry.ref === topic.ref);
}
