import React from "react";
import { motion } from "framer-motion";
import { Flower, Sprout, Leaf, Tree, Apple } from "lucide-react";
import { useStore } from "../store";
import { achievementLevels } from "../data/achievements";

const ICON_MAP = {
  seed: Flower,
  sprout: Sprout,
  small: Leaf,
  large: Tree,
  fruit: Apple,
};

export default function Achievements() {
  const { totalMinutesStudied, currentLevel } = useStore();

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Conquistas</h3>

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
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`p-2 rounded-full ${
                  isUnlocked ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isUnlocked ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </div>

              <div className="flex-1">
                <h4 className="font-medium text-gray-800">
                  Nível {achievement.level}: {achievement.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {achievement.fruitType} -{" "}
                  {isUnlocked
                    ? "Desbloqueado!"
                    : `Precisa de ${achievement.requiredMinutes} minutos`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.description}
                </p>
              </div>

              {isCurrent && (
                <motion.div
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
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
    </div>
  );
}
