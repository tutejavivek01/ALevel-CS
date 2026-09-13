import { NextResponse } from 'next/server';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@/lib/db/supabase-server';

// specs/reading-material/design.md §2, requirements.md §2.2 - this route
// is the *only* gate on these files, not a backstop alongside the site
// middleware: proxy.ts's matcher excludes any URL ending in an image
// extension from auth-gating entirely, including one under /api/, so a
// figure served from here would bypass the middleware regardless of
// where the underlying file lives unless this handler checks auth itself.
const FIGURES_DIR = path.join(process.cwd(), 'reference', 'book_md', 'figures');

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/reading-material/figures/[filename]'>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { filename } = await ctx.params;

  // Path-traversal containment check: resolve the full path and confirm
  // it still lives inside FIGURES_DIR before ever touching the
  // filesystem. A plain existence/containment check, not a filename
  // regex - simpler and more robust against a naming-convention edge
  // case a regex didn't anticipate.
  const resolved = path.resolve(FIGURES_DIR, filename);
  if (
    resolved !== FIGURES_DIR &&
    !resolved.startsWith(FIGURES_DIR + path.sep)
  ) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  try {
    await stat(resolved);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const bytes = await readFile(resolved);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'image/png',
      // Private: this is authenticated content, a shared/CDN cache must
      // never serve it to a different, unauthenticated request. Immutable:
      // a given filename's bytes never change, only re-ingestion changes
      // which filenames get referenced.
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
