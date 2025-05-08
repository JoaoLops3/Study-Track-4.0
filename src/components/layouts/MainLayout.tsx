import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "../navigation/Sidebar";
import FloatingPomodoro from "../FloatingPomodoro";
import { PomodoroProvider } from "../../contexts/PomodoroContext";
import { useSettings } from "../../contexts/SettingsContext";
import { FloatingCalculator } from "../FloatingCalculator";

export default function MainLayout() {
  const { settings } = useSettings();

  return (
    <PomodoroProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        {settings.showFloatingPomodoro && <FloatingPomodoro />}
        {settings.showFloatingCalculator && <FloatingCalculator />}
        <Toaster position="top-right" />
      </div>
    </PomodoroProvider>
  );
}
