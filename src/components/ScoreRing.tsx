interface Props {
  score: number;
}

const SIZE = 80;
const R    = 34;
const CIRC = 2 * Math.PI * R;

function scoreColor(s: number) {
  if (s >= 75) return '#10b981';
  if (s >= 50) return '#6366f1';
  if (s >= 30) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(s: number) {
  if (s >= 80) return 'On fire 🔥';
  if (s >= 65) return 'Strong day';
  if (s >= 50) return 'Making progress';
  if (s >= 35) return 'Getting there';
  return 'Needs attention';
}

export default function ScoreRing({ score }: Props) {
  const pct   = Math.min(100, Math.max(0, score));
  const dash  = (pct / 100) * CIRC;
  const color = scoreColor(pct);

  return (
    <div className="score-header">
      <div className="score-ring-wrap">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="var(--surface-2)" strokeWidth="7" />
          <circle
            cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC}`}
            style={{ transition: 'stroke-dasharray .6s ease' }}
          />
        </svg>
        <div className="score-ring-number" style={{ color }}>{pct}</div>
      </div>
      <div className="score-info">
        <h1>Momentum</h1>
        <p>{scoreLabel(pct)}</p>
      </div>
    </div>
  );
}
