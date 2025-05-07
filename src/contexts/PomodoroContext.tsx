import { createContext, useContext, useState, useEffect, useRef } from 'react';

type PomodoroState = {
  isRunning: boolean;
  mode: 'focus' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  rounds: number;
  totalRounds: number;
};

type PomodoroSettings = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  rounds: number;
};

type PomodoroContextType = {
  state: PomodoroState;
  settings: PomodoroSettings;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipToNext: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
};

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  rounds: 4,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });
  
  const [state, setState] = useState<PomodoroState>({
    isRunning: false,
    mode: 'focus',
    timeLeft: settings.focusDuration,
    rounds: 0,
    totalRounds: 0,
  });
  
  const timerRef = useRef<number | null>(null);

  // Effect to handle the timer countdown
  useEffect(() => {
    if (state.isRunning) {
      timerRef.current = window.setInterval(() => {
        setState((prevState) => {
          if (prevState.timeLeft <= 1) {
            // Time is up, move to next state
            return handleTimerComplete(prevState);
          }
          return { ...prevState, timeLeft: prevState.timeLeft - 1 };
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRunning]);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  // Handle timer completion and state transitions
  const handleTimerComplete = (prevState: PomodoroState): PomodoroState => {
    const { mode, rounds, totalRounds } = prevState;
    
    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => console.log('Audio playback failed'));
    
    // Handle state transitions
    if (mode === 'focus') {
      const newRounds = rounds + 1;
      const newTotalRounds = totalRounds + 1;
      
      // After completing all focus rounds, take a long break
      if (newRounds >= settings.rounds) {
        return {
          ...prevState,
          mode: 'longBreak',
          timeLeft: settings.longBreakDuration,
          rounds: 0,
          totalRounds: newTotalRounds,
        };
      }
      
      // Otherwise take a short break
      return {
        ...prevState,
        mode: 'shortBreak',
        timeLeft: settings.shortBreakDuration,
        rounds: newRounds,
        totalRounds: newTotalRounds,
      };
    } 
    
    // After any break, go back to focus mode
    return {
      ...prevState,
      mode: 'focus',
      timeLeft: settings.focusDuration,
    };
  };

  const startTimer = () => {
    setState((prev) => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setState((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setState({
      isRunning: false,
      mode: 'focus',
      timeLeft: settings.focusDuration,
      rounds: 0,
      totalRounds: 0,
    });
  };

  const skipToNext = () => {
    setState((prevState) => handleTimerComplete(prevState));
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      
      // If timer is not running, update the current time left based on mode
      if (!state.isRunning) {
        if (state.mode === 'focus') {
          setState((prev) => ({ ...prev, timeLeft: updated.focusDuration }));
        } else if (state.mode === 'shortBreak') {
          setState((prev) => ({ ...prev, timeLeft: updated.shortBreakDuration }));
        } else if (state.mode === 'longBreak') {
          setState((prev) => ({ ...prev, timeLeft: updated.longBreakDuration }));
        }
      }
      
      return updated;
    });
  };

  return (
    <PomodoroContext.Provider
      value={{
        state,
        settings,
        startTimer,
        pauseTimer,
        resetTimer,
        skipToNext,
        updateSettings,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}