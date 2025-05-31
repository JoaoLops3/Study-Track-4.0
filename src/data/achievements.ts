import { AchievementLevel } from '../types';

export const achievementLevels: AchievementLevel[] = [
  {
    level: 1,
    name: 'Semente do Conhecimento',
    description: 'Começou sua jornada de estudos',
    fruitType: 'apple',
    treeStage: 'seed',
    requiredMinutes: 0,
    color: '#4CAF50'
  },
  {
    level: 2,
    name: 'Broto do Saber',
    description: 'Seu conhecimento está crescendo',
    fruitType: 'orange',
    treeStage: 'sprout',
    requiredMinutes: 120,
    color: '#8BC34A'
  },
  {
    level: 3,
    name: 'Muda da Sabedoria',
    description: 'Seus estudos estão florescendo',
    fruitType: 'grape',
    treeStage: 'sapling',
    requiredMinutes: 360,
    color: '#FFC107'
  },
  {
    level: 4,
    name: 'Árvore do Conhecimento',
    description: 'Seu conhecimento está frutificando',
    fruitType: 'strawberry',
    treeStage: 'tree',
    requiredMinutes: 720,
    color: '#FF9800'
  },
  {
    level: 5,
    name: 'Estudante Iluminado',
    description: 'Você alcançou a maestria nos estudos',
    fruitType: 'watermelon',
    treeStage: 'fruit',
    requiredMinutes: 1440,
    color: '#F44336'
  }
];

export const getCurrentLevel = (minutes: number): number => {
  for (let i = achievementLevels.length - 1; i >= 0; i--) {
    if (minutes >= achievementLevels[i].requiredMinutes) {
      return achievementLevels[i].level;
    }
  }
  return 1;
};

export const getProgressToNextLevel = (minutes: number): number => {
  const currentLevel = getCurrentLevel(minutes);
  const currentLevelData = achievementLevels.find(level => level.level === currentLevel);
  const nextLevelData = achievementLevels.find(level => level.level === currentLevel + 1);

  if (!currentLevelData || !nextLevelData) {
    return 100;
  }

  const currentLevelMinutes = currentLevelData.requiredMinutes;
  const nextLevelMinutes = nextLevelData.requiredMinutes;
  const progress = ((minutes - currentLevelMinutes) / (nextLevelMinutes - currentLevelMinutes)) * 100;

  return Math.min(Math.max(progress, 0), 100);
}; 