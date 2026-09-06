'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOPICS } from '@/lib/spec';

// Progress rings per topic land in task 8+ once the tracker is wired up.
const BOTTOM_ITEMS = [
  { href: '/practice/theory-of-computation', ref: '4.4', label: 'Theory of Computation Practice' },
  { href: '/python', ref: 'Py', label: 'Python Practice' },
  { href: '/nea', ref: '4.14', label: 'Non-Exam Assessment' },
];

export function NavRail() {
  const pathname = usePathname();

  function itemClass(href: string) {
    return `rail-item${pathname === href ? ' active' : ''}`;
  }

  return (
    <nav className="rail">
      <div className="rail-group-label">Overview</div>
      <Link href="/" className={itemClass('/')}>
        <span className="ref">—</span>
        <span className="t">Dashboard</span>
      </Link>

      <div className="rail-group-label">Specification 4.1–4.13</div>
      {TOPICS.map((topic) => {
        const href = `/topic/${topic.id}`;
        return (
          <Link key={topic.id} href={href} className={itemClass(href)}>
            <span className="ref">{topic.ref}</span>
            <span className="t">{topic.title}</span>
          </Link>
        );
      })}

      {BOTTOM_ITEMS.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          // .nea only on the first item: it's what draws the divider
          // separating this group from the topic list above.
          className={index === 0 ? `${itemClass(item.href)} nea` : itemClass(item.href)}
        >
          <span className="ref">{item.ref}</span>
          <span className="t">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
