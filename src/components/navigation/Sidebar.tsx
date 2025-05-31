import { useState } from "react";
import { NavLink } from "react-router-dom";
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
  X,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useSettings } from "../../contexts/SettingsContext";
import logo from "../../assets/logo-v1.png";

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    updateSettings({ compactSidebar: !settings.compactSidebar });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    const baseClasses =
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all";

    // Classes para o estado ativo (inclui fundo e texto)
    const activeClasses =
      theme === "dark"
        ? "bg-indigo-900/30 text-indigo-200"
        : "bg-indigo-100 text-indigo-800";

    // Classes para o estado inativo (apenas texto e hover)
    const inactiveClasses =
      theme === "dark"
        ? "text-gray-300 hover:bg-gray-700 bg-gray-800"
        : "text-gray-700 hover:bg-gray-100 bg-white";

    // Retornando as classes base + classes ativas OU classes inativas (texto/hover)
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

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
          transform ${
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
          transition-all duration-300 ease-in-out
          flex flex-col ${settings.compactSidebar ? "w-20" : "w-64"} md:w-auto
          bg-white dark:bg-gray-800 border-r dark:border-gray-700
        `}
      >
        {/* Header with logo */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo do site" className="h-10 w-auto" />
            {!settings.compactSidebar && (
              <h1
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Study Track
              </h1>
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
        <nav
          className={`flex-1 overflow-y-auto py-4 px-3 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) => navLinkClass({ isActive })}
              end
            >
              <Home size={20} />
              {!settings.compactSidebar && <span>Dashboard</span>}
            </NavLink>

            <NavLink
              to="/pomodoro"
              className={({ isActive }) => navLinkClass({ isActive })}
            >
              <Timer size={20} />
              {!settings.compactSidebar && <span>Pomodoro</span>}
            </NavLink>

            <NavLink
              to="/tasks"
              className={({ isActive }) => navLinkClass({ isActive })}
            >
              <CheckSquare size={20} />
              {!settings.compactSidebar && <span>Tasks</span>}
            </NavLink>

            <NavLink
              to="/calendar"
              className={({ isActive }) => navLinkClass({ isActive })}
            >
              <Calendar size={20} />
              {!settings.compactSidebar && <span>Calendar</span>}
            </NavLink>

            <NavLink
              to="/github"
              className={({ isActive }) => navLinkClass({ isActive })}
            >
              <Github size={20} />
              {!settings.compactSidebar && <span>GitHub</span>}
            </NavLink>

            {/* Novos botões */}
            <div
              className={`pt-4 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <NavLink
                to="/pages"
                className={({ isActive }) => navLinkClass({ isActive })}
              >
                <FileText size={20} />
                {!settings.compactSidebar && <span>Páginas</span>}
              </NavLink>

              <NavLink
                to="/board"
                className={({ isActive }) => navLinkClass({ isActive })}
              >
                <LayoutGrid size={20} />
                {!settings.compactSidebar && <span>Board</span>}
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Footer with user and actions */}
        <div
          className={`border-t p-4 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="space-y-4">
            {/* User profile */}
            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    "https://via.placeholder.com/32"
                  }
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                {!settings.compactSidebar && (
                  <div className="overflow-hidden">
                    <p
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-gray-200" : "text-gray-800"
                      } truncate`}
                    >
                      {user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        "User"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon
                    size={20}
                    className="text-gray-700 dark:text-gray-300"
                  />
                ) : (
                  <Sun size={20} className="text-gray-700 dark:text-gray-300" />
                )}
              </button>

              <NavLink
                to="/settings"
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
                aria-label="Settings"
              >
                <Settings
                  size={20}
                  className="text-gray-700 dark:text-gray-300"
                />
              </NavLink>

              {!settings.compactSidebar && user && (
                <button
                  onClick={signOut}
                  className={`ml-auto p-2 text-sm transition-colors ${
                    theme === "dark"
                      ? "text-red-400 hover:text-red-300"
                      : "text-red-600 hover:text-red-800"
                  }`}
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
