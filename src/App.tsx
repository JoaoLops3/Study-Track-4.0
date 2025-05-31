import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pomodoro from "./pages/Pomodoro";
import Settings from "./pages/Settings";
import AuthCallback from "./components/auth/AuthCallback";
import GoogleCallback from "./pages/GoogleCallback";
import GithubPage from "./pages/GithubPage";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Pages from "./pages/Pages";
import Board from "./pages/Board";
import useStore from "./store";
import { AppState } from "./types";

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  const loadUserData = useStore((state: AppState) => state.loadUserData);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PomodoroProvider>
            <SettingsProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route
                    path="/auth/google/callback"
                    element={<GoogleCallback />}
                  />

                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="pomodoro" element={<Pomodoro />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="github" element={<GithubPage />} />
                    <Route path="pages" element={<Pages />} />
                    <Route path="board" element={<Board />} />
                  </Route>

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </SettingsProvider>
          </PomodoroProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
