import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function GoogleCalendarButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [integrationId, setIntegrationId] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Verificando sessão do usuário...");
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erro ao verificar sessão:", sessionError);
          return;
        }

        if (!session) {
          console.log("Usuário não está autenticado");
          return;
        }

        console.log("Usuário autenticado:", session.user.id);
        console.log("Verificando integração para usuário:", session.user.id);

        const { data, error } = await supabase
          .from("google_calendar_integrations")
          .select("id, user_id, calendar_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar integração:", error);
          return;
        }

        console.log("Resultado da verificação:", data);
        setIsConnected(!!data);
        setIntegrationId(data?.id || null);
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
      }
    };

    checkConnection();
  }, []);

  const handleDisconnect = async () => {
    try {
      if (!integrationId) {
        console.error("ID da integração não encontrado");
        return;
      }

      console.log("Desconectando integração:", integrationId);
      const { error } = await supabase
        .from("google_calendar_integrations")
        .delete()
        .eq("id", integrationId);

      if (error) {
        console.error("Erro ao desconectar:", error);
        throw new Error("Erro ao desconectar do Google Calendar");
      }

      console.log("Integração removida com sucesso");
      setIsConnected(false);
      setIntegrationId(null);
      toast.success("Desconectado do Google Calendar com sucesso!");
    } catch (error: any) {
      console.error("Erro ao desconectar:", error);
      toast.error(error.message || "Erro ao desconectar do Google Calendar");
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      console.log("Verificando sessão do usuário...");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Erro ao verificar sessão:", sessionError);
        throw new Error("Erro ao verificar autenticação");
      }

      if (!session) {
        console.error("Usuário não está autenticado");
        throw new Error("Usuário não está autenticado");
      }

      console.log("Usuário autenticado:", session.user.id);
      console.log("Verificando integração existente...");

      // Verificar se já existe uma integração
      const { data: existingIntegration, error: checkError } = await supabase
        .from("google_calendar_integrations")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Erro ao verificar integração existente:", checkError);
        throw checkError;
      }

      if (existingIntegration) {
        console.log("Integração já existe:", existingIntegration);
        toast.error("Você já está conectado ao Google Calendar");
        return;
      }

      console.log("Iniciando fluxo de autenticação do Google...");
      // Redirecionar para a página de autorização do Google
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = "https://www.googleapis.com/auth/calendar";
      const responseType = "code";
      const accessType = "offline";
      const prompt = "consent";

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=${responseType}&scope=${encodeURIComponent(
        scope
      )}&access_type=${accessType}&prompt=${prompt}`;

      console.log("URL de autenticação:", authUrl);
      window.location.href = authUrl;
    } catch (error: any) {
      console.error("Erro ao conectar com Google Calendar:", error);
      toast.error(error.message || "Erro ao conectar com Google Calendar");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isConnecting}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
        isConnected
          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50"
          : "bg-white hover:bg-gray-50 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
      } shadow-sm hover:shadow-md`}
    >
      <Calendar className="w-5 h-5 mr-2" />
      {isConnected
        ? "Desconectar do Google Calendar"
        : isConnecting
        ? "Conectando..."
        : "Conectar com Google Calendar"}
    </button>
  );
}
