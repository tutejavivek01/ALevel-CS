// Parses reference/book_md/ (74 chapter/appendix markdown files, front
// matter + prose + images) into one checked-in artifact:
// lib/generated/reading-content.json. This is the only place markdown is
// ever parsed - the running app only ever imports the generated JSON
// (specs/reading-material/design.md §1.1). Run by hand whenever
// reference/book_md/ changes:
//
//   node scripts/ingest-reading-material.mjs
//
// Fails loudly (non-zero exit) if the count of image references in the
// source doesn't exactly match the count of files in figures/ - this
// script is the one place that guard can run, so it must never pass
// silently (requirements.md §1.1).
import matter from 'gray-matter';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

const BOOK_DIR = path.join(import.meta.dirname, '..', 'reference', 'book_md');
const FIGURES_DIR = path.join(BOOK_DIR, 'figures');
const OUT_FILE = path.join(
  import.meta.dirname,
  '..',
  'lib',
  'generated',
  'reading-content.json'
);

const YEAR_13_LEVEL = 'A Level (Year 13)';
const IMAGE_URL_PREFIX = '/api/reading-material/figures/';

// Rewrites every image's src to the auth-gated figures route and wraps it
// in a caption structure (specs/reading-material/design.md §1.3) - the
// frame span is what gets the "light surface with padding regardless of
// theme" CSS treatment (display:block via CSS, not tag semantics); the
// caption span is the image's own alt text verbatim, since no chapter in
// the source ever carries a caption beyond that (verified directly, not
// assumed).
//
// Deliberately `<span>`, not `<figure>`/`<div>`/`<figcaption>`: verified
// directly that 18 of the 422 images sit inline within a running
// paragraph's prose (not alone in their own paragraph) - a block element
// can't validly nest inside the `<p>` remark-rehype produces for those,
// but a span (phrasing content) can, in every case, so one wrapper shape
// works everywhere rather than needing two.
function rewriteImages(referencedFilenames) {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'img' || !parent || index === null) return;
      const filename = String(node.properties.src ?? '').replace(
        /^figures\//,
        ''
      );
      referencedFilenames.push(filename);
      const alt = node.properties.alt ?? '';
      const figure = {
        type: 'element',
        tagName: 'span',
        properties: { className: ['reading-figure'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['reading-figure-frame'] },
            children: [
              {
                type: 'element',
                tagName: 'img',
                properties: {
                  src: `${IMAGE_URL_PREFIX}${filename}`,
                  alt,
                  loading: 'lazy',
                },
                children: [],
              },
            ],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['reading-figure-caption'] },
            children: [{ type: 'text', value: alt }],
          },
        ],
      };
      parent.children[index] = figure;
    });
  };
}

async function renderHtml(markdown, referencedFilenames) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(() => rewriteImages(referencedFilenames))
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

// The source's one real structural irregularity worth naming: a chapter's
// Exercises section can itself contain a "## Exercises continued"
// sub-heading later in the file (e.g. ch12 has it twice) - splitting on
// the *first* exact "## Exercises" line still correctly captures all of
// that as one exercisesBody, since "continued" comes after it.
function splitExercises(body) {
  const match = body.match(/^## Exercises$/m);
  if (!match) return { mainBody: body, exercisesBody: '' };
  const idx = match.index;
  return { mainBody: body.slice(0, idx), exercisesBody: body.slice(idx) };
}

function levelRank(level) {
  return level === YEAR_13_LEVEL ? 1 : 0;
}

async function main() {
  const manifest = JSON.parse(
    readFileSync(path.join(BOOK_DIR, 'manifest.json'), 'utf8')
  );
  const figureFiles = new Set(readdirSync(FIGURES_DIR));

  const referencedFilenames = [];
  const areasByRef = new Map();

  for (const record of manifest) {
    const raw = readFileSync(path.join(BOOK_DIR, record.file), 'utf8');
    const { data: fm, content } = matter(raw);
    const { mainBody, exercisesBody } = splitExercises(content);

    const bodyHtml = await renderHtml(mainBody, referencedFilenames);
    const exercisesHtml = exercisesBody
      ? await renderHtml(exercisesBody, referencedFilenames)
      : '';

    const chapter = {
      id: record.file.replace(/\.md$/, ''),
      chapter: fm.chapter,
      title: fm.title,
      sectionTitle: fm.section_title,
      level: fm.level,
      pdfPages: fm.pdf_pages,
      words: record.words,
      source: fm.source,
      bodyHtml,
      exercisesHtml,
    };

    const ref = record.spec_area;
    if (!areasByRef.has(ref)) {
      areasByRef.set(ref, {
        ref,
        specAreaTitle: fm.spec_area_title,
        chapters: [],
      });
    }
    areasByRef.get(ref).chapters.push(chapter);
  }

  // Order each area's chapters: numbered chapters before appendices,
  // Year 12 before Year 13 within that, ascending chapter number within
  // each level (requirements.md §1.2). Appendices sort last regardless of
  // their own `level` field (Appendix A/B are both Year 13 content, but
  // "appendix" is the primary sort key, not level).
  for (const area of areasByRef.values()) {
    area.chapters.sort((a, b) => {
      const aAppendix = typeof a.chapter === 'string' ? 1 : 0;
      const bAppendix = typeof b.chapter === 'string' ? 1 : 0;
      if (aAppendix !== bAppendix) return aAppendix - bAppendix;
      const levelDiff = levelRank(a.level) - levelRank(b.level);
      if (levelDiff !== 0) return levelDiff;
      if (aAppendix) return String(a.chapter).localeCompare(String(b.chapter));
      return a.chapter - b.chapter;
    });
  }

  const READING_CONTENT = [...areasByRef.values()].sort((a, b) =>
    a.ref.localeCompare(b.ref, undefined, { numeric: true })
  );

  // Fail loudly if the count of image references found while rendering
  // doesn't exactly match the real files in figures/ - the guard
  // requirements.md §1.1 requires, not just a one-time hope.
  const referencedSet = new Set(referencedFilenames);
  const missing = [...referencedSet].filter((f) => !figureFiles.has(f));
  const orphaned = [...figureFiles].filter((f) => !referencedSet.has(f));
  if (referencedFilenames.length !== 422 || missing.length || orphaned.length) {
    console.error(
      `Figure count mismatch: ${referencedFilenames.length} references (expected 422), ` +
        `${missing.length} missing files, ${orphaned.length} orphaned files.`
    );
    if (missing.length) console.error('Missing:', missing);
    if (orphaned.length) console.error('Orphaned:', orphaned);
    process.exit(1);
  }

  mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(READING_CONTENT, null, 2));
  console.log(
    `Wrote ${OUT_FILE}: ${READING_CONTENT.length} spec areas, ` +
      `${manifest.length} chapters, ${referencedFilenames.length} figures verified.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
