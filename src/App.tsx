import { useState } from 'react';
import { useStore } from './store/store';
import { momentumScore, longestStreak, freeTimePct, goalsOnTrack, today } from './lib/utils';
import ScoreRing from './components/ScoreRing';
import MetricCards from './components/MetricCards';
import HabitsTab from './components/tabs/HabitsTab';
import TimeBlocksTab from './components/tabs/TimeBlocksTab';
import GoalsTab from './components/tabs/GoalsTab';
import BlockersTab from './components/tabs/BlockersTab';

type Tab = 'habits' | 'time' | 'goals' | 'blockers';

const TABS: { id: Tab; label: string }[] = [
  { id: 'habits',   label: 'Habits'    },
  { id: 'time',     label: 'Schedule'  },
  { id: 'goals',    label: 'Goals'     },
  { id: 'blockers', label: 'Blockers'  },
];

function TabIcon({ id }: { id: Tab }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (id === 'habits') return (
    <svg {...props}><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" strokeDasharray="2 2"/><path d="M8 3.1A9 9 0 1 0 20.9 16"/></svg>
  );
  if (id === 'time') return (
    <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  );
  if (id === 'goals') return (
    <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  );
  return (
    <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('habits');
  const { habits, timeBlocks, goals, activeBlockers, todayBlockerScores } = useStore();

  const score   = momentumScore(habits, goals, timeBlocks, activeBlockers, todayBlockerScores());
  const streak  = longestStreak(habits);
  const freePct = freeTimePct(timeBlocks, today());
  const onTrack = goalsOnTrack(goals);

  const metrics = [
    { value: streak,                               label: 'Best streak', accent: streak >= 7 ? 'var(--warning)' : undefined },
    { value: `${freePct}%`,                        label: 'Free time' },
    { value: `${onTrack}/${goals.length || 0}`,    label: 'On track' },
  ];

  return (
    <>
      <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
        <ScoreRing score={score} />
        <MetricCards metrics={metrics} />
        <div style={{ height: '.75rem' }} />
      </div>

      {tab === 'habits'   && <HabitsTab />}
      {tab === 'time'     && <TimeBlocksTab />}
      {tab === 'goals'    && <GoalsTab />}
      {tab === 'blockers' && <BlockersTab />}

      <nav className="tab-nav">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            <TabIcon id={t.id} />
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
