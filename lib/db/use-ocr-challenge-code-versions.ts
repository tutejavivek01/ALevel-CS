'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { useRealtimeTables } from './use-realtime-tables';
import { usePyodideWorker } from '@/lib/python/use-pyodide-worker';

export type OcrChallengeVersionComment = {
  id: number;
  version_id: number;
  body: string;
  created_by: string;
  created_at: string;
};

export type OcrChallengeCodeVersion = {
  id: number;
  challenge_id: string;
  code: string;
  syntax_error: string | null;
  best_practice_findings: string[];
  saved_by: string;
  created_at: string;
  ocr_challenge_version_comments: OcrChallengeVersionComment[];
};

export function ocrChallengeCodeVersionsQueryKey(challengeId: string) {
  return ['ocr-challenge-code-versions', challengeId] as const;
}

async function fetchOcrChallengeCodeVersions(
  challengeId: string
): Promise<OcrChallengeCodeVersion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('ocr_challenge_code_versions')
    .select('*, ocr_challenge_version_comments(*)')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function useOcrChallengeCodeVersions(challengeId: string) {
  const queryClient = useQueryClient();
  const queryKey = ocrChallengeCodeVersionsQueryKey(challengeId);

  const query = useQuery({ queryKey, queryFn: () => fetchOcrChallengeCodeVersions(challengeId) });

  useRealtimeTables(['ocr_challenge_code_versions', 'ocr_challenge_version_comments'], () => {
    queryClient.invalidateQueries({ queryKey });
  });

  return query;
}

// Save is deliberately independent of Run (design.md §6.10, requirements
// .md §8.12): it never grades against test cases and always succeeds, so
// a student can checkpoint code that doesn't even parse yet - no
// optimistic guess is shown first, the same reasoning
// useSubmitOcrChallengeCode already applies, since there's nothing
// honest to guess before the check() call actually resolves. Reuses the
// same {type: 'check', code} worker round trip Run also uses for
// best-practice findings (task 39 extended it to also surface a syntax
// error, since a version has no execution attempt of its own to produce
// one from).
export function useSaveOcrChallengeCodeVersion(challengeId: string) {
  const queryClient = useQueryClient();
  const worker = usePyodideWorker();

  return useMutation({
    mutationFn: async (code: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { findings, syntaxError } = await worker.check(code);

      const { error } = await supabase.from('ocr_challenge_code_versions').insert({
        challenge_id: challengeId,
        code,
        syntax_error: syntaxError,
        best_practice_findings: findings,
        saved_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ocrChallengeCodeVersionsQueryKey(challengeId) });
    },
  });
}
