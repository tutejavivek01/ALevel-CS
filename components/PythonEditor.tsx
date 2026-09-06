'use client';

import { useSyncExternalStore } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function subscribeToColorScheme(callback: () => void) {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getIsDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Follows prefers-color-scheme the same way the rest of the app's
// theming does (app/globals.css - no manual toggle exists yet, see
// conventions.md), rather than inventing a separate theme source just
// for the editor. useSyncExternalStore (not useState+useEffect) both
// avoids the react-hooks/set-state-in-effect lint error and sidesteps
// any hydration mismatch: the server snapshot is a fixed `false`, and
// React reconciles the real client value after hydration itself.
export function PythonEditor({ value, onChange }: Props) {
  const dark = useSyncExternalStore(subscribeToColorScheme, getIsDark, () => false);

  return (
    <CodeMirror
      value={value}
      height="320px"
      theme={dark ? 'dark' : 'light'}
      extensions={[python()]}
      onChange={onChange}
    />
  );
}
