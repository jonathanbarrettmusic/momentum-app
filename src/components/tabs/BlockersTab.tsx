import { useState } from 'react';
import { useStore } from '../../store/store';
import type { BlockerSeverity } from '../../types';

const SEV_COLORS: Record<number, string> = {
  1: '#10b981', 2: '#10b981',
  3: '#f59e0b',
  4: '#ef4444', 5: '#ef4444',
};

const CATEGORIES = ['Focus', 'Energy', 'Clarity', 'Confidence', 'External', 'Health', 'Other'];

export default function BlockersTab() {
  const { activeBlockers, blockerScores, addActiveBlocker, resolveBlocker, removeBlocker, saveBlockerScores, todayBlockerScores } = useStore();

  const todayScores = todayBlockerScores();
  const [scores, setScores] = useState({
    focus:      todayScores?.focus      ?? 7,
    energy:     todayScores?.energy     ?? 7,
    motivation: todayScores?.motivation ?? 7,
    clarity:    todayScores?.clarity    ?? 7,
  });
  const [saved, setSaved] = useState(false);

  function handleSaveScores() {
    saveBlockerScores(scores);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Add blocker form
  const [showForm, setShowForm] = useState(false);
  const [bForm, setBForm] = useState({ description: '', category: 'Focus', severity: 3 as BlockerSeverity });

  function handleAddBlocker() {
    if (!bForm.description.trim()) return;
    addActiveBlocker(bForm.description.trim(), bForm.category, bForm.severity);
    setBForm({ description: '', category: 'Focus', severity: 3 });
    setShowForm(false);
  }

  const unresolved = activeBlockers.filter(b => !b.resolvedAt);
  const resolved   = activeBlockers.filter(b => b.resolvedAt);
  const avgScore   = Math.round((scores.focus + scores.energy + scores.motivation + scores.clarity) / 4 * 10);

  const SCORE_FIELDS = [
    { key: 'focus'      as const, label: 'Focus' },
    { key: 'energy'     as const, label: 'Energy' },
    { key: 'motivation' as const, label: 'Motivation' },
    { key: 'clarity'    as const, label: 'Clarity' },
  ];

  return (
    <div className="page fade-up">
      {/* Daily self-rating */}
      <p className="section-title">Today's self-rating</p>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
          <p style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Rate yourself 1–10 in each area</p>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{avgScore}</span>
        </div>

        {SCORE_FIELDS.map(f => (
          <div className="score-row" key={f.key}>
            <label>{f.label}</label>
            <input type="range" min={1} max={10} value={scores[f.key]}
              onChange={e => setScores(s => ({ ...s, [f.key]: Number(e.target.value) }))} />
            <span className="val">{scores[f.key]}</span>
          </div>
        ))}

        <button
          className={`btn btn-sm ${saved ? 'btn-success' : 'btn-primary'}`}
          style={{ marginTop: '.5rem' }}
          onClick={handleSaveScores}
        >
          {saved ? '✓ Saved' : 'Save today\'s scores'}
        </button>
      </div>

      {/* Active blockers */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', marginBottom: '.5rem' }}>
        <p className="section-title" style={{ margin: 0 }}>Active blockers</p>
        <span style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{unresolved.length} active</span>
      </div>

      {unresolved.length > 0 && (
        <div className="card" style={{ padding: '0 1rem' }}>
          {unresolved.map(b => (
            <div className="blocker-item" key={b.id}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: SEV_COLORS[b.severity], flexShrink: 0, marginTop: 4 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '.88rem', fontWeight: 500 }}>{b.description}</p>
                <p style={{ fontSize: '.7rem', color: 'var(--text-3)', marginTop: 2 }}>
                  {b.category} · Severity {b.severity}/5 · Added {b.addedAt}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '.35rem', flexShrink: 0 }}>
                <button className="btn btn-success btn-sm" onClick={() => resolveBlocker(b.id)}>Resolve</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeBlocker(b.id)}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {unresolved.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '.88rem', padding: '1.25rem' }}>
          No active blockers 🎉
        </div>
      )}

      {/* Add blocker */}
      {showForm ? (
        <div className="card fade-up">
          <p className="sheet-title">Add blocker</p>
          <div className="form-row">
            <label className="form-label">Description</label>
            <input className="input" placeholder="What's blocking you?" value={bForm.description}
              onChange={e => setBForm(f => ({ ...f, description: e.target.value }))} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddBlocker()} />
          </div>
          <div className="form-2col form-row">
            <div>
              <label className="form-label">Category</label>
              <select className="input" value={bForm.category}
                onChange={e => setBForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Severity (1–5)</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {([1,2,3,4,5] as BlockerSeverity[]).map(n => (
                  <button key={n} onClick={() => setBForm(f => ({ ...f, severity: n }))}
                    style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', fontWeight: 700, fontSize: '.8rem',
                      background: bForm.severity === n ? SEV_COLORS[n] : 'var(--surface-2)',
                      color: bForm.severity === n ? '#fff' : 'var(--text-3)' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleAddBlocker} disabled={!bForm.description.trim()}>Add blocker</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-ghost btn-full" style={{ marginTop: '.5rem' }} onClick={() => setShowForm(true)}>
          + Add blocker
        </button>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <>
          <p className="section-title">Resolved ({resolved.length})</p>
          <div className="card" style={{ padding: '0 1rem' }}>
            {resolved.map(b => (
              <div className="blocker-item" key={b.id} style={{ opacity: .5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '.85rem', textDecoration: 'line-through' }}>{b.description}</p>
                  <p style={{ fontSize: '.7rem', color: 'var(--text-3)', marginTop: 2 }}>
                    Resolved {b.resolvedAt}
                  </p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeBlocker(b.id)}>×</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
