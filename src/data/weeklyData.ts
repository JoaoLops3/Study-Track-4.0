import { WeekDay } from '../types';

const getDayOfWeek = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { weekday: 'short' });
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateWeeklyData = (): WeekDay[] => {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);

  const weekDays: WeekDay[] = [];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    
    weekDays.push({
      day: i,
      shortName: dayNames[i],
      date: currentDate.toISOString().split('T')[0],
      isToday: currentDate.toDateString() === today.toDateString(),
      isCompleted: false,
      minutesStudied: 0
    });
  }

  return weekDays;
}; 