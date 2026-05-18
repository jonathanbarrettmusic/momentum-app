import type { Habit, TimeBlock, Goal, ActiveBlocker, BlockerScores } from '../types';

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function shortDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short' });
}

export function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function toMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function fromMins(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${ampm}`;
}

// ── Score helpers ────────────────────────────────────────────────────────────

export function habitStreak(h: Habit): number {
  const t = today();
  let streak = 0;
  const d = new Date();
  while (true) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!h.completions.includes(iso)) break;
    streak++;
    d.setDate(d.getDate() - 1);
    if (streak > 365) break;
  }
  return streak;
}

export function longestStreak(habits: Habit[]): number {
  if (!habits.length) return 0;
  return Math.max(...habits.filter(h => !h.archived).map(habitStreak));
}

export function habitScore(habits: Habit[]): number {
  const active = habits.filter(h => !h.archived);
  if (!active.length) return 100;
  const t = today();
  const done = active.filter(h => h.completions.includes(t)).length;
  return Math.round((done / active.length) * 100);
}

export function goalProgress(g: Goal): number {
  if (g.target === 0) return 100;
  return Math.min(100, Math.round((g.current / g.target) * 100));
}

export function avgGoalProgress(goals: Goal[]): number {
  if (!goals.length) return 100;
  return Math.round(goals.reduce((s, g) => s + goalProgress(g), 0) / goals.length);
}

export function goalsOnTrack(goals: Goal[]): number {
  return goals.filter(g => goalProgress(g) >= 50).length;
}

export function blockerScore(active: ActiveBlocker[], scores: BlockerScores | null): number {
  const unresolved = active.filter(b => !b.resolvedAt);
  const sevPenalty = unresolved.length
    ? Math.round(unresolved.reduce((s, b) => s + b.severity, 0) / unresolved.length) * 10
    : 0;
  const internalScore = scores
    ? Math.round((scores.focus + scores.energy + scores.motivation + scores.clarity) / 4) * 10
    : 70;
  return Math.max(0, Math.round((internalScore - sevPenalty + 100) / 2));
}

export function freeTimePct(blocks: TimeBlock[], date: string): number {
  const day = blocks.filter(b => b.date === date);
  const total = day.reduce((s, b) => s + (toMins(b.endTime) - toMins(b.startTime)), 0);
  if (!total) return 0;
  const free = day.filter(b => b.type === 'free').reduce((s, b) => s + (toMins(b.endTime) - toMins(b.startTime)), 0);
  return Math.round((free / total) * 100);
}

export function momentumScore(
  habits: Habit[],
  goals: Goal[],
  blocks: TimeBlock[],
  active: ActiveBlocker[],
  scores: BlockerScores | null,
): number {
  const h = habitScore(habits);
  const g = avgGoalProgress(goals);
  const b = blockerScore(active, scores);
  const t = freeTimePct(blocks, today());
  // weighted: habits 35%, goals 35%, blockers 20%, free time balance 10%
  const ft = t > 0 && t <= 30 ? 100 : t > 30 ? Math.max(0, 100 - (t - 30) * 2) : 60;
  return Math.round(h * 0.35 + g * 0.35 + b * 0.20 + ft * 0.10);
}
