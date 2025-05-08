import { useState, useEffect } from "react";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

interface Page {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function Pages() {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (user) {
      fetchPages();
    }
  }, [user]);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Erro ao buscar páginas:", error);
      toast.error("Erro ao carregar páginas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPage) {
        // Atualizar página existente
        const { error } = await supabase
          .from("pages")
          .update({
            title: formData.title,
            content: formData.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPage.id);

        if (error) throw error;
        toast.success("Página atualizada com sucesso!");
      } else {
        // Criar nova página
        const { error } = await supabase.from("pages").insert([
          {
            title: formData.title,
            content: formData.content,
            owner_id: user?.id,
          },
        ]);

        if (error) throw error;
        toast.success("Página criada com sucesso!");
      }

      setShowModal(false);
      setEditingPage(null);
      setFormData({ title: "", content: "" });
      fetchPages();
    } catch (error) {
      console.error("Erro ao salvar página:", error);
      toast.error("Erro ao salvar página");
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      content: page.content,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta página?")) return;

    try {
      const { error } = await supabase.from("pages").delete().eq("id", id);

      if (error) throw error;
      toast.success("Página excluída com sucesso!");
      fetchPages();
    } catch (error) {
      console.error("Erro ao excluir página:", error);
      toast.error("Erro ao excluir página");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Páginas</h1>
        <button
          onClick={() => {
            setEditingPage(null);
            setFormData({ title: "", content: "" });
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Página
        </button>
      </div>

      {/* Pages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Carregando...</div>
        ) : pages.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhuma página encontrada
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{page.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {typeof page.content === "string"
                        ? page.content
                        : JSON.stringify(page.content)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(page)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingPage ? "Editar Página" : "Nova Página"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPage(null);
                  setFormData({ title: "", content: "" });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Digite o título da página"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Conteúdo</label>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Dica: Use # para títulos, * para itálico, ** para negrito
                    </span>
                  </div>
                </div>

                <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Barra de ferramentas */}
                  <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                    <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2">
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector("textarea");
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText =
                              text.substring(0, start) +
                              "TÍTULO PRINCIPAL\n" +
                              text.substring(start, end) +
                              "\n" +
                              text.substring(end);
                            setFormData({ ...formData, content: newText });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                      >
                        Título Principal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector("textarea");
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText =
                              text.substring(0, start) +
                              "SUBTÍTULO\n" +
                              text.substring(start, end) +
                              "\n" +
                              text.substring(end);
                            setFormData({ ...formData, content: newText });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                      >
                        Subtítulo
                      </button>
                    </div>

                    <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2">
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector("textarea");
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText =
                              text.substring(0, start) +
                              "NEGRITO\n" +
                              text.substring(start, end) +
                              "\n" +
                              text.substring(end);
                            setFormData({ ...formData, content: newText });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-bold"
                      >
                        Negrito
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector("textarea");
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText =
                              text.substring(0, start) +
                              "ITÁLICO\n" +
                              text.substring(start, end) +
                              "\n" +
                              text.substring(end);
                            setFormData({ ...formData, content: newText });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm italic"
                      >
                        Itálico
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector("textarea");
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText =
                              text.substring(0, start) +
                              "SUBLINHADO\n" +
                              text.substring(start, end) +
                              "\n" +
                              text.substring(end);
                            setFormData({ ...formData, content: newText });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm underline"
                      >
                        Sublinhado
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector("textarea");
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText =
                              text.substring(0, start) +
                              "• " +
                              text.substring(start, end) +
                              "\n" +
                              text.substring(end);
                            setFormData({ ...formData, content: newText });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                      >
                        Lista com Marcadores
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector("textarea");
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText =
                              text.substring(0, start) +
                              "1. " +
                              text.substring(start, end) +
                              "\n" +
                              text.substring(end);
                            setFormData({ ...formData, content: newText });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                      >
                        Lista Numerada
                      </button>
                    </div>
                  </div>

                  {/* Editor de texto */}
                  <div className="relative">
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 focus:outline-none resize-none"
                      rows={15}
                      placeholder="Digite o conteúdo da página..."
                      required
                    />
                  </div>
                </div>

                {/* Templates */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">
                    Templates
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const template = `TÍTULO PRINCIPAL
Resumo

SUBTÍTULO
Conceitos Principais
• Ponto 1
• Ponto 2
• Ponto 3

SUBTÍTULO
Exemplos
1. Exemplo 1
2. Exemplo 2

SUBTÍTULO
Fórmulas
NEGRITO
Fórmula 1: descrição
NEGRITO
Fórmula 2: descrição

SUBTÍTULO
Observações
ITÁLICO
Observação importante`;
                        setFormData({ ...formData, content: template });
                      }}
                      className="p-3 text-left border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <h4 className="font-medium mb-1">Resumo Básico</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Estrutura para resumos simples
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const template = `TÍTULO PRINCIPAL
Resumo Detalhado

SUBTÍTULO
Introdução
ITÁLICO
Contexto e importância do tema

SUBTÍTULO
Desenvolvimento
NEGRITO
Tópico 1
• Ponto principal
• Explicação
• Exemplo

NEGRITO
Tópico 2
• Ponto principal
• Explicação
• Exemplo

SUBTÍTULO
Conclusão
ITÁLICO
Principais pontos e conclusões

SUBTÍTULO
Referências
1. Referência 1
2. Referência 2`;
                        setFormData({ ...formData, content: template });
                      }}
                      className="p-3 text-left border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <h4 className="font-medium mb-1">Resumo Detalhado</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Estrutura para resumos completos
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const template = `TÍTULO PRINCIPAL
Fichamento

SUBTÍTULO
Citações Importantes
ITÁLICO
"Citação relevante 1"
ITÁLICO
Página 123

ITÁLICO
"Citação relevante 2"
ITÁLICO
Página 456

SUBTÍTULO
Anotações
• NEGRITO
Ideia Principal: descrição
• NEGRITO
Conceito Chave: explicação
• NEGRITO
Dúvida: questionamento

SUBTÍTULO
Resumo Pessoal
ITÁLICO
Minhas conclusões e reflexões`;
                        setFormData({ ...formData, content: template });
                      }}
                      className="p-3 text-left border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <h4 className="font-medium mb-1">Fichamento</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Estrutura para fichamentos
                      </p>
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>Dicas de formatação:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>
                      Selecione o texto e use os botões acima para formatar
                    </li>
                    <li>T1, T2, T3 para diferentes tamanhos de título</li>
                    <li>B para negrito, I para itálico, U para sublinhado</li>
                    <li>
                      Use os botões de lista para criar listas com marcadores ou
                      numeradas
                    </li>
                    <li>
                      Use o botão de citação para destacar trechos importantes
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPage(null);
                    setFormData({ title: "", content: "" });
                  }}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  {editingPage ? "Salvar Alterações" : "Criar Página"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
