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
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);
  const initialTimeRef = useRef<number>(0);

  // Primeiro inicializamos as configurações
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const savedSettings = localStorage.getItem("pomodoroSettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return defaultSettings;
  });

  // Função para obter o tempo correto baseado no modo
  const getTimeForMode = (mode: "focus" | "shortBreak" | "longBreak") => {
    return mode === "focus"
      ? settings.focusDuration
      : mode === "shortBreak"
      ? settings.shortBreakDuration
      : settings.longBreakDuration;
  };

  // Depois inicializamos o estado usando as configurações já definidas
  const [state, setState] = useState<PomodoroState>(() => {
    const savedState = localStorage.getItem("pomodoroState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return {
        ...parsedState,
        timeLeft: getTimeForMode(parsedState.mode),
        isRunning: false, // Sempre começa parado ao recarregar
      };
    }
    return {
      mode: "focus",
      timeLeft: getTimeForMode("focus"),
      isRunning: false,
      rounds: 0,
    };
  });

  // Atualizar o tempo quando o modo mudar
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      timeLeft: getTimeForMode(prev.mode),
    }));
  }, [settings]);

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
              timeLeft:
                prev.mode === "focus"
                  ? data.focus_duration
                  : prev.mode === "shortBreak"
                  ? data.short_break_duration
                  : data.long_break_duration,
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
      startTimeRef.current = Date.now();
      initialTimeRef.current = state.timeLeft;

      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        const newTimeLeft = Math.max(
          0,
          initialTimeRef.current - elapsedSeconds
        );

        setState((prev) => {
          if (newTimeLeft <= 0) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return prev;
          }
          return {
            ...prev,
            timeLeft: newTimeLeft,
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

  // Atualizar o timer quando a aba voltar a ter foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (state.isRunning) {
          const elapsedSeconds = Math.floor(
            (Date.now() - startTimeRef.current) / 1000
          );
          const newTimeLeft = Math.max(
            0,
            initialTimeRef.current - elapsedSeconds
          );

          setState((prev) => ({
            ...prev,
            timeLeft: newTimeLeft,
          }));
        } else {
          // Se não estiver rodando, mantém o tempo atual
          setState((prev) => ({
            ...prev,
            timeLeft: prev.timeLeft,
          }));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isRunning]);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    initialTimeRef.current = state.timeLeft;
    setState((prev) => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setState((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setState((prev) => ({
      ...prev,
      timeLeft: getTimeForMode(prev.mode),
      isRunning: false,
    }));
  };

  const skipToNext = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setState((prev) => {
      const isLastRound = prev.rounds + 1 >= settings.rounds;
      const nextMode =
        prev.mode === "focus"
          ? isLastRound
            ? "longBreak"
            : "shortBreak"
          : "focus";

      return {
        mode: nextMode,
        timeLeft: getTimeForMode(nextMode),
        isRunning: false,
        rounds:
          nextMode === "focus"
            ? (prev.rounds + 1) % settings.rounds
            : prev.rounds,
      };
    });
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      setState((state) => ({
        ...state,
        timeLeft: getTimeForMode(state.mode),
      }));
      return updated;
    });
  };

  const handleTimerComplete = () => {
    const audio = new Audio("/notification.mp3");
    audio.play();

    setState((prev) => {
      const isLastRound = prev.rounds + 1 >= settings.rounds;
      const nextMode =
        prev.mode === "focus"
          ? isLastRound
            ? "longBreak"
            : "shortBreak"
          : "focus";

      toast.success(
        nextMode === "focus"
          ? "Hora de focar!"
          : nextMode === "shortBreak"
          ? "Hora de uma pausa curta!"
          : "Hora de uma pausa longa!"
      );

      return {
        mode: nextMode,
        timeLeft: getTimeForMode(nextMode),
        isRunning: false,
        rounds:
          nextMode === "focus"
            ? (prev.rounds + 1) % settings.rounds
            : prev.rounds,
      };
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
