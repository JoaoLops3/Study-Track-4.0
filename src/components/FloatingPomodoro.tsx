import {
  Pause,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  SkipForward,
  Timer,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { usePomodoro } from "../contexts/PomodoroContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";

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

export default function FloatingPomodoro() {
  const { user } = useAuth();
  const {
    state,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    updateSettings,
  } = usePomodoro();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pomodoroRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { theme } = useTheme();

  // Salvar sessão quando completar um foco
  const saveSession = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        minutes_studied: settings.focusDuration / 60,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Erro ao salvar sessão:", error);
        toast.error("Erro ao salvar sessão de estudo");
        return;
      }

      toast.success("Sessão de estudo salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
      toast.error("Erro ao salvar sessão de estudo");
    }
  }, [user, settings.focusDuration]);

  useEffect(() => {
    if (state.timeLeft === 0 && state.isRunning && !state.isBreak) {
      saveSession();
    }
  }, [state.timeLeft, state.isRunning, state.isBreak, saveSession]);

  // Drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (pomodoroRef.current) {
      const rect = pomodoroRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && pomodoroRef.current) {
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        setPosition({ x, y });
      }
    },
    [isDragging, dragOffset]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 p-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg transition-colors z-50"
        aria-label="Expandir Pomodoro"
      >
        <Timer className="w-6 h-6" />
        <span className="sr-only">Pomodoro</span>
      </button>
    );
  }

  return (
    <div
      ref={pomodoroRef}
      className={`fixed rounded-2xl shadow-2xl p-4 sm:p-6 w-[280px] sm:w-96 z-50 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-2 cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <h2
          className={`text-xl sm:text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Pomodoro Flutuante
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={` ${
            theme === "dark"
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      <p
        className={`mb-4 text-center text-xs sm:text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Mantenha o foco e seja produtivo com sessões cronometradas
      </p>

      {/* Mode Tabs */}
      <div
        className={`flex mb-4 sm:mb-6 rounded-xl overflow-hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              // Update settings based on mode, will trigger state update in context
              if (m.key === "focus") {
                updateSettings({
                  focusDuration: settings.focusDuration,
                  shortBreakDuration: settings.shortBreakDuration,
                  longBreakDuration: settings.longBreakDuration,
                });
              } else if (m.key === "shortBreak") {
                updateSettings({
                  focusDuration: settings.shortBreakDuration,
                  shortBreakDuration: settings.shortBreakDuration,
                  longBreakDuration: settings.longBreakDuration,
                });
              } else if (m.key === "longBreak") {
                updateSettings({
                  focusDuration: settings.longBreakDuration,
                  shortBreakDuration: settings.shortBreakDuration,
                  longBreakDuration: settings.longBreakDuration,
                });
              }
            }}
            className={`flex-1 py-1.5 sm:py-2 text-sm sm:text-base font-medium transition-colors
              ${
                // Determine active mode based on current time left and settings
                (state.timeLeft === settings.focusDuration &&
                  !state.isBreak &&
                  m.key === "focus") ||
                (state.timeLeft === settings.shortBreakDuration &&
                  state.isBreak &&
                  m.key === "shortBreak") ||
                (state.timeLeft === settings.longBreakDuration &&
                  state.isBreak &&
                  m.key === "longBreak")
                  ? `${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-300 text-gray-900"
                    }`
                  : `${
                      theme === "dark"
                        ? "text-gray-400 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-300"
                    }`
              }`}
            aria-label={`Alternar para o modo ${m.label}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div
        className={`flex flex-col items-center rounded-2xl py-6 sm:py-8 mb-4 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <span
          className={`text-4xl sm:text-5xl font-extrabold tracking-widest ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          {formatTime(state.timeLeft)}
        </span>
        <span
          className={`mt-2 text-sm sm:text-base ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Rodada {state.cycles + 1}/{settings.longBreakInterval}
        </span>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
        <button
          type="button"
          onClick={resetTimer}
          className={`p-3 rounded-full transition-colors text-lg sm:text-xl ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
          aria-label="Reiniciar"
        >
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        {state.isRunning ? (
          <button
            type="button"
            onClick={pauseTimer}
            className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xl sm:text-2xl shadow-lg"
            aria-label="Pausar"
          >
            <Pause className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startTimer}
            className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xl sm:text-2xl shadow-lg"
            aria-label="Iniciar"
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            // Logic to skip to the next mode
            if (!state.isBreak) {
              // Currently in focus, switch to short or long break
              const isLastCycle =
                state.cycles + 1 >= settings.longBreakInterval;
              updateSettings({
                // This will trigger the context to switch modes
              });
            } else {
              // Currently in break, switch to focus
              updateSettings({
                // This will trigger the context to switch modes
              });
            }
          }}
          className={`p-3 rounded-full transition-colors text-lg sm:text-xl ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
          aria-label="Pular para o próximo modo"
        >
          <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Settings button */}
      <button
        type="button"
        onClick={() => setShowSettings(!showSettings)}
        className={`flex items-center justify-center w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base ${
          theme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
        aria-label="Alternar configurações"
      >
        <SettingsIcon size={14} className="mr-2 sm:mr-2" />
        <span>Configurações do Timer</span>
      </button>

      {/* Settings panel */}
      {showSettings && (
        <div className="mt-4 sm:mt-6 bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
            Configurações do Timer
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label
                htmlFor="focus-duration"
                className="block text-xs sm:text-sm font-medium mb-1"
              >
                Duração do Foco (minutos)
              </label>
              <input
                id="focus-duration"
                type="number"
                min="1"
                max="60"
                value={settings.focusDuration / 60}
                onChange={(e) =>
                  updateSettings({
                    focusDuration: Number.parseInt(e.target.value) * 60,
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border dark:border-gray-700 rounded-md bg-gray-900 text-sm sm:text-base"
              />
            </div>

            <div>
              <label
                htmlFor="short-break-duration"
                className="block text-xs sm:text-sm font-medium mb-1"
              >
                Pausa Curta (minutos)
              </label>
              <input
                id="short-break-duration"
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakDuration / 60}
                onChange={(e) =>
                  updateSettings({
                    shortBreakDuration: Number.parseInt(e.target.value) * 60,
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border dark:border-gray-700 rounded-md bg-gray-900 text-sm sm:text-base"
              />
            </div>

            <div>
              <label
                htmlFor="long-break-duration"
                className="block text-xs sm:text-sm font-medium mb-1"
              >
                Pausa Longa (minutos)
              </label>
              <input
                id="long-break-duration"
                type="number"
                min="1"
                max="60"
                value={settings.longBreakDuration / 60}
                onChange={(e) =>
                  updateSettings({
                    longBreakDuration: Number.parseInt(e.target.value) * 60,
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border dark:border-gray-700 rounded-md bg-gray-900 text-sm sm:text-base"
              />
            </div>

            <div>
              <label
                htmlFor="long-break-interval"
                className="block text-xs sm:text-sm font-medium mb-1"
              >
                Número de Rodadas antes da Pausa Longa
              </label>
              <input
                id="long-break-interval"
                type="number"
                min="1"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) =>
                  updateSettings({
                    longBreakInterval: Number.parseInt(e.target.value),
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border dark:border-gray-700 rounded-md bg-gray-900 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
