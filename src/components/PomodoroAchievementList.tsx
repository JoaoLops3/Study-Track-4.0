import React from "react";
import { usePomodoroAchievements } from "../hooks/usePomodoroAchievements";
import {
  pomodoroAchievements,
  PomodoroAchievement,
} from "../data/pomodoroAchievements";
import { useTheme } from "../contexts/ThemeContext"; 
import { CircleCheck, Lock } from "lucide-react"; 
import Tooltip from "./Tooltip"; 
import PomodoroAchievementIcon from "./PomodoroAchievementIcon";

interface UserPomodoroAchievementProgress {
  achievement: PomodoroAchievement;
  userProgress?: {
    progress: number;
    unlocked: boolean;
    unlocked_at?: string;
  };
}

export default function PomodoroAchievementList() {
  const { userAchievements, isLoading } = usePomodoroAchievements();
  const { theme } = useTheme(); // Usar o tema para estilização

  // Combinar definições de conquistas com progresso do usuário
  const achievementsWithProgress: UserPomodoroAchievementProgress[] =
    pomodoroAchievements.map((pa) => {
      const userProgress = userAchievements.find(
        (ua) => ua.achievement_id === pa.id
      );
      return {
        achievement: pa,
        userProgress: userProgress
          ? {
              progress: userProgress.progress,
              unlocked: userProgress.unlocked,
              unlocked_at: userProgress.unlocked_at,
            }
          : { progress: 0, unlocked: false }, // Progresso padrão se não encontrado
      };
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <div className="flex flex-col items-center">
        <h3
          className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }
          }`}
        >
          Conquistas de Pomodoro
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {achievementsWithProgress.map(({ achievement, userProgress }) => {
            return (
              <Tooltip
                key={achievement.id}
                content={achievement.name + ": " + achievement.description}
              >
                <PomodoroAchievementIcon
                  iconName={achievement.icon}
                  isUnlocked={userProgress?.unlocked || false}
                />
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
