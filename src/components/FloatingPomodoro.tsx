import { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, SkipForward, Rotate3D as Rotate } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';

export default function FloatingPomodoro() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { state, startTimer, pauseTimer, resetTimer, skipToNext } = usePomodoro();
  const [position, setPosition] = useState({ x: 'right-4', y: 'bottom-20' });

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color based on mode
  const getModeColor = () => {
    switch (state.mode) {
      case 'focus':
        return 'bg-rose-600 hover:bg-rose-700';
      case 'shortBreak':
        return 'bg-emerald-600 hover:bg-emerald-700';
      case 'longBreak':
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  // Get mode label
  const getModeLabel = () => {
    switch (state.mode) {
      case 'focus':
        return 'Focus';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  return (
    <div className={`fixed ${position.y} ${position.x} z-50`}>
      {isExpanded ? (
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64 transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer size={18} />
              <h3 className="font-medium">Pomodoro Timer</h3>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Timer display */}
          <div className={`text-center py-6 px-4 rounded-lg mb-4 ${
            state.mode === 'focus' 
              ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200' 
              : state.mode === 'shortBreak'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
          }`}>
            <div className="text-3xl font-bold">
              {formatTime(state.timeLeft)}
            </div>
            <div className="text-sm mt-1 opacity-90">
              {getModeLabel()} • Round {state.rounds + 1}/{state.settings.rounds}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex justify-center gap-3">
            {state.isRunning ? (
              <button
                onClick={pauseTimer}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Pause"
              >
                <Pause size={20} />
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Start"
              >
                <Play size={20} />
              </button>
            )}
            
            <button
              onClick={skipToNext}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Skip to next"
            >
              <SkipForward size={20} />
            </button>
            
            <button
              onClick={resetTimer}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Reset"
            >
              <Rotate size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className={`p-3 text-white rounded-full shadow-lg ${getModeColor()} transition-colors`}
          aria-label="Expand Pomodoro timer"
        >
          <Timer size={24} />
          <span className="sr-only">Pomodoro Timer</span>
        </button>
      )}
    </div>
  );
}