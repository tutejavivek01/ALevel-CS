export type Resource = {
  name: string;
  url: string;
};

// Curated, code-maintained resource links (requirements.md §3) - ported
// verbatim from reference/prototype.html's RES table.
export const RES = {
  isaac: { name: 'Isaac Computer Science', url: 'https://isaaccomputerscience.org/' },
  craig: { name: "Craig 'n' Dave", url: 'https://www.craigndave.org/' },
  pmt: {
    name: 'Physics & Maths Tutor',
    url: 'https://pmt.physicsandmathstutor.com/subject/computer-science',
  },
  sme: {
    name: 'Save My Exams',
    url: 'https://www.savemyexams.com/learning-hub/exam-specifications/a-level/computer-science/aqa/',
  },
  seneca: { name: 'Seneca Learning', url: 'https://senecalearning.com/' },
  codewars: { name: 'Codewars practice', url: 'https://www.codewars.com/' },
  pmtFsm: {
    name: 'PMT: FSM notes (PDF)',
    url: 'https://pmt.physicsandmathstutor.com/download/Computer-Science/A-level/Notes/AQA/04-Theory-of-Computation-AS/Advanced/4.2.%20Finite%20State%20Machines%20(FSMs)%20-%20Advanced.pdf',
  },
  pmtProg: {
    name: 'PMT: Programming notes (PDF)',
    url: 'https://pmt.physicsandmathstutor.com/download/Computer-Science/A-level/Notes/AQA/01-Fundamentals-of-Programming/Advanced/1.1.%20Programming%20-%20Advanced.pdf',
  },
  neaGuide: {
    name: 'AQA NEA guidance (PDF)',
    url: 'https://filestore.aqa.org.uk/resources/computing/AQA-7517-NEA-GUIDE.PDF',
  },
} as const satisfies Record<string, Resource>;

export function aqa(slug: string): Resource {
  return {
    name: 'AQA official spec',
    url: `https://www.aqa.org.uk/subjects/computer-science/a-level/computer-science-7517/specification/subject-content/${slug}`,
  };
}
