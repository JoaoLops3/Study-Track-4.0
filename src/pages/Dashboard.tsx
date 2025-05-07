import { useState, useEffect } from 'react';
import { 
  Clock, 
  BarChart, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Github 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { state: pomodoroState } = usePomodoro();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format the current time
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Format the current date
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  // Mock data for the dashboard cards
  const stats = {
    focusSessions: 12,
    totalFocusTime: '5h 25m',
    completedTasks: 8,
    upcomingTasks: 5,
    weeklyProgress: 68, // percentage
    githubCommits: 7
  };
  
  return (
    <div className="space-y-6">
      {/* Header with greeting and time */}
      <header className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Hello, {user?.user_metadata?.name || 'there'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {formattedDate}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="text-xl font-medium">{formattedTime}</span>
          </div>
        </div>
      </header>
      
      {/* Current pomodoro status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Current Pomodoro Status</h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current mode</p>
                <p className="text-xl font-medium mt-1 capitalize">
                  {pomodoroState.mode === 'focus' ? 'Focus' : 
                   pomodoroState.mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                pomodoroState.mode === 'focus' 
                  ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' 
                  : pomodoroState.mode === 'shortBreak'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                <Clock size={20} />
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed rounds</p>
                <p className="text-xl font-medium mt-1">
                  {pomodoroState.rounds}/{pomodoroState.settings?.rounds ?? 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BarChart size={20} />
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total completed</p>
                <p className="text-xl font-medium mt-1">
                  {pomodoroState.totalRounds} sessions
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Focus sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Focus Sessions</h3>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.focusSessions}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Total: {stats.totalFocusTime} focused
          </p>
        </div>
        
        {/* Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Tasks</h3>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.completedTasks}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {stats.upcomingTasks} tasks remaining
          </p>
        </div>
        
        {/* GitHub activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">GitHub Activity</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300">
              <Github size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.githubCommits}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Commits this week
          </p>
        </div>
        
        {/* Weekly progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Weekly Progress</h3>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
              <BarChart size={18} />
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-medium">{stats.weeklyProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${stats.weeklyProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Upcoming events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Upcoming Events</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
              <CalendarIcon size={18} />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center py-2 border-b dark:border-gray-700">
              <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg mr-3">
                <span className="text-sm font-medium">10:00</span>
              </div>
              <div>
                <p className="font-medium">Team Meeting</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">30 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center py-2">
              <div className="h-10 w-10 flex items-center justify-center bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg mr-3">
                <span className="text-sm font-medium">14:30</span>
              </div>
              <div>
                <p className="font-medium">Project Deadline</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">CS 401 Assignment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}