import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          toast.error("Erro ao autenticar. Tente novamente.");
          navigate("/login");
          return;
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
