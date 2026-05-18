interface Metric {
  value: string | number;
  label: string;
  accent?: string;
}

export default function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="metrics-row">
      {metrics.map(m => (
        <div className="metric-card" key={m.label}>
          <div className="metric-value" style={m.accent ? { color: m.accent } : undefined}>{m.value}</div>
          <div className="metric-label">{m.label}</div>
        </div>
      ))}
    </div>
  );
}
