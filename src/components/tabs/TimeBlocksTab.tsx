import { useState } from 'react';
import { useStore } from '../../store/store';
import { today, fmtTime, toMins, fromMins } from '../../lib/utils';
import type { BlockType, TimeBlock } from '../../types';

const BLOCK_TYPES: { value: BlockType; label: string; color: string }[] = [
  { value: 'work',  label: 'Work',  color: 'var(--work)' },
  { value: 'goal',  label: 'Goal',  color: 'var(--goal)' },
  { value: 'rest',  label: 'Rest',  color: 'var(--rest)' },
  { value: 'free',  label: 'Free',  color: 'var(--free)' },
];

const DAY_START = 6 * 60;   // 6am
const DAY_END   = 23 * 60;  // 11pm
const PX_PER_MIN = 1.5;
const TOTAL_PX   = (DAY_END - DAY_START) * PX_PER_MIN;
const HOURS = Array.from({ length: DAY_END / 60 - DAY_START / 60 + 1 }, (_, i) => DAY_START / 60 + i);

function dateLabel(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const isToday = iso === today();
  return isToday ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

interface BlockForm {
  startTime: string;
  endTime: string;
  type: BlockType;
  label: string;
}

const BLANK: BlockForm = { startTime: '09:00', endTime: '10:00', type: 'work', label: '' };

export default function TimeBlocksTab() {
  const { timeBlocks, addTimeBlock, updateTimeBlock, removeTimeBlock } = useStore();
  const [date, setDate]           = useState(today());
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState<BlockForm>(BLANK);

  const dayBlocks = timeBlocks
    .filter(b => b.date === date)
    .sort((a, b) => toMins(a.startTime) - toMins(b.startTime));

  function openAdd() {
    setForm(BLANK);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(b: TimeBlock) {
    setForm({ startTime: b.startTime, endTime: b.endTime, type: b.type, label: b.label });
    setEditId(b.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.label.trim()) return;
    if (toMins(form.endTime) <= toMins(form.startTime)) return;
    if (editId) {
      updateTimeBlock(editId, { ...form, date });
    } else {
      addTimeBlock(date, form.startTime, form.endTime, form.type, form.label.trim());
    }
    setShowForm(false);
    setEditId(null);
  }

  // Block type legend
  const typeUsage = BLOCK_TYPES.map(t => {
    const mins = dayBlocks.filter(b => b.type === t.value).reduce((s, b) => s + toMins(b.endTime) - toMins(b.startTime), 0);
    return { ...t, mins };
  });

  return (
    <div className="page fade-up">
      {/* Date nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '1rem 0 .5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setDate(d => addDays(d, -1))}>‹</button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: '.9rem', fontWeight: 700 }}>{dateLabel(date)}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setDate(d => addDays(d, 1))}>›</button>
        {date !== today() && (
          <button className="btn btn-ghost btn-sm" onClick={() => setDate(today())}>Today</button>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
        {typeUsage.map(t => (
          <span key={t.value} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.72rem', color: 'var(--text-2)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, flexShrink: 0 }} />
            {t.label}{t.mins > 0 ? ` · ${Math.round(t.mins / 60 * 10) / 10}h` : ''}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding: '1rem 1rem 1rem', overflow: 'hidden' }}>
        <div className="timeline-wrap" style={{ height: TOTAL_PX, position: 'relative' }}>
          {/* Hour lines */}
          {HOURS.map(h => {
            const top = (h * 60 - DAY_START) * PX_PER_MIN;
            if (top > TOTAL_PX) return null;
            return (
              <div key={h} style={{ position: 'absolute', top, left: 0, right: 0, display: 'flex', alignItems: 'center' }}>
                <span className="timeline-hour" style={{ position: 'static', width: 40, marginRight: 6, textAlign: 'right', fontSize: '.6rem', color: 'var(--text-3)', flexShrink: 0 }}>
                  {fmtTime(fromMins(h * 60))}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)', opacity: .35 }} />
              </div>
            );
          })}

          {/* Blocks */}
          {dayBlocks.map(b => {
            const startMins = toMins(b.startTime);
            const endMins   = toMins(b.endTime);
            if (startMins < DAY_START || endMins > DAY_END) return null;
            const top  = (startMins - DAY_START) * PX_PER_MIN;
            const height = (endMins - startMins) * PX_PER_MIN;
            return (
              <div
                key={b.id}
                className={`timeline-block block-${b.type}`}
                style={{ top, height: height - 2, left: 46 }}
                onClick={() => openEdit(b)}
              >
                {b.label}
                {height >= 30 && <span style={{ opacity: .7 }}> · {fmtTime(b.startTime)}–{fmtTime(b.endTime)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn btn-ghost btn-full" onClick={openAdd}>+ Add block</button>

      {/* Form sheet */}
      {showForm && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="sheet fade-up">
            <p className="sheet-title">{editId ? 'Edit block' : 'Add block'}</p>

            <div className="form-row">
              <label className="form-label">Label</label>
              <input className="input" placeholder="e.g. Deep work, Gym, Lunch…"
                value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} autoFocus />
            </div>

            <div className="form-2col form-row">
              <div>
                <label className="form-label">Start</label>
                <input className="input" type="time" value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">End</label>
                <input className="input" type="time" value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                {BLOCK_TYPES.map(t => (
                  <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                    className={`btn btn-sm`}
                    style={form.type === t.value ? { background: t.color, color: '#fff', border: 'none' } : { background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSave}
                disabled={!form.label.trim() || toMins(form.endTime) <= toMins(form.startTime)}>
                {editId ? 'Save' : 'Add block'}
              </button>
              {editId && (
                <button className="btn btn-danger" onClick={() => { removeTimeBlock(editId!); setShowForm(false); }}>
                  Delete
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
