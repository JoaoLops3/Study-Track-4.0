import { motion } from "framer-motion";
import { Clock, Pause, Play, RotateCcw } from "lucide-react";
import React, { useCallback } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { usePomodoro } from "../contexts/PomodoroContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";
import useStore from "../store";

interface QuickTime {
  label: string;
  duration: number;
}

interface QuickAction {
  label: string;
  minutes: number;
}

const QUICK_TIMES: QuickTime[] = [
  { label: "5m", duration: 5 * 60 },
  { label: "15m", duration: 15 * 60 },
  { label: "25m", duration: 25 * 60 },
  { label: "45m", duration: 45 * 60 },
  { label: "60m", duration: 60 * 60 },
];

const QUICK_ACTIONS: QuickAction[] = [
  { label: "+60m", minutes: 60 },
  { label: "+180m", minutes: 180 },
  { label: "+420m", minutes: 420 },
  { label: "+840m", minutes: 840 },
];

export default function PomodoroTimer() {
  const { user } = useAuth();
  const {
    state,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    updateSettings,
    setTimerTime,
    resetToShortBreak,
  } = usePomodoro();

  const { completeStudySession, resetProgress, loadProgress } = useStore();
  const { theme } = useTheme();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleQuickTime = useCallback(
    (duration: number) => {
      if (state.isRunning) {
        pauseTimer();
      }
      updateSettings({ focusDuration: duration });
      resetTimer();
    },
    [state.isRunning, pauseTimer, updateSettings, resetTimer]
  );

  const handleCompleteSession = async (minutes: number): Promise<void> => {
    if (!user) {
      toast.error("Você precisa estar logado para registrar sessões de estudo");
      return;
    }

    try {
      const { data: subjectId, error: subjectError } = await supabase.rpc(
        "create_default_subject"
      );

      if (subjectError) {
        console.error("Erro ao obter matéria padrão:", subjectError);
        throw new Error("Erro ao configurar matéria padrão");
      }

      const { error } = await supabase.from("study_sessions").insert({
        user_id: user.id,
        subject_id: subjectId,
        minutes_studied: minutes,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      await completeStudySession(minutes);
      await loadProgress();

      toast.success(`${minutes} minutos adicionados com sucesso!`);
    } catch (error) {
      console.error("Erro ao adicionar tempo:", error);
      toast.error("Erro ao adicionar tempo");
    }
  };

  const handleQuickAction = async (minutes: number): Promise<void> => {
    await handleCompleteSession(minutes);
  };

  const handleResetProgress = async (): Promise<void> => {
    if (!user) {
      toast.error("Você precisa estar logado para resetar o progresso");
      return;
    }

    if (
      window.confirm(
        "Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita."
      )
    ) {
      await resetProgress();
      await loadProgress();
    }
  };

  return (
    <div
      className={`w-full rounded-xl shadow-sm p-6 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3
        className={`text-xl font-semibold mb-4 ${
          theme === "dark" ? "text-gray-200" : "text-gray-800"
        }`}
      >
        Timer de Foco
      </h3>
      <div className="flex flex-col items-center">
        <motion.div
          className={`text-5xl font-mono font-bold mb-6 ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
          animate={{ scale: state.isRunning ? [1, 1.03, 1] : 1 }}
          transition={{
            repeat: state.isRunning ? Number.POSITIVE_INFINITY : 0,
            duration: 2,
          }}
        >
          {formatTime(state.timeLeft)}
        </motion.div>
        <div className="flex space-x-4 mb-6">
          <button
            type="button"
            onClick={state.isRunning ? pauseTimer : startTimer}
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors"
          >
            {state.isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          <button
            type="button"
            onClick={resetToShortBreak}
            className={`p-3 rounded-full transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {QUICK_TIMES.map((time) => (
            <button
              key={time.label}
              type="button"
              onClick={() => handleQuickTime(time.duration)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                state.timeLeft === time.duration &&
                (state.isPaused || !state.isBreak)
                  ? ""
                  : theme === "dark"
                  ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {time.label}
            </button>
          ))}
        </div>
        <div
          className={`w-full pt-4 border-t ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex flex-col gap-2">
            <div
              className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Ações Rápidas para Desenvolvedores
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action.minutes)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    theme === "dark"
                      ? "bg-blue-900 text-blue-300 hover:bg-blue-800"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetProgress}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  theme === "dark"
                    ? "bg-red-900 text-red-300 hover:bg-red-800"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
