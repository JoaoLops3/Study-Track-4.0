import React from "react";
import { motion } from "framer-motion";
import { Flower, Sprout, Leaf, Apple, TreePine } from "lucide-react";
import useStore from "../store";
import { achievementLevels } from "../data/achievements";
import { useTheme } from "../contexts/ThemeContext";
import PomodoroAchievementList from "./PomodoroAchievementList";

const ICON_MAP = {
  seed: Flower,
  sprout: Sprout,
  sapling: Leaf,
  tree: TreePine,
  fruit: Apple,
};

const AchievementList: React.FC = () => {
  const { totalMinutesStudied, currentLevel } = useStore();
  const { theme } = useTheme();

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
        Conquistas
      </h3>

      <div className="space-y-4">
        {achievementLevels.map((achievement) => {
          const isUnlocked = totalMinutesStudied >= achievement.requiredMinutes;
          const isCurrent = currentLevel === achievement.level;
          const Icon = ICON_MAP[achievement.treeStage];

          return (
            <motion.div
              key={achievement.level}
              className={`flex items-center gap-4 p-3 rounded-lg border ${
                isCurrent
                  ? theme === "dark"
                    ? "bg-green-900/30 border-green-700"
                    : "bg-green-50 border-green-200"
                  : theme === "dark"
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`p-2 rounded-full ${
                  isUnlocked
                    ? theme === "dark"
                      ? "bg-green-900"
                      : "bg-green-100"
                    : theme === "dark"
                    ? "bg-gray-600"
                    : "bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isUnlocked
                      ? theme === "dark"
                        ? "text-green-400"
                        : "text-green-600"
                      : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-400"
                  }`}
                />
              </div>

              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Nível {achievement.level}: {achievement.name}
                </h4>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {achievement.fruitType} -{" "}
                  {isUnlocked
                    ? "Desbloqueado!"
                    : `Precisa de ${achievement.requiredMinutes} minutos`}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    theme === "dark" ? "text-white-400" : "text-gray-500"
                  }`}
                >
                  {achievement.description}
                </p>
              </div>

              {isCurrent && (
                <motion.div
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    theme === "dark"
                      ? "bg-green-900 text-green-300"
                      : "bg-green-100 text-green-800"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  Atual
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8">
        <PomodoroAchievementList />
      </div>
    </div>
  );
};

export default AchievementList;
 