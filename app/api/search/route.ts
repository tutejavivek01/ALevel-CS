import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { searchContent } from '@/lib/search/search-index';

// Server-side so the full reading text (far too large to ship to the
// browser) can be searched; signed-in accounts only, like the pages it
// links to.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const query = (request.nextUrl.searchParams.get('q') ?? '').slice(0, 100);
  return NextResponse.json({ results: searchContent(query) });
}
