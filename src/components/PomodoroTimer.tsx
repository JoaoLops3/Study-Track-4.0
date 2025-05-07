import { useEffect, useState } from 'react';
import { Play, Pause, Settings as SettingsIcon, SkipForward, RotateCcw } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';

export default function PomodoroTimer() {
  const { state, settings, startTimer, pauseTimer, resetTimer, skipToNext, updateSettings } = usePomodoro();
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    focusDuration: settings.focusDuration / 60,
    shortBreakDuration: settings.shortBreakDuration / 60,
    longBreakDuration: settings.longBreakDuration / 60,
    rounds: settings.rounds
  });
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update document title with timer
  useEffect(() => {
    document.title = `${formatTime(state.timeLeft)} - ${state.mode} - Study Track`;
    
    return () => {
      document.title = 'Study Track 3.0';
    };
  }, [state.timeLeft, state.mode]);
  
  // Save settings changes
  const saveSettings = () => {
    updateSettings({
      focusDuration: tempSettings.focusDuration * 60,
      shortBreakDuration: tempSettings.shortBreakDuration * 60,
      longBreakDuration: tempSettings.longBreakDuration * 60,
      rounds: tempSettings.rounds
    });
    setShowSettings(false);
  };
  
  return (
    <div className="max-w-md mx-auto">
      {/* Mode selector */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
        <button
          className={`flex-1 py-2 rounded-md text-center transition-colors ${
            state.mode === 'focus'
              ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => {
            if (state.mode !== 'focus') {
              resetTimer();
            }
          }}
        >
          Focus
        </button>
        <button
          className={`flex-1 py-2 rounded-md text-center transition-colors ${
            state.mode === 'shortBreak'
              ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => {
            if (state.mode !== 'shortBreak') {
              pauseTimer();
              updateSettings({});
              setState({ ...state, mode: 'shortBreak', timeLeft: settings.shortBreakDuration });
            }
          }}
        >
          Short Break
        </button>
        <button
          className={`flex-1 py-2 rounded-md text-center transition-colors ${
            state.mode === 'longBreak'
              ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => {
            if (state.mode !== 'longBreak') {
              pauseTimer();
              updateSettings({});
              setState({ ...state, mode: 'longBreak', timeLeft: settings.longBreakDuration });
            }
          }}
        >
          Long Break
        </button>
      </div>
      
      {/* Timer display */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6 text-center">
        <div className="mb-8">
          <h2 className="text-6xl font-bold mb-2 tracking-tight">
            {formatTime(state.timeLeft)}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Round {state.rounds + 1}/{settings.rounds}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Reset timer"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={state.isRunning ? pauseTimer : startTimer}
            className="p-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            aria-label={state.isRunning ? "Pause timer" : "Start timer"}
          >
            {state.isRunning ? <Pause size={32} /> : <Play size={32} />}
          </button>
          
          <button
            onClick={skipToNext}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Skip to next"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>
      
      {/* Settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center justify-center w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <SettingsIcon size={16} className="mr-2" />
        <span>Timer Settings</span>
      </button>
      
      {/* Settings panel */}
      {showSettings && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium mb-4">Timer Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Focus Duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={tempSettings.focusDuration}
                onChange={(e) => setTempSettings({...tempSettings, focusDuration: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={tempSettings.shortBreakDuration}
                onChange={(e) => setTempSettings({...tempSettings, shortBreakDuration: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={tempSettings.longBreakDuration}
                onChange={(e) => setTempSettings({...tempSettings, longBreakDuration: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Number of Rounds</label>
              <input
                type="number"
                min="1"
                max="10"
                value={tempSettings.rounds}
                onChange={(e) => setTempSettings({...tempSettings, rounds: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}