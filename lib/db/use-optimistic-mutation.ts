'use client';

import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useRef } from 'react';

// The shared save-reliability pattern from design.md §7 / principles.md §1:
// apply the change locally, write it, and on failure roll back *and*
// surface a retry - never let a failed write just silently vanish.
type Options<TVariables, TData> = {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  updater: (previous: unknown, variables: TVariables) => unknown;
};

export function useOptimisticMutation<TVariables, TData>({
  queryKey,
  mutationFn,
  updater,
}: Options<TVariables, TData>) {
  const queryClient = useQueryClient();
  const lastVariables = useRef<TVariables | null>(null);

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      lastVariables.current = variables;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: unknown) => updater(old, variables));
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  function retry() {
    if (lastVariables.current !== null) {
      mutation.mutate(lastVariables.current);
    }
  }

  return { ...mutation, retry };
}
