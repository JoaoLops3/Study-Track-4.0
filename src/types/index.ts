export type TreeStage = 'seed' | 'sprout' | 'sapling' | 'tree' | 'fruit';

export type FruitType = 'apple' | 'orange' | 'grape' | 'strawberry' | 'watermelon';

export interface AchievementLevel {
  level: number;
  name: string;
  description: string;
  fruitType: FruitType;
  treeStage: TreeStage;
  requiredMinutes: number;
  color: string;
}

export interface WeekDay {
  day: number;
  shortName: string;
  date: string;
  isToday: boolean;
  isCompleted: boolean;
  minutesStudied: number;
}

export interface AppState {
  currentLevel: number;
  totalMinutesStudied: number;
  weeklyProgress: WeekDay[];
  isTimerRunning: boolean;
  timerMinutes: number;
  timerSeconds: number;
  isLoading: boolean;
  error: string | null;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  completeStudySession: (minutes: number) => Promise<void>;
  loadUserData: () => Promise<void>;
  loadProgress: () => Promise<void>;
  updateProgress: (minutes: number) => Promise<void>;
  setTimerDuration: (minutes: number) => void;
  resetProgress: () => Promise<void>;
} 