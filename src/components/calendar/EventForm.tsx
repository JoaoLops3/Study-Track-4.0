import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  user_id: string;
}

interface EventFormProps {
  event?: Event | null;
  onClose: () => void;
  onSave: () => void;
}

const COLORS = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
];

export default function EventForm({ event, onClose, onSave }: EventFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [startDate, setStartDate] = useState(
    event?.start_date
      ? new Date(event.start_date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    event?.end_date
      ? new Date(event.end_date).toISOString().slice(0, 16)
      : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [color, setColor] = useState(event?.color || COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setStartDate(new Date(event.start_date).toISOString().slice(0, 16));
      setEndDate(new Date(event.end_date).toISOString().slice(0, 16));
      setColor(event.color);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Ajustar as datas para o fuso horário local
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      // Verificar se a data de início é anterior à data de fim
      if (startDateTime >= endDateTime) {
        toast.error("A data de início deve ser anterior à data de fim");
        setIsSubmitting(false);
        return;
      }

      const eventData = {
        title,
        description,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        color,
        user_id: user.id,
      };

      if (event) {
        // Atualizar evento existente
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", event.id);

        if (error) throw error;
        toast.success("Evento atualizado com sucesso!");
      } else {
        // Criar novo evento
        const { error } = await supabase.from("events").insert(eventData);

        if (error) throw error;
        toast.success("Evento criado com sucesso!");
      }

      onSave();
    } catch (error: any) {
      console.error("Erro ao salvar evento:", error);
      toast.error(error.message || "Erro ao salvar evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Título
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Início
          </label>
          <input
            type="datetime-local"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Fim
          </label>
          <input
            type="datetime-local"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Cor
        </label>
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-full h-8 rounded-lg border-2 transition-all ${
                color === c.value
                  ? "border-indigo-500 scale-110"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
