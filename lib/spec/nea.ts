export type NeaSection = {
  id: string;
  name: string;
  marks: number;
  desc: string;
};

// Six sections matching AQA's actual mark scheme (confirmed against the
// prototype's breakdown - requirements.md §4, product.md's changelog).
// Marks/names live here in code, not the database - see design.md §6.3.
export const NEA_SECTIONS: NeaSection[] = [
  {
    id: 'analysis',
    name: 'Analysis',
    marks: 9,
    desc: 'Problem statement, stakeholders, measurable objectives, problem modelling.',
  },
  {
    id: 'design',
    name: 'Documented Design',
    marks: 12,
    desc: 'Diagrams, pseudocode or prose that communicate the design before building it.',
  },
  {
    id: 'tech-complete',
    name: 'Technical Solution — Completeness',
    marks: 15,
    desc: 'Does the finished system meet the stated requirements.',
  },
  {
    id: 'tech-technique',
    name: 'Technical Solution — Techniques Used',
    marks: 27,
    desc: 'Coding skill: data structures, modularity, exception handling, annotation.',
  },
  {
    id: 'testing',
    name: 'Testing',
    marks: 8,
    desc: 'Representative test plan — normal, boundary and erroneous data, with evidence.',
  },
  {
    id: 'evaluation',
    name: 'Evaluation',
    marks: 4,
    desc: 'Meeting requirements, independent user feedback, and real improvements.',
  },
];

export const NEA_TOTAL_MARKS = NEA_SECTIONS.reduce((sum, s) => sum + s.marks, 0);

export function getNeaSectionById(id: string): NeaSection | undefined {
  return NEA_SECTIONS.find((s) => s.id === id);
}
