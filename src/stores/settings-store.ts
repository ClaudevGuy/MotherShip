import { create } from "zustand";

interface SettingsStore {
  projectName: string;
  theme: "light" | "dark" | "system";
  pollingInterval: number;
  pollingEnabled: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  timezone: string;
  setProjectName: (name: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setPollingInterval: (interval: number) => void;
  setPollingEnabled: (enabled: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setTimezone: (tz: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  projectName: "Mission Control",
  theme: "dark",
  pollingInterval: 5000,
  pollingEnabled: true,
  compactMode: false,
  animationsEnabled: true,
  timezone: "America/New_York",

  setProjectName: (name) => set({ projectName: name }),
  setTheme: (theme) => set({ theme }),
  setPollingInterval: (interval) => set({ pollingInterval: interval }),
  setPollingEnabled: (enabled) => set({ pollingEnabled: enabled }),
  setCompactMode: (compact) => set({ compactMode: compact }),
  setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
  setTimezone: (tz) => set({ timezone: tz }),
}));
