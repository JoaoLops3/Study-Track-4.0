import {
  House,
  Timer,
  SquareCheckBig,
  Calendar,
  Github,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Navigation() {
  const { theme } = useTheme();

  return (
    <nav
      className={`flex-1 overflow-y-auto py-4 px-3 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-200"
          : "bg-white text-gray-800"
      }`}
    >
      <div className="space-y-2">
        <a
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          href="/"
          data-discover="true"
        >
          <House className="w-5 h-5" />
          <span>Dashboard</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          href="/pomodoro"
          data-discover="true"
        >
          <Timer className="w-5 h-5" />
          <span>Pomodoro</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          href="/tasks"
          data-discover="true"
        >
          <SquareCheckBig className="w-5 h-5" />
          <span>Tasks</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          href="/calendar"
          data-discover="true"
        >
          <Calendar className="w-5 h-5" />
          <span>Calendar</span>
        </a>
        <a
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          href="/github"
          data-discover="true"
        >
          <Github className="w-5 h-5" />
          <span>GitHub</span>
        </a>
        <div className="pt-4 border-t dark:border-gray-700">
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            href="/pages"
            data-discover="true"
          >
            <FileText className="w-5 h-5" />
            <span>Páginas</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            href="/board"
            data-discover="true"
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Board</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
