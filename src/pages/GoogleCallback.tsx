import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function GoogleCallback() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log("Verificando sessão do usuário...");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        navigate("/");
        return;
      }

      console.log("Usuário autenticado:", user.id);
      console.log("Iniciando troca de tokens...");

      // Obter o código de autorização da URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        toast.error("Código de autorização não encontrado");
        navigate("/");
        return;
      }

      // Trocar o código por tokens
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
      const redirectUri = `${window.location.origin}/auth/google/callback`;

      console.log("Dados da requisição:", {
        clientId,
        redirectUri,
        code: code.substring(0, 10) + "...", // Log parcial do código por segurança
      });

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error("Erro na resposta do Google:", errorData);
        throw new Error(
          `Falha ao obter tokens: ${
            errorData.error_description || errorData.error
          }`
        );
      }

      const tokens = await tokenResponse.json();
      console.log("Tokens obtidos com sucesso");

      // Obter informações do calendário
      console.log("Obtendo informações do calendário...");
      const calendarResponse = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList/primary",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      if (!calendarResponse.ok) {
        const errorData = await calendarResponse.json();
        console.error("Erro ao obter informações do calendário:", errorData);
        throw new Error("Falha ao obter informações do calendário");
      }

      const calendarInfo = await calendarResponse.json();
      console.log("Informações do calendário obtidas:", calendarInfo);

      // Calcular data de expiração do token
      const tokenExpiry = new Date();
      tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokens.expires_in);
      console.log("Data de expiração do token:", tokenExpiry);

      // Verificar se já existe uma integração
      console.log("Verificando integração existente...");
      const { data: existingIntegration, error: selectError } = await supabase
        .from("google_calendar_integrations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (selectError) {
        console.error("Erro ao verificar integração existente:", selectError);
        throw selectError;
      }

      // Salvar ou atualizar a integração
      console.log("Salvando integração no banco de dados...");
      const integrationData = {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokenExpiry.toISOString(),
        calendar_id: calendarInfo.id,
        calendar_summary: calendarInfo.summary,
        calendar_timezone: calendarInfo.timeZone,
      };

      if (existingIntegration) {
        const { error: updateError } = await supabase
          .from("google_calendar_integrations")
          .update(integrationData)
          .eq("id", existingIntegration.id);

        if (updateError) {
          console.error("Erro ao atualizar integração:", updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("google_calendar_integrations")
          .insert([integrationData]);

        if (insertError) {
          console.error("Erro ao inserir integração:", insertError);
          throw insertError;
        }
      }

      console.log("Integração salva com sucesso");
      toast.success("Google Calendar conectado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao processar callback:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao conectar com Google Calendar"
      );
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Conectando com Google Calendar...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
