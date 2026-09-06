import { useId } from 'react';
import type { Fsm } from '@/lib/exercises/fsm-engine';

const R = 26;

function edgeLabel(input: string, output?: string) {
  return output ? `${input} / ${output}` : input;
}

// Ported from reference/prototype.html's fsmSvg(). The label is derived
// from input/output here rather than stored on the edge - see
// lib/exercises/fsm-engine.ts's comment on why.
export function FsmDiagram({ fsm }: { fsm: Fsm }) {
  // React's useId() includes colons, which are namespace-sensitive in
  // SVG/XML - stripped so it's a plain, safe id for url(#...) references.
  const arrowId = useId().replace(/:/g, '');
  const byId = Object.fromEntries(fsm.states.map((s) => [s.id, s]));

  const edges = fsm.edges.map((edge, index) => {
    const a = byId[edge.from];
    const b = byId[edge.to];
    const label = edgeLabel(edge.input, edge.output);

    if (edge.self) {
      const path = `M ${a.x - 14},${a.y - R + 4} C ${a.x - 34},${a.y - R - 34} ${a.x + 34},${a.y - R - 34} ${a.x + 14},${a.y - R + 4}`;
      return (
        <g key={index}>
          <path className="edge self" d={path} />
          <text className="edge-label" x={a.x} y={a.y - R - 34} textAnchor="middle">
            {label}
          </text>
        </g>
      );
    }

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const x1 = a.x + ux * R;
    const y1 = a.y + uy * R;
    const x2 = b.x - ux * R;
    const y2 = b.y - uy * R;
    const midx = (x1 + x2) / 2;
    const midy = (y1 + y2) / 2 + (edge.curveUp ? -30 : edge.below ? 26 : -10);
    const path = `M ${x1},${y1} Q ${midx},${midy} ${x2},${y2}`;

    return (
      <g key={index}>
        <path className="edge" d={path} markerEnd={`url(#${arrowId})`} />
        <text className="edge-label" x={midx} y={midy - 4} textAnchor="middle">
          {label}
        </text>
      </g>
    );
  });

  const states = fsm.states.map((s) => (
    <g key={s.id}>
      <circle className={`state${s.accept ? ' accept' : ''}`} cx={s.x} cy={s.y} r={R} />
      <text x={s.x} y={s.y + 4} textAnchor="middle">
        {s.id}
      </text>
      {s.start && (
        <line
          x1={s.x - R - 22}
          y1={s.y}
          x2={s.x - R - 2}
          y2={s.y}
          stroke="var(--ink-dim)"
          strokeWidth={1.3}
          markerEnd={`url(#${arrowId})`}
        />
      )}
      {s.accept && (
        <circle cx={s.x} cy={s.y} r={R - 5} fill="none" stroke="var(--good)" strokeWidth={1.6} />
      )}
    </g>
  ));

  const width = Math.max(...fsm.states.map((s) => s.x)) + 90;

  return (
    <svg className="fsm" viewBox={`0 0 ${width} 190`}>
      <defs>
        <marker id={arrowId} markerWidth={8} markerHeight={8} refX={7} refY={3} orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="var(--ink-dim)" />
        </marker>
      </defs>
      {edges}
      {states}
    </svg>
  );
}
