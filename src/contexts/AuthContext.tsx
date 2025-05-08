import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, SupabaseUser } from "../lib/supabase";
import { toast } from "react-hot-toast";

type AuthContextType = {
  user: SupabaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast.error("Erro ao conectar com o Google");
      console.error("Error signing in with Google", error);
    }
  }

  // Sign in with GitHub
  async function signInWithGitHub() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "repo user",
        },
      });

      if (error) throw error;
    } catch (error) {
      toast.error("Erro ao conectar com o GitHub");
      console.error("Error signing in with GitHub", error);
    }
  }

  // Sign in with Email
  async function signInWithEmail(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      if (!email || !password) {
        toast.error("Por favor, preencha todos os campos");
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          toast.error("Email ou senha incorretos. Verifique suas credenciais.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Por favor, confirme seu email antes de fazer login");
        } else {
          toast.error(error.message || "Erro ao fazer login");
        }
        return false;
      }

      if (data?.user) {
        toast.success("Login realizado com sucesso!");
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao fazer login. Tente novamente.");
      return false;
    }
  }

  // Sign up with Email
  async function signUpWithEmail(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      if (!email || !password) {
        toast.error("Por favor, preencha todos os campos");
        return false;
      }

      if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return false;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error(
            "Este email já está cadastrado. Por favor, faça login ou use outro email."
          );
        } else if (error.message.includes("invalid email")) {
          toast.error("Email inválido. Por favor, use um email válido.");
        } else {
          toast.error(error.message || "Erro ao criar conta");
        }
        return false;
      }

      if (data?.user) {
        toast.success(
          "Conta criada com sucesso! Verifique seu email para confirmar o cadastro."
        );
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      toast.error("Erro ao criar conta. Tente novamente.");
      return false;
    }
  }

  // Sign out
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Desconectado com sucesso");
    } catch (error) {
      toast.error("Erro ao desconectar");
      console.error("Error signing out", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGitHub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
