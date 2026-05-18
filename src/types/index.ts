export interface Habit {
  id: string;
  name: string;
  color: string;
  completions: string[];   // ISO date strings 'YYYY-MM-DD'
  createdAt: string;
  archived: boolean;
}

export type BlockType = 'work' | 'goal' | 'rest' | 'free';

export interface TimeBlock {
  id: string;
  date: string;            // 'YYYY-MM-DD'
  startTime: string;       // 'HH:MM'
  endTime: string;         // 'HH:MM'
  type: BlockType;
  label: string;
}

export interface Milestone {
  id: string;
  label: string;
  pct: number;             // 0-100, threshold % at which milestone fires
  completedAt?: string;
}

export type GoalCategory = 'personal' | 'professional';

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  current: number;
  target: number;
  unit: string;
  milestones: Milestone[];
  dueDate?: string;        // 'YYYY-MM-DD'
  createdAt: string;
}

export type BlockerSeverity = 1 | 2 | 3 | 4 | 5;

export interface ActiveBlocker {
  id: string;
  description: string;
  category: string;
  severity: BlockerSeverity;
  addedAt: string;
  resolvedAt?: string;
}

export interface BlockerScores {
  date: string;
  focus: number;
  energy: number;
  motivation: number;
  clarity: number;
}
