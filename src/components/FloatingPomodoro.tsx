import { useState, useRef, useEffect } from "react";
import {
  Timer,
  X,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Settings as SettingsIcon,
} from "lucide-react";
import { usePomodoro } from "../contexts/PomodoroContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

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
    skipToNext,
    updateSettings,
    setState,
  } = usePomodoro();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pomodoroRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);

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

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && pomodoroRef.current) {
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      setPosition({ x, y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) {
    return (
      <button
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
      className="fixed bg-gray-900 dark:bg-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 w-[280px] sm:w-96 z-50 text-white"
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
        <h2 className="text-xl sm:text-2xl font-bold">Pomodoro Flutuante</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      <p className="text-gray-400 mb-4 text-center text-xs sm:text-sm">
        Mantenha o foco e seja produtivo com sessões cronometradas
      </p>

      {/* Mode Tabs */}
      <div className="flex mb-4 sm:mb-6 rounded-xl overflow-hidden bg-gray-800">
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
            className={`flex-1 py-1.5 sm:py-2 text-sm sm:text-base font-medium transition-colors
              ${
                state.mode === m.key
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center bg-gray-800 rounded-2xl py-6 sm:py-8 mb-4">
        <span className="text-4xl sm:text-5xl font-extrabold tracking-widest">
          {formatTime(state.timeLeft)}
        </span>
        <span className="text-gray-400 mt-2 text-sm sm:text-base">
          Rodada {state.rounds + 1}/{settings.rounds}
        </span>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
        <button
          onClick={resetTimer}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 text-lg sm:text-xl"
          aria-label="Reiniciar"
        >
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        {state.isRunning ? (
          <button
            onClick={pauseTimer}
            className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xl sm:text-2xl shadow-lg"
            aria-label="Pausar"
          >
            <Pause className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        ) : (
          <button
            onClick={startTimer}
            className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-700 text-white text-xl sm:text-2xl shadow-lg"
            aria-label="Iniciar"
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        )}
        <button
          onClick={skipToNext}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 text-lg sm:text-xl"
          aria-label="Pular"
        >
          <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center justify-center w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
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
              <label className="block text-xs sm:text-sm font-medium mb-1">
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
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border dark:border-gray-700 rounded-md bg-gray-900 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
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
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border dark:border-gray-700 rounded-md bg-gray-900 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
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
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border dark:border-gray-700 rounded-md bg-gray-900 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
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
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border dark:border-gray-700 rounded-md bg-gray-900 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
