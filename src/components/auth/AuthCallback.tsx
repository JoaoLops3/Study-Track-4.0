import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          toast.error("Erro ao autenticar. Tente novamente.");
          navigate("/login");
          return;
        }

        if (!session?.user) {
          toast.error("Usuário não autenticado");
          navigate("/login");
          return;
        }

        // Verificar se é uma autenticação do GitHub
        const provider = session.provider_token ? "github" : null;

        if (provider === "github" && session.provider_token) {
          // Atualizar ou criar o token de acesso do GitHub
          const { error: integrationError } = await supabase
            .from("github_integrations")
            .upsert(
              {
                user_id: session.user.id,
                access_token: session.provider_token,
                token_type: "bearer",
                scope: "repo user",
              },
              {
                onConflict: "user_id",
              }
            );

          if (integrationError) {
            console.error("Error saving GitHub integration:", integrationError);
            toast.error("Erro ao salvar integração com o GitHub");
          }
        }

        // Successful authentication
        toast.success("Autenticação realizada com sucesso!");
        navigate("/");
      } catch (error) {
        console.error("Error in auth callback:", error);
        toast.error("Erro ao processar autenticação. Tente novamente.");
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Processando autenticação...
        </h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
