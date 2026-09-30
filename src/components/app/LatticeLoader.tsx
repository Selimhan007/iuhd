import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./LatticeLoader.css";

type Status = "working" | "done" | "error";
type Props = { label?: string; status?: Status; pattern?: "orbit" | "snake" | "ripple"; color?: string; cellSize?: number; gap?: number; step?: number; showTimer?: boolean; className?: string };

const PATTERNS: Record<string, number[]> = { orbit: [0, 1, 2, 7, -1, 3, 6, 5, 4], snake: [0, 1, 2, 5, 4, 3, 6, 7, 8], ripple: [2, 1, 2, 1, 0, 1, 2, 1, 2] };

export function LatticeLoader({ label = "Ýüklenýär", status = "working", pattern = "orbit", color = "currentColor", cellSize = 5, gap = 2, step = 90, showTimer = true, className = "" }: Props) {
  const timerRef = useRef<HTMLSpanElement>(null);
  const [elapsed, setElapsed] = useState(0);
  useLayoutEffect(() => { if (status !== "working") return; const started = performance.now(); const id = window.setInterval(() => setElapsed(Math.floor((performance.now() - started) / 100) / 10), 100); return () => window.clearInterval(id); }, [status]);
  useEffect(() => { if (timerRef.current) timerRef.current.textContent = `${elapsed.toFixed(1)}s`; }, [elapsed]);
  const cells = PATTERNS[pattern];
  return <span role="status" aria-label={label} className={`lattice-loader ${className}`} data-status={status} style={{ "--ll-n": 3, "--ll-cell": `${cellSize}px`, "--ll-gap": `${gap}px`, "--ll-color": color, "--ll-cycle": `${step * 9}ms` } as React.CSSProperties}>
    <span className="lattice-loader__grid" aria-hidden="true"><span className="lattice-loader__run">{cells.map((unit, i) => <span key={i} className="lattice-loader__cell" data-hole={unit < 0 ? "" : undefined} style={unit < 0 ? undefined : { animationDelay: `${unit * step}ms` }} />)}</span><span className="lattice-loader__mark" aria-hidden="true">✓</span></span>
    <span className="lattice-loader__label">{label}</span>{showTimer && <span ref={timerRef} className="lattice-loader__timer">0.0s</span>}
  </span>;
}

export default LatticeLoader;
