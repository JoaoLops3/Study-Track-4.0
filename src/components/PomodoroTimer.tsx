import { useEffect } from "react";
import { usePomodoro } from "../contexts/PomodoroContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings as SettingsIcon,
} from "lucide-react";

const MODES = [
  { key: "focus", label: "Foco", duration: 25 * 60 },
  { key: "shortBreak", label: "Pausa Curta", duration: 5 * 60 },
  { key: "longBreak", label: "Pausa Longa", duration: 15 * 60 },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PomodoroTimer() {
  const { user } = useAuth();
  const {
    state,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNext,
    updateSettings,
    setState,
  } = usePomodoro();

  // Salvar sessão quando completar um foco
  useEffect(() => {
    if (state.timeLeft === 0 && state.mode === "focus" && state.isRunning) {
      saveSession();
    }
  }, [state.timeLeft, state.mode, state.isRunning]);

  const saveSession = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from("pomodoro_sessions").insert({
        user_id: user.id,
        mode: state.mode,
        duration: settings.focusDuration,
        completed: true,
      });

      if (error) {
        console.error("Erro ao salvar sessão:", error);
        toast.error("Erro ao salvar sessão do Pomodoro");
        return;
      }

      toast.success("Sessão do Pomodoro salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
      toast.error("Erro ao salvar sessão do Pomodoro");
    }
  };

  // Atualizar título da página
  useEffect(() => {
    const modeLabel = MODES.find((m) => m.key === state.mode)?.label || "";
    document.title = `${formatTime(
      state.timeLeft
    )} - ${modeLabel} | Study Track`;
  }, [state.timeLeft, state.mode]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        {/* Mode Tabs */}
        <div className="flex mb-8 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setState((prev) => ({
                  ...prev,
                  mode: m.key as "focus" | "shortBreak" | "longBreak",
                  timeLeft:
                    m.key === "focus"
                      ? settings.focusDuration
                      : m.key === "shortBreak"
                      ? settings.shortBreakDuration
                      : settings.longBreakDuration,
                  isRunning: false,
                }));
              }}
              className={`flex-1 py-3 text-base font-medium transition-colors
                ${
                  state.mode === m.key
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-2xl py-12 mb-8">
          <span className="text-7xl font-extrabold tracking-widest text-gray-900 dark:text-white">
            {formatTime(state.timeLeft)}
          </span>
          <span className="text-gray-500 dark:text-gray-400 mt-4">
            Rodada {state.rounds + 1}/{settings.rounds}
          </span>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-8 mb-8">
          <button
            onClick={resetTimer}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xl"
            aria-label="Reset"
          >
            <RotateCcw className="w-7 h-7" />
          </button>
          {state.isRunning ? (
            <button
              onClick={pauseTimer}
              className="w-20 h-20 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-3xl shadow-lg"
              aria-label="Pause"
            >
              <Pause className="w-10 h-10" />
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="w-20 h-20 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-3xl shadow-lg"
              aria-label="Start"
            >
              <Play className="w-10 h-10" />
            </button>
          )}
          <button
            onClick={skipToNext}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xl"
            aria-label="Skip"
          >
            <SkipForward className="w-7 h-7" />
          </button>
        </div>

        {/* Settings */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            Configurações do Timer
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Duração do Foco (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.focusDuration / 60}
                onChange={(e) =>
                  updateSettings({
                    focusDuration: parseInt(e.target.value) * 60,
                  })
                }
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Pausa Curta (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration / 60}
                onChange={(e) =>
                  updateSettings({
                    shortBreakDuration: parseInt(e.target.value) * 60,
                  })
                }
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Pausa Longa (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration / 60}
                onChange={(e) =>
                  updateSettings({
                    longBreakDuration: parseInt(e.target.value) * 60,
                  })
                }
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Número de Rodadas
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.rounds}
                onChange={(e) =>
                  updateSettings({
                    rounds: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
