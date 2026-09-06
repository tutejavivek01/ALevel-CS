'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Topic links (4.1-4.13) are added once /lib/spec exists (task 7) and
// their progress rings once the tracker is wired up (task 8+). For now
// this only lists the top-level sections from design.md §5.
const NAV_ITEMS = [
  { href: '/', ref: '—', label: 'Dashboard' },
  { href: '/practice/theory-of-computation', ref: '4.4', label: 'Theory of Computation Practice' },
  { href: '/python', ref: 'Py', label: 'Python Practice' },
  { href: '/nea', ref: '4.14', label: 'Non-Exam Assessment' },
];

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav className="rail">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rail-item${pathname === item.href ? ' active' : ''}`}
        >
          <span className="ref">{item.ref}</span>
          <span className="t">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
