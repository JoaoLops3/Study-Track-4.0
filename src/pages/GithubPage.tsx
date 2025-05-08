import { useAuth } from "../contexts/AuthContext";
import GithubLoginButton from "../components/auth/GithubLoginButton";
import GithubRepos from "../components/github/GithubRepos";
import { Github } from "lucide-react";

export default function GithubPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-full mb-6">
            <Github className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">GitHub Integration</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Conecte sua conta do GitHub para visualizar e gerenciar seus
            repositórios
          </p>
        </div>

        {!user ? (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Conecte sua conta</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Faça login com o GitHub para acessar seus repositórios e
                contribuições
              </p>
              <div className="flex justify-center">
                <GithubLoginButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <GithubRepos />
          </div>
        )}
      </div>
    </div>
  );
}
