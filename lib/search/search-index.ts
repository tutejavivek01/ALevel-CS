import { TOPICS } from '@/lib/spec/topics';
import { READING_CONTENT } from '@/lib/spec/reading-content';

// Home-page search over the 13 spec areas and the reading chapters. Built
// lazily on the server (the reading HTML is far too large to ship to the
// client) and queried through app/api/search/route.ts.

export type SearchResult = {
  kind: 'area' | 'chapter';
  title: string;
  // Spec-area ref (e.g. '4.1') the result belongs to.
  ref: string;
  // Area title for chapters, unit for areas - shown as a small label.
  context: string;
  summary: string;
  href: string;
};

type Entry = SearchResult & {
  titleText: string; // lower-cased, matched with the highest weight
  headingText: string; // lower-cased headings / subtopic list
  bodyText: string; // lower-cased full text
};

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

function decode(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m);
}

function stripTags(html: string): string {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

const SUMMARY_MAX_CHARS = 200;

function truncate(text: string): string {
  if (text.length <= SUMMARY_MAX_CHARS) return text;
  const cut = text.slice(0, SUMMARY_MAX_CHARS);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  if (lastStop > 80) return cut.slice(0, lastStop + 1);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

// First real prose paragraph of the chapter: lists (the Objectives
// bullets) and headings are skipped, short fragments too.
export function extractSummary(bodyHtml: string): string {
  const withoutLists = bodyHtml.replace(/<(ul|ol)[\s\S]*?<\/\1>/g, ' ');
  const paragraphs = withoutLists.match(/<p>[\s\S]*?<\/p>/g) ?? [];
  for (const paragraph of paragraphs) {
    const text = stripTags(paragraph);
    if (text.length >= 60) return truncate(text);
  }
  return '';
}

function headingsOf(html: string): string {
  return (html.match(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/g) ?? [])
    .map(stripTags)
    .join(' ');
}

let index: Entry[] | null = null;

function buildIndex(): Entry[] {
  const entries: Entry[] = [];

  for (const topic of TOPICS) {
    const items = topic.items.join(' ');
    entries.push({
      kind: 'area',
      title: `${topic.ref} ${topic.title}`,
      ref: topic.ref,
      context: topic.unit,
      summary: topic.blurb,
      href: `/topic/${topic.id}`,
      titleText: `${topic.ref} ${topic.title}`.toLowerCase(),
      headingText: items.toLowerCase(),
      bodyText: topic.blurb.toLowerCase(),
    });
  }

  for (const area of READING_CONTENT) {
    const topic = TOPICS.find((t) => t.ref === area.ref);
    if (!topic) continue;
    for (const chapter of area.chapters) {
      const body = stripTags(`${chapter.bodyHtml} ${chapter.exercisesHtml}`);
      entries.push({
        kind: 'chapter',
        title: chapter.title,
        ref: area.ref,
        context: `${topic.ref} ${topic.title}`,
        summary: extractSummary(chapter.bodyHtml),
        href: `/topic/${topic.id}/reading#${chapter.id}`,
        titleText: `${chapter.title} ${chapter.sectionTitle}`.toLowerCase(),
        headingText: headingsOf(chapter.bodyHtml).toLowerCase(),
        bodyText: body.toLowerCase(),
      });
    }
  }

  return entries;
}

function countOccurrences(haystack: string, term: string, cap: number) {
  let count = 0;
  let from = 0;
  while (count < cap) {
    const at = haystack.indexOf(term, from);
    if (at === -1) break;
    count++;
    from = at + term.length;
  }
  return count;
}

// Light suffix-stripping so 'recursion' also finds 'recursive' and
// 'sorting' finds 'sort'; only applied when a sensible stem remains.
function stem(term: string): string {
  const stemmed = term.replace(/(ations?|ions?|ing|ives?|es|s)$/, '');
  return stemmed.length >= 4 ? stemmed : term;
}

export function parseQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)
    .map(stem);
}

// Every term must appear somewhere in the entry (AND). Title hits weigh
// most, then headings, then body frequency (capped so long chapters don't
// dominate). Ties fall back to spec-area order, areas before chapters.
export function searchContent(query: string, limit = 12): SearchResult[] {
  const terms = parseQuery(query);
  if (terms.length === 0) return [];
  index ??= buildIndex();

  const scored: { entry: Entry; score: number; order: number }[] = [];
  index.forEach((entry, order) => {
    let score = 0;
    for (const term of terms) {
      const inTitle = entry.titleText.includes(term);
      const inHeading = entry.headingText.includes(term);
      const inBody = countOccurrences(entry.bodyText, term, 10);
      if (!inTitle && !inHeading && inBody === 0) return;
      score += (inTitle ? 30 : 0) + (inHeading ? 10 : 0) + inBody;
    }
    scored.push({ entry, score, order });
  });

  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.slice(0, limit).map(({ entry }) => ({
    kind: entry.kind,
    title: entry.title,
    ref: entry.ref,
    context: entry.context,
    summary: entry.summary,
    href: entry.href,
  }));
}
