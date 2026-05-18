import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uid, today } from '../lib/utils';
import type { Habit, TimeBlock, Goal, Milestone, ActiveBlocker, BlockerScores, BlockType, GoalCategory, BlockerSeverity } from '../types';

interface Store {
  // Data
  habits:        Habit[];
  timeBlocks:    TimeBlock[];
  goals:         Goal[];
  activeBlockers: ActiveBlocker[];
  blockerScores: BlockerScores[];

  // Habits
  addHabit:       (name: string, color: string) => void;
  toggleHabit:    (id: string, date: string) => void;
  removeHabit:    (id: string) => void;

  // Time blocks
  addTimeBlock:    (date: string, startTime: string, endTime: string, type: BlockType, label: string) => void;
  updateTimeBlock: (id: string, patch: Partial<Omit<TimeBlock, 'id'>>) => void;
  removeTimeBlock: (id: string) => void;

  // Goals
  addGoal:        (title: string, category: GoalCategory, target: number, unit: string, dueDate?: string) => void;
  updateGoalProgress: (id: string, current: number) => void;
  addMilestone:   (goalId: string, label: string, pct: number) => void;
  removeMilestone: (goalId: string, milestoneId: string) => void;
  removeGoal:     (id: string) => void;

  // Blockers
  addActiveBlocker:    (description: string, category: string, severity: BlockerSeverity) => void;
  resolveBlocker:      (id: string) => void;
  removeBlocker:       (id: string) => void;
  saveBlockerScores:   (scores: Omit<BlockerScores, 'date'>) => void;
  todayBlockerScores:  () => BlockerScores | null;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      habits:         [],
      timeBlocks:     [],
      goals:          [],
      activeBlockers: [],
      blockerScores:  [],

      // ── Habits ────────────────────────────────────────────────────────────

      addHabit: (name, color) => set(s => ({
        habits: [...s.habits, { id: uid(), name, color, completions: [], createdAt: today(), archived: false }],
      })),

      toggleHabit: (id, date) => set(s => ({
        habits: s.habits.map(h => {
          if (h.id !== id) return h;
          const has = h.completions.includes(date);
          return { ...h, completions: has ? h.completions.filter(d => d !== date) : [...h.completions, date] };
        }),
      })),

      removeHabit: (id) => set(s => ({ habits: s.habits.filter(h => h.id !== id) })),

      // ── Time blocks ───────────────────────────────────────────────────────

      addTimeBlock: (date, startTime, endTime, type, label) => set(s => ({
        timeBlocks: [...s.timeBlocks, { id: uid(), date, startTime, endTime, type, label }],
      })),

      updateTimeBlock: (id, patch) => set(s => ({
        timeBlocks: s.timeBlocks.map(b => b.id === id ? { ...b, ...patch } : b),
      })),

      removeTimeBlock: (id) => set(s => ({ timeBlocks: s.timeBlocks.filter(b => b.id !== id) })),

      // ── Goals ─────────────────────────────────────────────────────────────

      addGoal: (title, category, target, unit, dueDate) => set(s => ({
        goals: [...s.goals, {
          id: uid(), title, category, current: 0, target, unit,
          milestones: [], dueDate, createdAt: today(),
        }],
      })),

      updateGoalProgress: (id, current) => set(s => ({
        goals: s.goals.map(g => {
          if (g.id !== id) return g;
          const pct = g.target > 0 ? (current / g.target) * 100 : 100;
          const milestones = g.milestones.map(m =>
            !m.completedAt && pct >= m.pct ? { ...m, completedAt: today() } : m
          );
          return { ...g, current, milestones };
        }),
      })),

      addMilestone: (goalId, label, pct) => set(s => ({
        goals: s.goals.map(g =>
          g.id !== goalId ? g : { ...g, milestones: [...g.milestones, { id: uid(), label, pct }] }
        ),
      })),

      removeMilestone: (goalId, milestoneId) => set(s => ({
        goals: s.goals.map(g =>
          g.id !== goalId ? g : { ...g, milestones: g.milestones.filter(m => m.id !== milestoneId) }
        ),
      })),

      removeGoal: (id) => set(s => ({ goals: s.goals.filter(g => g.id !== id) })),

      // ── Blockers ──────────────────────────────────────────────────────────

      addActiveBlocker: (description, category, severity) => set(s => ({
        activeBlockers: [...s.activeBlockers, { id: uid(), description, category, severity, addedAt: today() }],
      })),

      resolveBlocker: (id) => set(s => ({
        activeBlockers: s.activeBlockers.map(b => b.id === id ? { ...b, resolvedAt: today() } : b),
      })),

      removeBlocker: (id) => set(s => ({ activeBlockers: s.activeBlockers.filter(b => b.id !== id) })),

      saveBlockerScores: (scores) => set(s => ({
        blockerScores: [
          ...s.blockerScores.filter(bs => bs.date !== today()),
          { ...scores, date: today() },
        ],
      })),

      todayBlockerScores: () => get().blockerScores.find(bs => bs.date === today()) ?? null,
    }),
    { name: 'momentum-v1' },
  )
);
