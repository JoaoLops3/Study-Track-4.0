import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Github, Star, GitFork, Eye } from "lucide-react";
import GithubLoginButton from "../auth/GithubLoginButton";

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  updated_at: string;
}

export default function GithubRepos() {
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const { data: integration, error: integrationError } = await supabase
          .from("user_integrations")
          .select("access_token")
          .eq("user_id", user?.id)
          .eq("provider", "github")
          .single();

        if (integrationError) throw integrationError;

        const response = await fetch("https://api.github.com/user/repos", {
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch repos");

        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchRepos();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Github className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Erro ao carregar repositórios</p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
        <div className="flex justify-center">
          <GithubLoginButton />
        </div>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <Github className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Nenhum repositório encontrado</p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Você ainda não tem repositórios no GitHub
        </p>
        <div className="flex justify-center">
          <GithubLoginButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Seus Repositórios</h2>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                {repo.name}
              </h3>
              {repo.language && (
                <span className="px-2 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 rounded-full self-start">
                  {repo.language}
                </span>
              )}
            </div>
            {repo.description && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {repo.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{repo.forks_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{repo.watchers_count}</span>
              </div>
            </div>
            <div className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Atualizado em {new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
