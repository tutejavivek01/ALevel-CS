import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Without this, RTL doesn't unmount between tests in the same file,
// so a second render() in the same describe block sees the first
// render's leftover DOM too (e.g. two "Check my trace" buttons).
afterEach(() => {
  cleanup();
});
