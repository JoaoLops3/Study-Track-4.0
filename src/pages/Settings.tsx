import { useState } from 'react';
import { Bell, Eye, Calculator, Timer, Moon, Sun } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('appearance');
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your Study Track experience
        </p>
      </header>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'appearance'
                ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'widgets'
                ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('widgets')}
          >
            Widgets
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium mb-4">Appearance Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Sun size={18} className="mr-2 text-amber-500" />
                      <Moon size={18} className="mr-2 text-indigo-600 dark:text-indigo-400" />
                      <span>Theme Mode</span>
                    </span>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        name="theme"
                        id="theme"
                        className="sr-only"
                        checked={theme === 'dark'}
                        onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      />
                      <div className="block h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div
                        className={`absolute left-0 top-0 h-6 w-6 rounded-full transition-transform transform ${
                          theme === 'dark' ? 'translate-x-6 bg-indigo-600' : 'bg-white dark:bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Eye size={18} className="mr-2 text-gray-600 dark:text-gray-400" />
                      <span>Compact Sidebar</span>
                    </span>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        name="compactSidebar"
                        id="compactSidebar"
                        className="sr-only"
                        checked={settings.compactSidebar}
                        onChange={() => updateSettings({ compactSidebar: !settings.compactSidebar })}
                      />
                      <div className="block h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div
                        className={`absolute left-0 top-0 h-6 w-6 rounded-full transition-transform transform ${
                          settings.compactSidebar ? 'translate-x-6 bg-indigo-600' : 'bg-white dark:bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'widgets' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium mb-4">Widget Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Timer size={18} className="mr-2 text-rose-600 dark:text-rose-400" />
                      <span>Show Floating Pomodoro</span>
                    </span>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        name="showFloatingPomodoro"
                        id="showFloatingPomodoro"
                        className="sr-only"
                        checked={settings.showFloatingPomodoro}
                        onChange={() => updateSettings({ showFloatingPomodoro: !settings.showFloatingPomodoro })}
                      />
                      <div className="block h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div
                        className={`absolute left-0 top-0 h-6 w-6 rounded-full transition-transform transform ${
                          settings.showFloatingPomodoro ? 'translate-x-6 bg-indigo-600' : 'bg-white dark:bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Calculator size={18} className="mr-2 text-teal-600 dark:text-teal-400" />
                      <span>Show Floating Calculator</span>
                    </span>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        name="showFloatingCalculator"
                        id="showFloatingCalculator"
                        className="sr-only"
                        checked={settings.showFloatingCalculator}
                        onChange={() => updateSettings({ showFloatingCalculator: !settings.showFloatingCalculator })}
                      />
                      <div className="block h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div
                        className={`absolute left-0 top-0 h-6 w-6 rounded-full transition-transform transform ${
                          settings.showFloatingCalculator ? 'translate-x-6 bg-indigo-600' : 'bg-white dark:bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium mb-4">Notification Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Bell size={18} className="mr-2 text-amber-600 dark:text-amber-400" />
                      <span>Enable Notifications</span>
                    </span>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        name="notificationsEnabled"
                        id="notificationsEnabled"
                        className="sr-only"
                        checked={settings.notificationsEnabled}
                        onChange={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                      />
                      <div className="block h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div
                        className={`absolute left-0 top-0 h-6 w-6 rounded-full transition-transform transform ${
                          settings.notificationsEnabled ? 'translate-x-6 bg-indigo-600' : 'bg-white dark:bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Receive notifications when your Pomodoro timer finishes and for task reminders
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="text-amber-800 dark:text-amber-400 font-medium mb-2">Account Settings</h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          To update your profile information or change your password, please visit your Supabase account settings.
        </p>
      </div>
    </div>
  );
}