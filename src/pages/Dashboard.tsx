import { useState, useEffect } from "react";
import {
  Clock,
  BarChart,
  Calendar as CalendarIcon,
  CheckCircle,
  Github,
  Link,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePomodoro } from "../contexts/PomodoroContext";
import { Link as RouterLink } from "react-router-dom";
import GithubLoginButton from "../components/auth/GithubLoginButton";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

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
          .from("user_integrations")
          .select("access_token")
          .eq("user_id", user?.id)
          .eq("provider", "github")
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
      <header className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Olá, {user?.user_metadata?.name || "visitante"}
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
        <h2 className="text-lg font-medium mb-4">Status do Pomodoro</h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Modo atual
                </p>
                <p className="text-xl font-medium mt-1 capitalize">
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
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                }`}
              >
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rodadas completadas
                </p>
                <p className="text-xl font-medium mt-1">
                  {pomodoroState.rounds}/{pomodoroState.totalRounds || 0}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total completado
                </p>
                <p className="text-xl font-medium mt-1">
                  {pomodoroState.totalRounds} sessões
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
            <h3 className="font-medium">Sessões de Foco</h3>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.focusSessions}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Total: {stats.totalFocusTime} focado
          </p>
        </div>

        {/* Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Tarefas</h3>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.completedTasks}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {stats.upcomingTasks} tarefas pendentes
          </p>
        </div>

        {/* GitHub activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Atividade no GitHub</h3>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300">
              <Github size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">{stats.githubCommits}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Commits esta semana
          </p>
          {!user ? (
            <div className="mt-4">
              <GithubLoginButton />
            </div>
          ) : (
            <RouterLink
              to="/github"
              className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md text-sm"
            >
              <Link className="w-4 h-4 mr-2" />
              Ver Repositórios
            </RouterLink>
          )}
        </div>

        {/* Weekly progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Progresso Semanal</h3>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
              <BarChart size={18} />
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Progresso
              </span>
              <span className="text-sm font-medium">
                {stats.weeklyProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
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
