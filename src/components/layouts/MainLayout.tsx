import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../navigation/Sidebar';
import { useSettings } from '../../contexts/SettingsContext';
import FloatingPomodoro from '../FloatingPomodoro';
import FloatingCalculator from '../FloatingCalculator';

export default function MainLayout() {
  const { settings } = useSettings();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
      
      {/* Floating widgets */}
      {settings.showFloatingPomodoro && <FloatingPomodoro />}
      {settings.showFloatingCalculator && <FloatingCalculator />}
      
      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #333)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}