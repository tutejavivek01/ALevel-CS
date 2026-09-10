'use client';

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useRef } from 'react';

// The shared save-reliability pattern from design.md §7 / principles.md §1:
// apply the change locally, write it, and on failure roll back *and*
// surface a retry - never let a failed write just silently vanish.
type Mirror<TVariables> = {
  queryKey: QueryKey;
  updater: (previous: unknown, variables: TVariables) => unknown;
};

type Options<TVariables, TData> = {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  updater: (previous: unknown, variables: TVariables) => unknown;
  // Denormalised aggregate queries the *same* write also affects - e.g. an
  // "every challenge's due date in one map" query alongside the single-
  // challenge review-state row. Each listed key gets the same optimistic-
  // update + rollback-on-error + invalidate-on-settle treatment as
  // queryKey, so a component reading the aggregate updates on the same
  // render as the mutation instead of waiting on a Realtime round trip.
  mirrors?: Mirror<TVariables>[];
};

export function useOptimisticMutation<TVariables, TData>({
  queryKey,
  mutationFn,
  updater,
  mirrors,
}: Options<TVariables, TData>) {
  const queryClient = useQueryClient();
  const lastVariables = useRef<TVariables | null>(null);

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      lastVariables.current = variables;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: unknown) =>
        updater(old, variables)
      );

      const mirrorPrevious: { queryKey: QueryKey; data: unknown }[] = [];
      for (const mirror of mirrors ?? []) {
        await queryClient.cancelQueries({ queryKey: mirror.queryKey });
        mirrorPrevious.push({
          queryKey: mirror.queryKey,
          data: queryClient.getQueryData(mirror.queryKey),
        });
        queryClient.setQueryData(mirror.queryKey, (old: unknown) =>
          mirror.updater(old, variables)
        );
      }

      return { previous, mirrorPrevious };
    },
    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previous);
        for (const { queryKey: mirrorKey, data } of context.mirrorPrevious) {
          queryClient.setQueryData(mirrorKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      for (const mirror of mirrors ?? []) {
        queryClient.invalidateQueries({ queryKey: mirror.queryKey });
      }
    },
  });

  function retry() {
    if (lastVariables.current !== null) {
      mutation.mutate(lastVariables.current);
    }
  }

  return { ...mutation, retry };
}
