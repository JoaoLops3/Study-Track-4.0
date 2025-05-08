import React, { useState, useEffect } from "react";
import { Github } from "lucide-react";

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const REDIRECT_URI = window.location.origin + "/github";

function GithubLogin() {
  const [token, setToken] = useState<string | null>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Checa se veio o token na URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setToken(accessToken);
        window.location.hash = "";
      }
    }
  }, []);

  // Busca repositórios quando logado
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch("https://api.github.com/user/repos?per_page=100", {
        headers: { Authorization: `token ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setRepos(data))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleLogin = () => {
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=repo` +
      `&allow_signup=true` +
      `&response_type=token`;
    window.location.href = githubAuthUrl;
  };

  if (!token) {
    return (
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
      >
        <Github className="w-6 h-6" /> Login com GitHub
      </button>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Meus Repositórios</h2>
      {loading && <p>Carregando...</p>}
      <ul className="space-y-2">
        {repos.map((repo) => (
          <li
            key={repo.id}
            className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-left"
          >
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-medium"
            >
              {repo.full_name}
            </a>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {repo.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GithubPage() {
  return (
    <div className="max-w-xl mx-auto py-12 text-center">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
        <Github className="inline-block w-8 h-8" /> GitHub
      </h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Veja o código do projeto, acesse seu perfil ou faça login para ver seus
        repositórios:
      </p>
      <GithubLogin />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Repositório do Projeto</h2>
        <a
          href="https://github.com/seu-usuario/seu-repositorio"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          github.com/seu-usuario/seu-repositorio
        </a>
      </div>
    </div>
  );
}
