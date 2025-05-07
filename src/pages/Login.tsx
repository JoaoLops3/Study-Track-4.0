import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitHubIcon, GoogleIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { user, loading, signInWithGoogle, signInWithGitHub } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md p-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2 text-indigo-600 dark:text-indigo-400">
            Study Track 3.0
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The ultimate productivity tool for students
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>
          
          <button
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 dark:bg-gray-900 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-black transition-colors"
          >
            <GitHubIcon className="w-5 h-5" />
            <span>Sign in with GitHub</span>
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}