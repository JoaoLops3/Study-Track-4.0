import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

interface PomodoroState {
  mode: "focus" | "shortBreak" | "longBreak";
  timeLeft: number;
  isRunning: boolean;
  rounds: number;
}

interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  rounds: number;
}

interface PomodoroContextType {
  state: PomodoroState;
  settings: PomodoroSettings;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipToNext: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  setState: React.Dispatch<React.SetStateAction<PomodoroState>>;
}

const defaultSettings: PomodoroSettings = {
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  rounds: 4,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined
);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<PomodoroState>(() => {
    const savedState = localStorage.getItem("pomodoroState");
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      mode: "focus",
      timeLeft: defaultSettings.focusDuration,
      isRunning: false,
      rounds: 0,
    };
  });
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const savedSettings = localStorage.getItem("pomodoroSettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return defaultSettings;
  });
  const timerRef = useRef<NodeJS.Timeout>();

  // Salvar estado no localStorage
  useEffect(() => {
    localStorage.setItem("pomodoroState", JSON.stringify(state));
  }, [state]);

  // Salvar configurações no localStorage
  useEffect(() => {
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
  }, [settings]);

  // Carregar configurações do Supabase
  useEffect(() => {
    if (user) {
      const loadSettings = async () => {
        try {
          const { data, error } = await supabase
            .from("pomodoro_settings")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (error) {
            console.error("Erro ao carregar configurações:", error);
            return;
          }

          if (data) {
            const newSettings = {
              focusDuration: data.focus_duration,
              shortBreakDuration: data.short_break_duration,
              longBreakDuration: data.long_break_duration,
              rounds: data.rounds,
            };
            setSettings(newSettings);
            setState((prev) => ({
              ...prev,
              timeLeft: data.focus_duration,
            }));
          }
        } catch (error) {
          console.error("Erro ao carregar configurações:", error);
        }
      };

      loadSettings();
    }
  }, [user]);

  // Salvar configurações no Supabase
  useEffect(() => {
    if (user) {
      const saveSettings = async () => {
        try {
          const { error } = await supabase.from("pomodoro_settings").upsert(
            {
              user_id: user.id,
              focus_duration: settings.focusDuration,
              short_break_duration: settings.shortBreakDuration,
              long_break_duration: settings.longBreakDuration,
              rounds: settings.rounds,
            },
            {
              onConflict: "user_id",
            }
          );

          if (error) {
            console.error("Erro ao salvar configurações:", error);
            toast.error("Erro ao salvar configurações do Pomodoro");
          }
        } catch (error) {
          console.error("Erro ao salvar configurações:", error);
          toast.error("Erro ao salvar configurações do Pomodoro");
        }
      };

      saveSettings();
    }
  }, [user, settings]);

  // Timer logic
  useEffect(() => {
    if (state.isRunning) {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 0) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return prev;
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRunning]);

  const handleTimerComplete = () => {
    // Play notification sound
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => console.log("Erro ao tocar áudio"));

    if (state.mode === "focus") {
      if (state.rounds + 1 >= settings.rounds) {
        // Completed all rounds, take a long break
        setState({
          mode: "longBreak",
          timeLeft: settings.longBreakDuration,
          isRunning: false,
          rounds: 0,
        });
      } else {
        // Take a short break
        setState({
          mode: "shortBreak",
          timeLeft: settings.shortBreakDuration,
          isRunning: false,
          rounds: state.rounds + 1,
        });
      }
    } else {
      // Break is over, start next focus session
      setState({
        mode: "focus",
        timeLeft: settings.focusDuration,
        isRunning: false,
        rounds: state.rounds,
      });
    }
  };

  const startTimer = () => {
    setState((prev) => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setState((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setState((prev) => ({
      ...prev,
      timeLeft:
        prev.mode === "focus"
          ? settings.focusDuration
          : prev.mode === "shortBreak"
          ? settings.shortBreakDuration
          : settings.longBreakDuration,
      isRunning: false,
    }));
  };

  const skipToNext = () => {
    if (state.mode === "focus") {
      if (state.rounds + 1 >= settings.rounds) {
        setState({
          mode: "longBreak",
          timeLeft: settings.longBreakDuration,
          isRunning: false,
          rounds: 0,
        });
      } else {
        setState({
          mode: "shortBreak",
          timeLeft: settings.shortBreakDuration,
          isRunning: false,
          rounds: state.rounds + 1,
        });
      }
    } else {
      setState({
        mode: "focus",
        timeLeft: settings.focusDuration,
        isRunning: false,
        rounds: state.rounds,
      });
    }
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      setState((state) => ({
        ...state,
        timeLeft:
          state.mode === "focus"
            ? updated.focusDuration
            : state.mode === "shortBreak"
            ? updated.shortBreakDuration
            : updated.longBreakDuration,
      }));
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
        setState,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
}
