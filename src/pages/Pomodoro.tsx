import PomodoroTimer from "../components/PomodoroTimer";
import WeeklyProgress from "../components/WeeklyProgress";
import Tree from "../components/Tree";
import { Flower } from "lucide-react";
import AchievementList from "../components/AchievementList";
import { useTheme } from "../contexts/ThemeContext";
import { usePomodoroAchievements } from "../hooks/usePomodoroAchievements";
import PomodoroAchievementList from "../components/PomodoroAchievementList";

export default function Pomodoro() {
  const { theme } = useTheme();
  const { handlePomodoroComplete } = usePomodoroAchievements();

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-colors duration-200 ${
        theme === "dark"
          ? "bg-background-dark text-text-dark"
          : "bg-background-light text-text-light"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h1
          className={`text-3xl font-bold text-center mb-8 ${
            theme === "dark" ? "text-text-dark" : "text-text-light"
          }`}
        >
          Acompanhamento de Estudos
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <PomodoroTimer onComplete={handlePomodoroComplete} />
            <WeeklyProgress />
            <AchievementList />
          </div>
          <div>
            <Tree />
          </div>
        </div>
      </div>
    </div>
  );
}
