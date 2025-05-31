import React from "react";
import { motion } from "framer-motion";
import { Flower, Sprout, TreeDeciduous, Apple, Leaf } from "lucide-react";
import { TreeStage } from "../types";
import useStore from "../store";
import {
  achievementLevels,
  getProgressToNextLevel,
} from "../data/achievements";

const treeIcons = {
  seed: Flower,
  sprout: Sprout,
  sapling: Leaf,
  tree: TreeDeciduous,
  fruit: Apple,
};

const Tree: React.FC = () => {
  const { totalMinutesStudied, currentLevel } = useStore();

  const currentAchievement = achievementLevels[currentLevel - 1];
  const treeStage = currentAchievement.treeStage;
  const IconComponent = treeIcons[treeStage];
  const progress = getProgressToNextLevel(totalMinutesStudied);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <motion.div
          className="p-16 rounded-full bg-gradient-to-b from-emerald-50 to-emerald-100 shadow-inner flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: 1,
            opacity: 1,
            backgroundColor: currentAchievement.color,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -5 }}
            animate={{
              scale: [0.9, 1, 0.95, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <IconComponent
              size={120}
              color={currentAchievement.color}
              strokeWidth={1.5}
            />
          </motion.div>
        </motion.div>

        {/* Growth progress indicator */}
        <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: currentAchievement.color,
            }}
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-2xl font-semibold text-gray-800">
          {currentAchievement.name}
        </h3>
        <p className="text-gray-600 mt-2">{currentAchievement.description}</p>
        <p className="mt-3 text-sm font-medium text-gray-500">
          {progress < 100
            ? `${progress}% para o próximo nível`
            : "Nível máximo alcançado!"}
        </p>
      </div>
    </div>
  );
};

export default Tree;
 