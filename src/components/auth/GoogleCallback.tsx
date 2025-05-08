import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          console.error("Código de autorização não encontrado");
          toast.error("Erro ao conectar com Google Calendar");
          navigate("/");
          return;
        }

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
        console.log("Iniciando troca de tokens...");

        // Trocar o código por tokens
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code,
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
            redirect_uri: `${window.location.origin}/auth/google/callback`,
            grant_type: "authorization_code",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro na troca de tokens:", errorData);
          throw new Error("Erro ao obter tokens do Google");
        }

        const tokens = await response.json();
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
          throw new Error("Erro ao obter informações do calendário");
        }

        const calendarData = await calendarResponse.json();
        console.log("Informações do calendário obtidas:", calendarData);

        // Calcular a data de expiração do token
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setSeconds(
          tokenExpiresAt.getSeconds() + tokens.expires_in
        );
        console.log(
          "Data de expiração do token:",
          tokenExpiresAt.toISOString()
        );

        // Verificar se já existe uma integração
        console.log("Verificando integração existente...");
        const { data: existingIntegration, error: checkError } = await supabase
          .from("google_calendar_integrations")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Erro ao verificar integração existente:", checkError);
          throw checkError;
        }

        // Salvar a integração no banco de dados
        console.log("Salvando integração no banco de dados...");
        const { error: dbError } = await supabase
          .from("google_calendar_integrations")
          .update({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: tokenExpiresAt.toISOString(),
            calendar_id: calendarData.id,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", session.user.id);

        if (dbError) {
          // Se o update falhar, tenta inserir
          console.log("Tentando inserir nova integração...");
          const { error: insertError } = await supabase
            .from("google_calendar_integrations")
            .insert({
              user_id: session.user.id,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              token_expires_at: tokenExpiresAt.toISOString(),
              calendar_id: calendarData.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Erro ao salvar integração:", insertError);
            throw new Error("Erro ao salvar integração");
          }
        }

        console.log("Integração salva com sucesso");
        toast.success("Conectado ao Google Calendar com sucesso!");
        navigate("/");
      } catch (error: any) {
        console.error("Erro no callback do Google:", error);
        toast.error(error.message || "Erro ao conectar com Google Calendar");
        navigate("/");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Conectando ao Google Calendar...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Por favor, aguarde enquanto configuramos sua integração.
        </p>
      </div>
    </div>
  );
}
