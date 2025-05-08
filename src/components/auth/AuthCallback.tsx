import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get code and session from URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const queryParams = new URLSearchParams(window.location.search);

        const code = queryParams.get("code");
        const errorParam = queryParams.get("error") || hashParams.get("error");
        const errorDescription =
          queryParams.get("error_description") ||
          hashParams.get("error_description");

        if (errorParam) {
          throw new Error(
            errorDescription || "Ocorreu um erro durante a autenticação"
          );
        }

        if (code) {
          // Exchange code for session
          const { error: sessionError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
        } else {
          // If no code, try to get existing session
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
        }

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          try {
            // Primeiro, verificar se já existe uma integração
            const { data: existingIntegration } = await supabase
              .from("user_integrations")
              .select("*")
              .eq("user_id", session.user.id)
              .eq("provider", "github")
              .single();

            if (existingIntegration) {
              // Se existir, atualizar
              const { error: updateError } = await supabase
                .from("user_integrations")
                .update({
                  access_token: session.provider_token,
                  refresh_token: session.provider_refresh_token,
                  expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", session.user.id)
                .eq("provider", "github");

              if (updateError) throw updateError;
            } else {
              // Se não existir, criar nova
              const { error: insertError } = await supabase
                .from("user_integrations")
                .insert({
                  user_id: session.user.id,
                  provider: "github",
                  access_token: session.provider_token,
                  refresh_token: session.provider_refresh_token,
                  expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
                });

              if (insertError) throw insertError;
            }

            toast.success("Conectado com GitHub com sucesso!");
          } catch (integrationError: any) {
            console.error(
              "Error handling GitHub integration:",
              integrationError
            );
            // Não vamos interromper o fluxo por causa desse erro
            toast.error(
              "Aviso: Houve um problema ao salvar a integração, mas você ainda está conectado"
            );
          }
        }

        // Redirect to the GitHub page on success
        navigate("/github");
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Falha na autenticação");
        toast.error("Erro ao conectar com GitHub");

        // Redirect to GitHub page after 3 seconds on error
        setTimeout(() => {
          navigate("/github");
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {error ? (
          <>
            <div className="text-red-600 dark:text-red-400 mb-4 text-xl">
              Erro de Autenticação
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecionando para a página do GitHub...
            </p>
          </>
        ) : (
          <>
            <div className="animate-pulse">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Autenticação em andamento...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Por favor, aguarde enquanto conectamos sua conta
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
