import { TrashIcon } from "@heroicons/react/24/outline";
import { AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "Alta" | "Média" | "Baixa";
  completed: boolean;
  due_date?: string;
}

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatDueDate = (dueDate: string) => {
  if (!dueDate) return null;

  const today = new Date();
  const due = new Date(dueDate);
  const isOverdue = due < today;

  // Verificar se está pendente (menos de 24 horas para vencer)
  const hoursUntilDue = (due.getTime() - today.getTime()) / (1000 * 60 * 60);
  const isPending = !isOverdue && hoursUntilDue <= 24;

  // Formatar a data no padrão brasileiro
  const formattedDate = due.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Definir a cor baseada no status
  let textColor = "text-gray-500"; // padrão
  if (isOverdue) {
    textColor = "text-red-500";
  } else if (isPending) {
    textColor = "text-orange-500";
  }

  return (
    <span className={`text-sm ${textColor}`}>
      {isOverdue
        ? "Vencido em: "
        : isPending
        ? "Pendente, vence em: "
        : "Vence em: "}
      {formattedDate}
    </span>
  );
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Alta":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
    case "Média":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
    case "Baixa":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200";
  }
};

export function TaskItem({ task, onComplete, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-4">
        <button className="mt-1">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
        </button>
        <div>
          <h3 className="font-medium">{task.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {task.description}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
            {task.due_date && formatDueDate(task.due_date)}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onComplete(task.id)}
          className="text-sm font-medium text-green-500 hover:text-green-700"
        >
          Concluir
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:text-red-700"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
