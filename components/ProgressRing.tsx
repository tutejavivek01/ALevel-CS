type ProgressRingProps = {
  percent: number;
  size: number;
  stroke: number;
  colorVar?: string;
};

export function ProgressRing({ percent, size, stroke, colorVar }: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg
      className="ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        className="ring-track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
      />
      <circle
        className="ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          ...(colorVar ? { stroke: colorVar } : {}),
        }}
      />
    </svg>
  );
}
