import { useState, useEffect } from "react";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

  const customToolbar = (
    <div id="toolbar">
      <span className="ql-formats">
        <button
          className="ql-header"
          value="1"
          title="Título 1 (grande)"
        ></button>
        <button
          className="ql-header"
          value="2"
          title="Título 2 (médio)"
        ></button>
        <button
          className="ql-header"
          value="3"
          title="Título 3 (pequeno)"
        ></button>
      </span>
      <span className="ql-formats">
        <button className="ql-bold" title="Negrito"></button>
        <button className="ql-italic" title="Itálico"></button>
        <button className="ql-underline" title="Sublinhado"></button>
      </span>
      <span className="ql-formats">
        <button
          className="ql-list"
          value="ordered"
          title="Lista Numerada"
        ></button>
        <button
          className="ql-list"
          value="bullet"
          title="Lista com Marcadores"
        ></button>
      </span>
      <span className="ql-formats">
        <button className="ql-clean" title="Remover Formatação"></button>
      </span>
    </div>
  );

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
                    <div
                      className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                      dangerouslySetInnerHTML={{
                        __html:
                          typeof page.content === "string"
                            ? page.content
                            : JSON.stringify(page.content),
                      }}
                    />
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
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Conteúdo
                </label>
                <div className="mb-4">
                  {customToolbar}
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value: string) =>
                      setFormData((prev) => ({ ...prev, content: value }))
                    }
                    modules={{
                      toolbar: {
                        container: "#toolbar",
                      },
                    }}
                    formats={[
                      "header",
                      "bold",
                      "italic",
                      "underline",
                      "list",
                      "bullet",
                    ]}
                    className="bg-white dark:bg-gray-900 rounded-md"
                    style={{ minHeight: 180 }}
                  />
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
