'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from './supabase-browser';
import { ocrChallengeCodeVersionsQueryKey } from './use-ocr-challenge-code-versions';

// Feedback on one specific saved code version (design.md §6.10,
// requirements.md §8.12) - additive to the existing challenge-level
// ocr_challenge_reviews thread, not a replacement for it. Invalidates the
// versions list query (which embeds each version's comments via a
// nested select in use-ocr-challenge-code-versions.ts) rather than
// maintaining a separate query just for comments.
export function useAddOcrChallengeVersionComment(challengeId: string, versionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const { error } = await supabase
        .from('ocr_challenge_version_comments')
        .insert({ version_id: versionId, body, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ocrChallengeCodeVersionsQueryKey(challengeId) });
    },
  });
}
