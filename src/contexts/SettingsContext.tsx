import { createContext, useContext, useState, useEffect } from "react";

type Settings = {
  showFloatingPomodoro: boolean;
  showFloatingCalculator: boolean;
  notificationsEnabled: boolean;
  compactSidebar: boolean;
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
};

const DEFAULT_SETTINGS: Settings = {
  showFloatingPomodoro: true,
  showFloatingCalculator: true,
  notificationsEnabled: true,
  compactSidebar: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem("appSettings");
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
