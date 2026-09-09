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
//
// The file-upload control lives here, not in either detail page
// (requirements.md §8.9/design.md §6.7) - a single shared change so
// both /python/[problemId] and /python/ocr/[challengeId] get it for
// free, rather than two copies. It doesn't add a second way to submit
// code: reading the file's text and calling the same onChange the
// editor itself calls means an uploaded file becomes the editor's
// value exactly as if typed, with no separate upload endpoint or
// server-side storage.
export function PythonEditor({ value, onChange }: Props) {
  const dark = useSyncExternalStore(subscribeToColorScheme, getIsDark, () => false);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-uploading the same filename later
    if (!file) return;
    onChange(await file.text());
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
        <label className="btn2 alt" style={{ cursor: 'pointer' }}>
          Upload .py file
          <input
            type="file"
            accept=".py"
            onChange={handleFileSelected}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <CodeMirror
        value={value}
        height="320px"
        theme={dark ? 'dark' : 'light'}
        extensions={[python()]}
        onChange={onChange}
      />
    </div>
  );
}
