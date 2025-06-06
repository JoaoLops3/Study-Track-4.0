import {
  BarChart,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Github,
  Link,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link as RouterLink } from "react-router-dom";
import GithubLoginButton from "../components/auth/GithubLoginButton";
import { useAuth } from "../contexts/AuthContext";
import { usePomodoro } from "../contexts/PomodoroContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";

interface Stats {
  focusSessions: number;
  totalFocusTime: string;
  completedTasks: number;
  upcomingTasks: number;
  weeklyProgress: number;
  githubCommits: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { state: pomodoroState } = usePomodoro();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<Stats>({
    focusSessions: 0,
    totalFocusTime: "0h 0m",
    completedTasks: 0,
    upcomingTasks: 0,
    weeklyProgress: 0,
    githubCommits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Buscar estatísticas
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);

      let focusSessions = [];
      let tasks = [];
      let githubCommits = 0;

      // Tentar buscar sessões de foco
      try {
        const { data: sessions, error: focusError } = await supabase
          .from("pomodoro_sessions")
          .select("*")
          .eq("user_id", user?.id)
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          );

        if (!focusError) {
          focusSessions = sessions || [];
        }
      } catch (error) {
        console.log("Tabela pomodoro_sessions não existe ainda");
      }

      // Tentar buscar tarefas
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user?.id);

        if (!tasksError) {
          tasks = tasksData || [];
        }
      } catch (error) {
        console.log("Tabela tasks não existe ainda");
      }

      // Buscar commits do GitHub
      try {
        const { data: integration, error: integrationError } = await supabase
          .from("github_integrations")
          .select("access_token")
          .eq("user_id", user?.id)
          .single();

        if (!integrationError && integration?.access_token) {
          // Primeiro, buscar o nome de usuário do GitHub
          const userResponse = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${integration.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            const username = userData.login;

            // Agora buscar os eventos do usuário
            const response = await fetch(
              `https://api.github.com/users/${username}/events?per_page=100`,
              {
                headers: {
                  Authorization: `Bearer ${integration.access_token}`,
                  Accept: "application/vnd.github.v3+json",
                },
              }
            );

            if (response.ok) {
              const events = await response.json();
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

              githubCommits = events.filter(
                (event: any) =>
                  event.type === "PushEvent" &&
                  new Date(event.created_at) > oneWeekAgo
              ).length;
            } else {
              console.log("Erro ao buscar eventos do GitHub:", response.status);
            }
          } else {
            console.log(
              "Erro ao buscar dados do usuário:",
              userResponse.status
            );
          }
        }
      } catch (error) {
        console.log("Erro ao buscar commits do GitHub:", error);
      }

      // Calcular estatísticas
      const totalFocusTime =
        focusSessions.reduce(
          (acc, session) => acc + (session.duration || 0),
          0
        ) || 0;
      const hours = Math.floor(totalFocusTime / 60);
      const minutes = totalFocusTime % 60;

      const completedTasks = tasks.filter((task) => task.completed).length || 0;
      const upcomingTasks = tasks.filter((task) => !task.completed).length || 0;

      // Calcular progresso semanal
      const weeklyProgress = tasks.length
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

      setStats({
        focusSessions: focusSessions.length || 0,
        totalFocusTime: `${hours}h ${minutes}m`,
        completedTasks,
        upcomingTasks,
        weeklyProgress,
        githubCommits,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setIsLoading(false);
    }
  };

  // Format the current time
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format the current date
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header with greeting and time */}
      <header
        className={`rounded-xl shadow-sm p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1
              className={`text-2xl md:text-3xl font-bold ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Olá, {user?.user_metadata?.name || "visitante"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {formattedDate}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span
              className={`text-xl font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {formattedTime}
            </span>
          </div>
        </div>
      </header>

      {/* Current pomodoro status */}
      <div
        className={`rounded-xl shadow-sm p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-lg font-medium mb-4 ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Status do Pomodoro
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className={`flex-1 rounded-lg p-4 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Modo atual
                </p>
                <p
                  className={`text-xl font-medium mt-1 capitalize ${
                    theme === "dark" ? "text-gray-50" : "text-gray-800"
                  }`}
                >
                  {pomodoroState.mode === "focus"
                    ? "Foco"
                    : pomodoroState.mode === "shortBreak"
                    ? "Pausa Curta"
                    : "Pausa Longa"}
                </p>
              </div>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  pomodoroState.mode === "focus"
                    ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                    : pomodoroState.mode === "shortBreak"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : theme === "dark"
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div
            className={`flex-1 rounded-lg p-4 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Rodadas completadas
                </p>
                <p
                  className={`text-xl font-medium mt-1 ${
                    theme === "dark" ? "text-gray-50" : "text-gray-800"
                  }`}
                >
                  {pomodoroState.rounds}/{pomodoroState.totalRounds || 0}
                </p>
              </div>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-indigo-900/30 text-indigo-400"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                <BarChart size={20} />
              </div>
            </div>
          </div>

          <div
            className={`flex-1 rounded-lg p-4 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total completado
                </p>
                <p
                  className={`text-xl font-medium mt-1 ${
                    theme === "dark" ? "text-gray-50" : "text-gray-800"
                  }`}
                >
                  {pomodoroState.totalRounds} sessões
                </p>
              </div>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-teal-900/30 text-teal-400"
                    : "bg-teal-100 text-teal-600"
                }`}
              >
                <CheckCircle size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Focus sessions */}
        <div
          className={`rounded-xl shadow-sm p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Sessões de Foco
            </h3>
            <div
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "bg-rose-900/30 text-rose-400"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              <Clock size={18} />
            </div>
          </div>
          <p
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-gray-50" : "text-gray-800"
            }`}
          >
            {stats.focusSessions}
          </p>
          <p
            className={`text-sm mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Total: {stats.totalFocusTime} focado
          </p>
        </div>

        {/* Tasks */}
        <div
          className={`rounded-xl shadow-sm p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Tarefas
            </h3>
            <div
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "bg-emerald-900/30 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <CheckCircle size={18} />
            </div>
          </div>
          <p
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-gray-50" : "text-gray-800"
            }`}
          >
            {stats.completedTasks}
          </p>
          <p
            className={`text-sm mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {stats.upcomingTasks} tarefas pendentes
          </p>
        </div>

        {/* GitHub activity */}
        <div
          className={`rounded-xl shadow-sm p-6 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Atividade no GitHub
            </h3>
            <div
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Github size={18} />
            </div>
          </div>
          <p
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-gray-50" : "text-gray-800"
            }`}
          >
            {stats.githubCommits}
          </p>
          <p
            className={`text-sm mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Commits esta semana
          </p>
          {user ? (
            <RouterLink
              to="/github"
              className={`mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md text-sm ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              <Link className="w-4 h-4 mr-2" />
              Ver Repositórios
            </RouterLink>
          ) : (
            <div className="mt-4">
              <GithubLoginButton />
            </div>
          )}
        </div>

        {/* Weekly progress */}
        <div
          className={`rounded-xl shadow-sm p-6 md:col-span-2 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Progresso Semanal
            </h3>
            <div
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "bg-indigo-900/30 text-indigo-400"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              <BarChart size={18} />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Progresso
              </span>
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {stats.weeklyProgress}%
              </span>
            </div>
            <div
              className={`w-full rounded-full h-2.5 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${stats.weeklyProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
