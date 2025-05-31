import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  isBreak: boolean;
  cycles: number;
}

interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
}

interface PomodoroContextType {
  state: PomodoroState;
  settings: PomodoroSettings;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  setTimerTime: (timeInSeconds: number) => void;
  resetToShortBreak: () => void;
}

const initialState: PomodoroState = {
  timeLeft: 25 * 60, // 25 minutos em segundos
  isRunning: false,
  isPaused: false,
  isBreak: false,
  cycles: 0,
};

const defaultSettings: PomodoroSettings = {
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  notifications: true,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined
);

type PomodoroAction =
  | { type: "START_TIMER" }
  | { type: "PAUSE_TIMER" }
  | { type: "RESET_TIMER" }
  | { type: "TICK" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<PomodoroSettings> }
  | { type: "SWITCH_TO_BREAK" }
  | { type: "SWITCH_TO_FOCUS" }
  | { type: "SET_TIME"; payload: number };

function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction
): PomodoroState {
  switch (action.type) {
    case "START_TIMER":
      return { ...state, isRunning: true, isPaused: false };
    case "PAUSE_TIMER":
      return { ...state, isRunning: false, isPaused: true };
    case "RESET_TIMER":
      return {
        ...state,
        timeLeft: state.isBreak
          ? defaultSettings.shortBreakDuration
          : defaultSettings.focusDuration,
        isRunning: false,
        isPaused: false,
      };
    case "SET_TIME":
      return {
        ...state,
        timeLeft: action.payload,
        isRunning: false,
        isPaused: false,
      };
    case "TICK":
      if (state.timeLeft <= 0) {
        return state;
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    case "SWITCH_TO_BREAK":
      return {
        ...state,
        isBreak: true,
        timeLeft: defaultSettings.shortBreakDuration,
        isRunning: false,
        isPaused: false,
      };
    case "SWITCH_TO_FOCUS":
      return {
        ...state,
        isBreak: false,
        timeLeft: defaultSettings.focusDuration,
        isRunning: false,
        isPaused: false,
        cycles: state.cycles + 1,
      };
    default:
      return state;
  }
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(pomodoroReducer, initialState);
  const [settings, setSettings] =
    React.useState<PomodoroSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };

      // Se o foco duration mudou, atualiza o tempo imediatamente
      if (newSettings.focusDuration) {
        dispatch({
          type: "SET_TIME",
          payload: newSettings.focusDuration,
        });
      }

      return updated;
    });
  };

  const handleTimerComplete = useCallback(async () => {
    if (state.isBreak) {
      try {
        // Usa a função RPC para criar/obter a matéria padrão
        const { data: subjectId, error: subjectError } = await supabase.rpc(
          "create_default_subject"
        );

        if (subjectError) {
          console.error("Erro ao obter matéria padrão:", subjectError);
          throw new Error("Erro ao configurar matéria padrão");
        }

        // Salva a sessão de estudo
        const { error } = await supabase.from("study_sessions").insert({
          user_id: user?.id,
          subject_id: subjectId,
          minutes_studied: settings.focusDuration / 60,
          completed_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast.success("Sessão de estudo concluída!");
      } catch (error) {
        console.error("Erro ao salvar sessão:", error);
        toast.error("Erro ao salvar sessão de estudo");
      }
    }

    const isLastCycle = state.cycles + 1 >= settings.longBreakInterval;
    const nextMode = state.isBreak
      ? isLastCycle
        ? "focus"
        : "break"
      : "break";

    if (nextMode === "focus") {
      dispatch({ type: "SWITCH_TO_FOCUS" });
    } else {
      dispatch({ type: "SWITCH_TO_BREAK" });
    }
  }, [
    state.isBreak,
    state.cycles,
    settings.focusDuration,
    settings.longBreakInterval,
    user?.id,
    supabase,
    toast,
    console,
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isRunning) {
      interval = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isRunning, dispatch]);

  useEffect(() => {
    if (state.timeLeft === 0 && state.isRunning) {
      if (settings.notifications) {
        new Notification(
          state.isBreak ? "Hora de voltar aos estudos!" : "Hora de descansar!",
          {
            body: state.isBreak
              ? "Seu tempo de descanso acabou. Vamos voltar aos estudos?"
              : "Parabéns! Você completou um ciclo de foco.",
            icon: "/favicon.ico",
          }
        );
      }

      const audio = new Audio("/notification.mp3");
      audio.play().catch(console.error);

      handleTimerComplete();
    }
  }, [
    state.timeLeft,
    state.isRunning,
    state.isBreak,
    settings.notifications,
    handleTimerComplete,
    console,
  ]);

  useEffect(() => {
    const saveSettings = async () => {
      if (!user) return;

      try {
        const { error } = await supabase.from("pomodoro_settings").upsert(
          {
            user_id: user.id,
            focus_duration: settings.focusDuration,
            short_break_duration: settings.shortBreakDuration,
            long_break_duration: settings.longBreakDuration,
            long_break_interval: settings.longBreakInterval,
            auto_start_breaks: settings.autoStartBreaks,
            auto_start_pomodoros: settings.autoStartPomodoros,
            notifications: settings.notifications,
          },
          { onConflict: "user_id" }
        );

        if (error) {
          console.error("Erro ao salvar configurações:", error);
        } else {
          console.log("Configurações salvas com sucesso!");
        }
      } catch (error) {
        console.error("Erro inesperado ao salvar configurações:", error);
      }
    };

    const handler = setTimeout(() => {
      saveSettings();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [user, settings]);

  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) {
        setSettings(defaultSettings);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("pomodoro_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Erro ao carregar configurações:", error);
        } else if (data) {
          const loadedSettings: PomodoroSettings = {
            focusDuration: data.focus_duration ?? defaultSettings.focusDuration,
            shortBreakDuration:
              data.short_break_duration ?? defaultSettings.shortBreakDuration,
            longBreakDuration:
              data.long_break_duration ?? defaultSettings.longBreakDuration,
            longBreakInterval:
              data.long_break_interval ?? defaultSettings.longBreakInterval,
            autoStartBreaks:
              data.auto_start_breaks ?? defaultSettings.autoStartBreaks,
            autoStartPomodoros:
              data.auto_start_pomodoros ?? defaultSettings.autoStartPomodoros,
            notifications: data.notifications ?? defaultSettings.notifications,
          };
          setSettings(loadedSettings);
          dispatch({
            type: "SET_TIME",
            payload: loadedSettings.focusDuration,
          });
        } else {
          setSettings(defaultSettings);
          dispatch({
            type: "SET_TIME",
            payload: defaultSettings.focusDuration,
          });
        }
      } catch (error) {
        console.error("Erro inesperado ao carregar configurações:", error);
        setSettings(defaultSettings);
        dispatch({
          type: "SET_TIME",
          payload: defaultSettings.focusDuration,
        });
      }
    };

    loadUserSettings();
  }, [user, supabase, setSettings, dispatch, console]);

  const startTimer = () => {
    dispatch({ type: "START_TIMER" });
  };

  const pauseTimer = () => {
    dispatch({ type: "PAUSE_TIMER" });
  };

  const resetTimer = () => {
    dispatch({ type: "RESET_TIMER" });
  };

  const setTimerTime = useCallback(
    (timeInSeconds: number) => {
      dispatch({ type: "SET_TIME", payload: timeInSeconds });
    },
    [dispatch]
  );

  const resetToShortBreak = useCallback(() => {
    setTimerTime(settings.shortBreakDuration);
    dispatch({ type: "SWITCH_TO_BREAK" });
    pauseTimer();
  }, [settings.shortBreakDuration, setTimerTime, dispatch, pauseTimer]);

  const pomodoroContextValue: PomodoroContextType = {
    state,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    updateSettings,
    setTimerTime,
    resetToShortBreak,
  };

  return (
    <PomodoroContext.Provider value={pomodoroContextValue}>
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
