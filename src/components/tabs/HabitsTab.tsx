import { useState } from 'react';
import { useStore } from '../../store/store';
import { last7Days, today, shortDay, habitStreak } from '../../lib/utils';

const COLORS = ['#6366f1','#10b981','#3b82f6','#f59e0b','#ef4444','#a78bfa','#ec4899','#14b8a6'];

export default function HabitsTab() {
  const { habits, addHabit, toggleHabit, removeHabit } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const days  = last7Days();
  const todayStr = today();
  const active = habits.filter(h => !h.archived);

  function handleAdd() {
    if (!name.trim()) return;
    addHabit(name.trim(), color);
    setName('');
    setColor(COLORS[0]);
    setShowForm(false);
  }

  return (
    <div className="page fade-up">
      <p className="section-title">Weekly habits</p>

      {/* Day header */}
      {active.length > 0 && (
        <div className="card" style={{ padding: '1rem 1rem .25rem' }}>
          {/* Day labels */}
          <div style={{ display: 'flex', paddingLeft: 'calc(100% - 174px)', gap: 4, marginBottom: '.5rem' }}>
            {days.map(d => (
              <div key={d} style={{
                width: 22, textAlign: 'center',
                fontSize: '.58rem', color: d === todayStr ? 'var(--accent)' : 'var(--text-3)',
                fontWeight: d === todayStr ? 700 : 500,
              }}>
                {shortDay(d).slice(0,1)}
              </div>
            ))}
          </div>

          {active.map(h => {
            const streak = habitStreak(h);
            return (
              <div className="habit-row" key={h.id}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: h.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '.88rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</p>
                  {streak > 0 && (
                    <p style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>{streak}d streak 🔥</p>
                  )}
                </div>
                <div className="habit-dots">
                  {days.map(d => {
                    const done = h.completions.includes(d);
                    const isToday = d === todayStr;
                    return (
                      <div
                        key={d}
                        className={`dot${done ? ' filled' : ''}${isToday ? ' is-today' : ''}`}
                        style={done ? { background: h.color } : undefined}
                        onClick={() => toggleHabit(h.id, d)}
                      />
                    );
                  })}
                </div>
                <button
                  onClick={() => removeHabit(h.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '1.1rem', padding: '2px 4px', lineHeight: 1 }}
                >×</button>
              </div>
            );
          })}
        </div>
      )}

      {active.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '.88rem', padding: '2rem 1rem' }}>
          No habits yet — add your first one below.
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="card fade-up">
          <p className="sheet-title">New habit</p>
          <div className="form-row">
            <label className="form-label">Name</label>
            <input
              className="input"
              placeholder="e.g. Meditate, Exercise, Read…"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
          </div>
          <div className="form-row">
            <label className="form-label">Colour</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                    outline: color === c ? '3px solid var(--text)' : '2px solid transparent',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleAdd} disabled={!name.trim()}>Add habit</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-ghost btn-full" onClick={() => setShowForm(true)}>
          + Add habit
        </button>
      )}
    </div>
  );
}
