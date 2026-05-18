import { useState } from 'react';
import { useStore } from '../../store/store';
import { goalProgress } from '../../lib/utils';
import type { Goal, GoalCategory } from '../../types';

const CAT_COLORS: Record<GoalCategory, string> = {
  personal:     '#a78bfa',
  professional: '#3b82f6',
};

function ProgressBar({ goal }: { goal: Goal }) {
  const pct = goalProgress(goal);
  const color = pct >= 100 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--warning)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>
          {goal.current} / {goal.target} {goal.unit}
        </span>
        <span style={{ fontSize: '.85rem', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
        {goal.milestones.map(m => (
          <div key={m.id} className={`milestone-pip${m.completedAt ? ' hit' : ''}`} style={{ left: `${m.pct}%` }}
            title={`${m.label} (${m.pct}%)`} />
        ))}
      </div>
      {goal.milestones.length > 0 && (
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.35rem' }}>
          {goal.milestones.map(m => (
            <span key={m.id} style={{ fontSize: '.65rem', color: m.completedAt ? 'var(--success)' : 'var(--text-3)' }}>
              {m.completedAt ? '✓' : '◦'} {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GoalsTab() {
  const { goals, addGoal, updateGoalProgress, addMilestone, removeGoal } = useStore();
  const [showForm, setShowForm]     = useState(false);
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState('');
  const [milestoneForm, setMilestoneForm] = useState<{ goalId: string; label: string; pct: string } | null>(null);

  // Goal form
  const [form, setForm] = useState({
    title: '', category: 'personal' as GoalCategory,
    target: '', unit: '', dueDate: '',
  });

  function handleAdd() {
    if (!form.title.trim() || !form.target || !form.unit.trim()) return;
    addGoal(form.title.trim(), form.category, Number(form.target), form.unit.trim(), form.dueDate || undefined);
    setForm({ title: '', category: 'personal', target: '', unit: '', dueDate: '' });
    setShowForm(false);
  }

  function handleUpdateProgress(id: string) {
    const v = Number(progressVal);
    if (isNaN(v) || v < 0) return;
    updateGoalProgress(id, v);
    setProgressVal('');
    setActiveId(null);
  }

  function handleAddMilestone() {
    if (!milestoneForm?.label.trim() || !milestoneForm.pct) return;
    addMilestone(milestoneForm.goalId, milestoneForm.label.trim(), Number(milestoneForm.pct));
    setMilestoneForm(null);
  }

  const personal     = goals.filter(g => g.category === 'personal');
  const professional = goals.filter(g => g.category === 'professional');

  function GoalCard({ g }: { g: Goal }) {
    const isActive = activeId === g.id;
    const catColor = CAT_COLORS[g.category];
    return (
      <div className="card goal-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '.6rem' }}>
          <div>
            <span style={{ fontSize: '.62rem', fontWeight: 700, color: catColor, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {g.category}
            </span>
            <p style={{ fontSize: '.95rem', fontWeight: 600, marginTop: 2 }}>{g.title}</p>
            {g.dueDate && <p style={{ fontSize: '.7rem', color: 'var(--text-3)', marginTop: 2 }}>Due {g.dueDate}</p>}
          </div>
          <button onClick={() => removeGoal(g.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '1.1rem', padding: '2px 4px' }}>×</button>
        </div>
        <ProgressBar goal={g} />

        {/* Update progress */}
        <div style={{ marginTop: '.75rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {isActive ? (
            <>
              <input className="input" type="number" placeholder={`New value (${g.unit})`}
                value={progressVal} onChange={e => setProgressVal(e.target.value)}
                style={{ flex: 1, minWidth: 120 }} autoFocus
                onKeyDown={e => e.key === 'Enter' && handleUpdateProgress(g.id)} />
              <button className="btn btn-primary btn-sm" onClick={() => handleUpdateProgress(g.id)}>Update</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveId(null)}>×</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => { setActiveId(g.id); setProgressVal(String(g.current)); }}>
                Update progress
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => setMilestoneForm({ goalId: g.id, label: '', pct: '' })}>
                + Milestone
              </button>
            </>
          )}
        </div>

        {/* Milestone form */}
        {milestoneForm?.goalId === g.id && (
          <div style={{ marginTop: '.75rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap', padding: '.75rem', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}>
            <input className="input" placeholder="Milestone name" value={milestoneForm.label}
              onChange={e => setMilestoneForm(f => f && { ...f, label: e.target.value })}
              style={{ flex: 2, minWidth: 120 }} autoFocus />
            <input className="input" type="number" placeholder="At %" min="1" max="100"
              value={milestoneForm.pct} onChange={e => setMilestoneForm(f => f && { ...f, pct: e.target.value })}
              style={{ width: 70, flex: 'none' }} />
            <button className="btn btn-primary btn-sm" onClick={handleAddMilestone}
              disabled={!milestoneForm.label.trim() || !milestoneForm.pct}>Add</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setMilestoneForm(null)}>×</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page fade-up">
      {professional.length > 0 && (
        <>
          <p className="section-title">Professional</p>
          {professional.map(g => <GoalCard key={g.id} g={g} />)}
        </>
      )}
      {personal.length > 0 && (
        <>
          <p className="section-title">Personal</p>
          {personal.map(g => <GoalCard key={g.id} g={g} />)}
        </>
      )}
      {goals.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '.88rem', padding: '2rem 1rem' }}>
          No goals yet — add your first one below.
        </div>
      )}

      {showForm ? (
        <div className="card fade-up">
          <p className="sheet-title">New goal</p>
          <div className="form-row">
            <label className="form-label">Title</label>
            <input className="input" placeholder="e.g. Run a half marathon" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
          </div>
          <div className="form-2col form-row">
            <div>
              <label className="form-label">Target</label>
              <input className="input" type="number" placeholder="100" value={form.target}
                onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Unit</label>
              <input className="input" placeholder="km, books, days…" value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            </div>
          </div>
          <div className="form-2col form-row">
            <div>
              <label className="form-label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as GoalCategory }))}>
                <option value="personal">Personal</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div>
              <label className="form-label">Due date (optional)</label>
              <input className="input" type="date" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleAdd}
              disabled={!form.title.trim() || !form.target || !form.unit.trim()}>Add goal</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-ghost btn-full" onClick={() => setShowForm(true)}>+ Add goal</button>
      )}
    </div>
  );
}
