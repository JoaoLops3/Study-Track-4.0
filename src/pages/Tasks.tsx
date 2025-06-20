import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  user_id: string;
  subject_id?: string;
}

export default function Tasks() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompleted, setFilterCompleted] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    completed: false,
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast.error("Erro ao carregar tarefas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Usuário não autenticado");
      navigate("/login");
      return;
    }

    try {
      // Verificar se o usuário está autenticado no Supabase
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Erro ao verificar sessão:", sessionError);
        toast.error("Erro de autenticação. Por favor, faça login novamente.");
        navigate("/login");
        return;
      }

      if (!session) {
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        navigate("/login");
        return;
      }

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        completed: false,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        user_id: session.user.id,
      };

      console.log("Enviando dados da tarefa:", taskData);

      const { data, error } = await supabase
        .from("tasks")
        .insert([taskData])
        .select();

      if (error) {
        console.error("Erro detalhado:", error);
        if (error.code === "23503") {
          toast.error("Erro de autenticação. Por favor, faça login novamente.");
          navigate("/login");
          return;
        }
        throw error;
      }

      console.log("Tarefa criada com sucesso:", data);

      toast.success("Tarefa criada com sucesso!");
      setShowNewTaskModal(false);
      setNewTask({
        title: "",
        description: "",
        completed: false,
        priority: "medium",
        due_date: "",
      });
      fetchTasks();
    } catch (error: any) {
      console.error("Erro ao criar tarefa:", error);
      toast.error(error.message || "Erro ao criar tarefa");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          completed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Status atualizado com sucesso!");
      fetchTasks();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      toast.success("Tarefa excluída com sucesso!");
      fetchTasks();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast.error("Erro ao excluir tarefa");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompleted =
      filterCompleted === "all" ||
      (filterCompleted === "completed" && task.completed) ||
      (filterCompleted === "pending" && !task.completed);
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesCompleted && matchesPriority;
  });

  // Ordenar tarefas por prioridade, data de vencimento e status de conclusão
  const sortedTasks = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return [...filteredTasks].sort((a, b) => {
      // Primeiro, separar tarefas concluídas e não concluídas
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Depois, ordenar por prioridade
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // Se a prioridade for igual, ordenar por data de vencimento
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }

      // Se apenas uma tarefa tiver data, ela vem primeiro
      if (a.due_date) return -1;
      if (b.due_date) return 1;

      // Se nenhuma tiver data, manter a ordem original
      return 0;
    });
  }, [filteredTasks]);

  const getStatusIcon = (completed: boolean) => {
    return completed ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-yellow-500" />
    );
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-1000 text-red-900 dark:bg-red-900/30 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <button
          onClick={() => setShowNewTaskModal(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Tarefa
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            } w-5 h-5`}
          />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
            }`}
          />
        </div>

        <select
          value={filterCompleted}
          onChange={(e) => setFilterCompleted(e.target.value)}
          className={`px-4 py-2 border rounded-lg ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-300 text-gray-800"
          }`}
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="completed">Concluído</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className={`px-4 py-2 border rounded-lg ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-300 text-gray-800"
          }`}
        >
          <option value="all">Todas as prioridades</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {isLoading ? (
          <div
            className={`text-center py-8 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Carregando tarefas...
          </div>
        ) : sortedTasks.length === 0 ? (
          <div
            className={`text-center py-8 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Nenhuma tarefa encontrada
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-lg shadow-sm p-4 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } ${task.completed ? "opacity-75" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() =>
                      handleUpdateTaskStatus(task.id, !task.completed)
                    }
                    className="mt-1"
                  >
                    {getStatusIcon(task.completed)}
                  </button>
                  <div>
                    <h3
                      className={`font-medium ${
                        theme === "dark" ? "text-gray-200" : "text-gray-800"
                      } ${task.completed ? "line-through" : ""}`}
                    >
                      {task.title}
                    </h3>
                    <p
                      className={`mt-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      } ${task.completed ? "line-through" : ""}`}
                    >
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority === "high"
                          ? "Alta"
                          : task.priority === "medium"
                          ? "Média"
                          : "Baixa"}
                      </span>
                      {task.due_date && (
                        <span
                          className={`text-sm ${
                            new Date(task.due_date) < new Date() &&
                            !task.completed
                              ? "text-red-500"
                              : theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          Vence em:{" "}
                          {new Date(task.due_date).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handleUpdateTaskStatus(task.id, !task.completed)
                    }
                    className={`text-sm font-medium ${
                      task.completed
                        ? "text-yellow-500 hover:text-yellow-700"
                        : "text-green-500 hover:text-green-700"
                    }`}
                  >
                    {task.completed ? "Desfazer" : "Concluir"}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div
            className={`rounded-lg p-6 w-full max-w-md ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Nova Tarefa
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Título
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    theme === "dark"
                      ? "bg-gray-900 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Descrição
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    theme === "dark"
                      ? "bg-gray-900 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                  rows={3}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Prioridade
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value as Task["priority"],
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    theme === "dark"
                      ? "bg-gray-900 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Data de vencimento
                </label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    theme === "dark"
                      ? "bg-gray-900 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className={`px-4 py-2 ${
                    theme === "dark"
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
