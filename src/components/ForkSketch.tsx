import {
  FORK_BUILDINGS,
  FORK_CIRCLES,
  FORK_HATCH,
  FORK_OPEN,
  FORK_PATHS,
  FORK_TAGS,
  FORK_TREES,
} from "./forkDrawing";

const STROKES = [
  ...FORK_PATHS,
  ...FORK_HATCH,
  ...FORK_BUILDINGS,
  ...FORK_TREES,
  ...FORK_OPEN,
];

export function ForkSketch({
  className = "",
  cropTop = false,
}: {
  className?: string;
  cropTop?: boolean;
}) {
  return (
    <svg
      viewBox={cropTop ? "0 0 800 350" : "0 0 800 1000"}
      className={`h-auto w-full ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio={cropTop ? "xMidYMin slice" : "xMidYMid meet"}
      aria-hidden
    >
      {STROKES.map((s, i) => (
        <path
          key={i}
          d={s.d}
          stroke="currentColor"
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {FORK_CIRCLES.map((c, i) => (
        <circle
          key={i}
          cx={c.cx}
          cy={c.cy}
          r={c.r}
          stroke="currentColor"
          strokeWidth={c.width}
        />
      ))}
      {FORK_TAGS.map((tag) => (
        <g key={tag.label}>
          <line
            x1={tag.x + 18}
            y1={tag.y + 11}
            x2={tag.toX}
            y2={tag.toY}
            stroke="currentColor"
            strokeWidth="1"
          />
          <rect
            x={tag.x}
            y={tag.y}
            width="36"
            height="22"
            fill="currentColor"
          />
          <text
            x={tag.x + 18}
            y={tag.y + 15}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-jetbrains), ui-monospace, monospace"
            className="fill-canvas [.text-canvas_&]:fill-forest"
          >
            {tag.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
