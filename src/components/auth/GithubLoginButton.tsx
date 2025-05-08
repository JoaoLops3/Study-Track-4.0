import { useAuth } from "../../contexts/AuthContext";
import { Github } from "lucide-react";

export default function GithubLoginButton() {
  const { signInWithGitHub } = useAuth();

  return (
    <button
      onClick={signInWithGitHub}
      className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
    >
      <Github className="w-6 h-6 mr-3" />
      <span>Conectar com GitHub</span>
    </button>
  );
}
