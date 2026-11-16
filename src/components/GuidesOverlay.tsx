import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../lib/constants';
import type { GuideType } from '../types/layout';

interface GuidesOverlayProps {
  guide: GuideType;
}

export function GuidesOverlay({ guide }: GuidesOverlayProps) {
  if (guide === 'none') return null;

  const renderGridLines = (cols: number, rows: number) => {
    const lines: React.ReactNode[] = [];
    for (let c = 1; c < cols; c++) {
      const x = (CANVAS_WIDTH / cols) * c;
      lines.push(
        <line
          key={`v-${c}`}
          x1={x}
          y1={0}
          x2={x}
          y2={CANVAS_HEIGHT}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
        />,
      );
    }
    for (let r = 1; r < rows; r++) {
      const y = (CANVAS_HEIGHT / rows) * r;
      lines.push(
        <line
          key={`h-${r}`}
          x1={0}
          y1={y}
          x2={CANVAS_WIDTH}
          y2={y}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={1}
        />,
      );
    }
    return lines;
  };

  return (
    <svg
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {(guide === 'center' || guide === 'center-gfx' || guide === 'center-action') && (
        <>
          <line
            x1={CANVAS_WIDTH / 2}
            y1={0}
            x2={CANVAS_WIDTH / 2}
            y2={CANVAS_HEIGHT}
            stroke="rgba(255,255,255,0.38)"
            strokeWidth={1}
          />
          <line
            x1={0}
            y1={CANVAS_HEIGHT / 2}
            x2={CANVAS_WIDTH}
            y2={CANVAS_HEIGHT / 2}
            stroke="rgba(255,255,255,0.38)"
            strokeWidth={1}
          />
        </>
      )}

      {guide === 'center-action' && (
        <rect
          x={CANVAS_WIDTH * 0.05}
          y={CANVAS_HEIGHT * 0.05}
          width={CANVAS_WIDTH * 0.9}
          height={CANVAS_HEIGHT * 0.9}
          fill="none"
          stroke="rgba(255,255,255,0.38)"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
      )}

      {guide === 'center-gfx' && (
        <>
          {/* 80% Title/Graphics safe zone */}
          <rect
            x={CANVAS_WIDTH * 0.1}
            y={CANVAS_HEIGHT * 0.1}
            width={CANVAS_WIDTH * 0.8}
            height={CANVAS_HEIGHT * 0.8}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1}
          />
          {/* 4:3 safe width markers (576px centered inside 768px) */}
          <line
            x1={CANVAS_WIDTH * 0.125}
            y1={0}
            x2={CANVAS_WIDTH * 0.125}
            y2={CANVAS_HEIGHT}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={CANVAS_WIDTH * 0.875}
            y1={0}
            x2={CANVAS_WIDTH * 0.875}
            y2={CANVAS_HEIGHT}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        </>
      )}

      {guide === '4x4' && renderGridLines(4, 4)}
      {guide === '8x8' && renderGridLines(8, 8)}
      {guide === '16x9' && renderGridLines(16, 9)}
      {guide === '16x16' && renderGridLines(16, 16)}
      {guide === '32x18' && renderGridLines(32, 18)}
    </svg>
  );
}
