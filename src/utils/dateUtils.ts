export const getDueDateStatus = (dueDate: string) => {
  if (!dueDate) return null;

  const today = new Date();
  const due = new Date(dueDate);

  // Para status "Vencido", comparamos apenas as datas (dia)
  // Criamos novas datas no fuso horário local para evitar problemas de fuso horário ao zerar a hora
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueLocal = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const isOverdue = dueLocal < todayLocal;

  // Para status "Pendente" e "Vence em", usamos a diferença de tempo completa (incluindo horas)
  const diffHours = (due.getTime() - today.getTime()) / (1000 * 60 * 60);

  // Definir status e cores
  let status = {
    color: "text-gray-500", // Padrão: Mais de 24h para vencer
    text: "Vence em:",
  };

  if (isOverdue) {
    // Status: Vencido (dia passou)
    status.color = "text-red-500";
    status.text = "Vencido em:";
  } else if (diffHours <= 24 && diffHours >= 0) {
    // Status: Pendente (vence nas próximas 24 horas)
    status.color = "text-orange-500";
    status.text = "Pendente, vence em:";
  }
  // else, mantém o status padrão (mais de 24h)

  // Formatar a data
  const formattedDate = due.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    ...status,
    formattedDate,
  };
}; 