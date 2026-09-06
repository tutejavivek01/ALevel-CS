import type { ReactNode } from 'react';
import { NavRail } from './NavRail';
import { OverallProgress } from './OverallProgress';
import { AccountBadge } from './AccountBadge';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <div className="mark">4.x</div>
          <div>
            <h1>Spec Tracker</h1>
            <div className="sub">AQA A-Level Computer Science &middot; 7517</div>
          </div>
        </div>
        <div className="overall">
          <OverallProgress />
          <AccountBadge />
        </div>
      </header>

      <div className="layout">
        <NavRail />
        <main>{children}</main>
      </div>
    </div>
  );
}
