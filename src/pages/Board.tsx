import { useState, useEffect } from "react";
import { LayoutGrid, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";

interface Card {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  position: number;
  created_at: string;
  updated_at: string;
}

const statusLabels = {
  todo: "A fazer",
  "in-progress": "Em progresso",
  done: "Concluído",
} as const;

type CardStatus = keyof typeof statusLabels;

export default function Board() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo" as CardStatus,
  });

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("board_cards")
        .select("*")
        .eq("owner_id", user?.id)
        .order("position", { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error("Erro ao buscar cards:", error);
      toast.error("Erro ao carregar cards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCard) {
        // Atualizar card existente
        const { error } = await supabase
          .from("board_cards")
          .update({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCard.id);

        if (error) throw error;
        toast.success("Card atualizado com sucesso!");
      } else {
        // Criar novo card
        const maxPosition = Math.max(...cards.map((c) => c.position), -1);
        const { error } = await supabase.from("board_cards").insert([
          {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            position: maxPosition + 1,
            owner_id: user?.id,
          },
        ]);

        if (error) throw error;
        toast.success("Card criado com sucesso!");
      }

      setShowModal(false);
      setEditingCard(null);
      setFormData({ title: "", description: "", status: "todo" });
      fetchCards();
    } catch (error) {
      console.error("Erro ao salvar card:", error);
      toast.error("Erro ao salvar card");
    }
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      description: card.description,
      status: card.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este card?")) return;

    try {
      const { error } = await supabase
        .from("board_cards")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Card excluído com sucesso!");
      fetchCards();
    } catch (error) {
      console.error("Erro ao excluir card:", error);
      toast.error("Erro ao excluir card");
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Reordenar cards
    const newCards = Array.from(cards);
    const [removed] = newCards.splice(source.index, 1);
    newCards.splice(destination.index, 0, {
      ...removed,
      status: destination.droppableId,
    });

    // Atualizar as posições de todos os cards
    const updatedCards = newCards.map((card, index) => ({
      ...card,
      position: index,
    }));

    setCards(updatedCards);

    try {
      // Atualizar o card movido
      const { error: updateError } = await supabase
        .from("board_cards")
        .update({
          status: destination.droppableId,
          position: destination.index,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draggableId);

      if (updateError) throw updateError;

      // Atualizar as posições dos outros cards na coluna de destino
      const cardsToUpdate = updatedCards
        .filter(
          (card) =>
            card.id !== draggableId && card.status === destination.droppableId
        )
        .map((card, index) => ({
          id: card.id,
          position: index,
          updated_at: new Date().toISOString(),
        }));

      // Atualizar cada card individualmente
      for (const card of cardsToUpdate) {
        const { error } = await supabase
          .from("board_cards")
          .update({
            position: card.position,
            updated_at: card.updated_at,
          })
          .eq("id", card.id);

        if (error) throw error;
      }

      // Se o card foi movido para uma coluna diferente, atualizar as posições na coluna de origem
      if (source.droppableId !== destination.droppableId) {
        const sourceCardsToUpdate = updatedCards
          .filter((card) => card.status === source.droppableId)
          .map((card, index) => ({
            id: card.id,
            position: index,
            updated_at: new Date().toISOString(),
          }));

        for (const card of sourceCardsToUpdate) {
          const { error } = await supabase
            .from("board_cards")
            .update({
              position: card.position,
              updated_at: card.updated_at,
            })
            .eq("id", card.id);

          if (error) throw error;
        }
      }

      toast.success("Card movido com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar posições:", error);
      toast.error("Erro ao mover card");
      // Recarregar os cards em caso de erro
      fetchCards();
    }
  };

  const getCardsByStatus = (status: CardStatus) =>
    cards.filter((card) => card.status === status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Board</h1>
        <button
          onClick={() => {
            setEditingCard(null);
            setFormData({ title: "", description: "", status: "todo" });
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Card
        </button>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div
                key={status}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
              >
                <h2 className="font-medium mb-4">{label}</h2>
                <Droppable droppableId={status}>
                  {(provided: DroppableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3 min-h-[200px]"
                    >
                      {getCardsByStatus(status as CardStatus).map(
                        (card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
                            index={index}
                          >
                            {(provided: DraggableProvided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium">
                                      {card.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {typeof card.description === "string"
                                        ? card.description
                                        : JSON.stringify(card.description)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEdit(card)}
                                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(card.id)}
                                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCard ? "Editar Card" : "Novo Card"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as CardStatus,
                    })
                  }
                  className="w-full px-3 py-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCard(null);
                    setFormData({
                      title: "",
                      description: "",
                      status: "todo",
                    });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingCard ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
