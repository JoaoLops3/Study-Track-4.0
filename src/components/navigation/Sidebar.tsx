import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Settings, 
  Timer, 
  Clock, 
  Github, 
  CheckSquare,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    updateSettings({ compactSidebar: !settings.compactSidebar });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive 
        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-all duration-300 ease-in-out
          flex flex-col ${settings.compactSidebar ? 'w-20' : 'w-64'} md:w-auto
          bg-white dark:bg-gray-800 border-r dark:border-gray-700
        `}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            {!settings.compactSidebar && (
              <h1 className="text-xl font-bold">Study Track</h1>
            )}
          </div>
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-2">
            <NavLink to="/" className={navLinkClass} end>
              <Home size={20} />
              {!settings.compactSidebar && <span>Dashboard</span>}
            </NavLink>
            
            <NavLink to="/pomodoro" className={navLinkClass}>
              <Timer size={20} />
              {!settings.compactSidebar && <span>Pomodoro</span>}
            </NavLink>
            
            <NavLink to="/tasks" className={navLinkClass}>
              <CheckSquare size={20} />
              {!settings.compactSidebar && <span>Tasks</span>}
            </NavLink>
            
            <NavLink to="/calendar" className={navLinkClass}>
              <Calendar size={20} />
              {!settings.compactSidebar && <span>Calendar</span>}
            </NavLink>
            
            <NavLink to="/github" className={navLinkClass}>
              <Github size={20} />
              {!settings.compactSidebar && <span>GitHub</span>}
            </NavLink>
          </div>
        </nav>

        {/* Footer with user and actions */}
        <div className="border-t dark:border-gray-700 p-4">
          <div className="space-y-4">
            {/* User profile */}
            {user && (
              <div className="flex items-center gap-3">
                <img 
                  src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/32'} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full"
                />
                {!settings.compactSidebar && (
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon size={20} className="text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun size={20} className="text-gray-700 dark:text-gray-300" />
                )}
              </button>
              
              <NavLink 
                to="/settings" 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Settings"
              >
                <Settings size={20} className="text-gray-700 dark:text-gray-300" />
              </NavLink>
              
              {!settings.compactSidebar && user && (
                <button 
                  onClick={signOut}
                  className="ml-auto p-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}