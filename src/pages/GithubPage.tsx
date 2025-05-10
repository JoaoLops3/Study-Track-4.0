import { useAuth } from "../contexts/AuthContext";
import GithubLoginButton from "../components/auth/GithubLoginButton";
import GithubRepos from "../components/github/GithubRepos";
import { Github } from "lucide-react";

export default function GithubPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 rounded-full mb-4 sm:mb-6">
            <Github className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
            GitHub Integration
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Conecte sua conta do GitHub para visualizar e gerenciar seus
            repositórios
          </p>
        </div>

        {!user ? (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-10">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                Conecte sua conta
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
                Faça login com o GitHub para acessar seus repositórios e
                contribuições
              </p>
              <div className="flex justify-center">
                <GithubLoginButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
            <GithubRepos />
          </div>
        )}
      </div>
    </div>
  );
}
