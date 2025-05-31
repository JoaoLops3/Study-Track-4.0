import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useStore from "../store";
import { useTheme } from "../contexts/ThemeContext";
import { Loader2 } from "lucide-react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function WeeklyProgress() {
  const { weeklyProgress, loadProgress } = useStore();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadProgress();
      } catch (err) {
        console.error("Erro ao carregar progresso:", err);
        setError("Erro ao carregar o progresso semanal");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [loadProgress]);

  if (isLoading) {
    return (
      <div
        className={`w-full rounded-xl shadow-sm p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`w-full rounded-xl shadow-sm p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-center h-32">
          <p
            className={`text-red-500 ${
              theme === "dark" ? "text-red-400" : "text-red-600"
            }`}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

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
        Progresso Semanal
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day, index) => {
          const progress = weeklyProgress[index];
          const percentage =
            progress.minutesStudied > 0
              ? Math.min((progress.minutesStudied / 120) * 100, 100)
              : 0;

          return (
            <motion.div
              key={day}
              className={`flex flex-col items-center p-2 rounded-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {day}
              </span>
              <div
                className={`mt-2 w-full rounded-full h-2 ${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                }`}
              >
                <motion.div
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                    theme === "dark" ? "bg-green-500" : "bg-green-500"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <span
                className={`text-xs mt-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {progress.minutesStudied}m
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
