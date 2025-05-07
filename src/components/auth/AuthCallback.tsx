import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get code and session from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorParam = queryParams.get('error') || hashParams.get('error');
        const errorDescription = queryParams.get('error_description') || hashParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || 'An error occurred during the authentication');
        }

        // Wait for the auth session to be set
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;
        } else {
          // If we don't have tokens in the URL, try to exchange code for session
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
        }

        // Redirect to the dashboard on success
        navigate('/');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        
        // Redirect to login page after 3 seconds on error
        setTimeout(() => {
          navigate('/login');
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
              Authentication Error
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {error}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to login page...
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
                Authentication in progress...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we sign you in
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}