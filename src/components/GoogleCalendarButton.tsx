import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GoogleCalendarButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkIntegration();
  }, []);

  const checkIntegration = async () => {
    try {
      setIsLoading(true);
      console.log("Verificando sessão do usuário...");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        console.log("Usuário autenticado:", user.id);
        console.log("Verificando integração para usuário:", user.id);

        const { data, error } = await supabase
          .from("google_calendar_integrations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar integração:", error);
          return;
        }

        if (data) {
          console.log("Integração encontrada:", data);
          setIsConnected(true);
        } else {
          console.log("Nenhuma integração encontrada");
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar integração:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (isConnected) {
      // Implementar lógica de desconexão
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("google_calendar_integrations")
            .delete()
            .eq("user_id", user.id);

          if (error) throw error;
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Erro ao desconectar:", error);
      }
    } else {
      // Redirecionar para a página de autenticação do Google
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/google-callback`;
      const scope = "https://www.googleapis.com/auth/calendar";
      const responseType = "code";
      const accessType = "offline";
      const prompt = "consent";

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&access_type=${accessType}&prompt=${prompt}`;

      window.location.href = authUrl;
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
      >
        <Calendar className="w-5 h-5 mr-2" />
        Carregando...
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
        isConnected
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      <Calendar className="w-5 h-5 mr-2" />
      {isConnected ? "Desconectar Google Calendar" : "Conectar Google Calendar"}
    </button>
  );
}
