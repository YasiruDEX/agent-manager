import { getAgentDefaults } from "@/lib/agent-defaults.functions";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type Settings = {
  apiUrl: string;
  apiKey: string;
  apiHeader: string;
};

type SettingsContextValue = Settings & {
  updateSettings: (next: Partial<Settings>) => void;
  reset: () => void;
  defaults: Settings;
  ready: boolean;
};

const FALLBACK_DEFAULTS: Settings = {
  apiUrl: "/api/chat",
  apiKey: "",
  apiHeader: "Authorization",
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: defaults, isSuccess } = useQuery({
    queryKey: ["agent-defaults"],
    queryFn: () => getAgentDefaults(),
    staleTime: Infinity,
  });

  const activeDefaults = defaults ?? FALLBACK_DEFAULTS;
  const [overrides, setOverrides] = useState<Partial<Settings>>({});

  const merged: Settings = { ...activeDefaults, ...overrides };

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...merged,
      defaults: activeDefaults,
      ready: isSuccess,
      updateSettings: (next) => {
        setOverrides((prev) => ({ ...prev, ...next }));
      },
      reset: () => {
        setOverrides({});
      },
    }),
    [merged.apiUrl, merged.apiKey, merged.apiHeader, activeDefaults, isSuccess],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
