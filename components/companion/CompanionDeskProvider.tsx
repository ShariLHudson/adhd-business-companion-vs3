"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CompanionDeskContextValue = {
  setDeskOverride: (content: ReactNode | null) => void;
  layerActive: boolean;
};

const CompanionDeskContext = createContext<CompanionDeskContextValue | null>(
  null,
);

export function useCompanionDesk() {
  const ctx = useContext(CompanionDeskContext);
  if (!ctx) {
    throw new Error("useCompanionDesk must be used within CompanionDeskProvider");
  }
  return ctx;
}

/** Optional hook for surfaces that may render outside the provider during SSR. */
export function useCompanionDeskOptional() {
  return useContext(CompanionDeskContext);
}

type ProviderProps = {
  children: ReactNode;
  fullBleed?: boolean;
  visible?: boolean;
  defaultContent: ReactNode;
};

export function CompanionDeskProvider({
  children,
  fullBleed = false,
  visible = true,
  defaultContent,
}: ProviderProps) {
  const [override, setOverride] = useState<ReactNode | null>(null);

  const setDeskOverride = useCallback((content: ReactNode | null) => {
    setOverride(content);
  }, []);

  const value = useMemo(
    () => ({ setDeskOverride, layerActive: visible }),
    [setDeskOverride, visible],
  );

  return (
    <CompanionDeskContext.Provider value={value}>
      {children}
      {visible ? (
        <div
          className={[
            "companion-desk-layer",
            fullBleed ? "companion-desk-layer--full-bleed" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-testid="companion-desk-layer"
        >
          <div className="companion-desk-layer__bleed">
            <div className="companion-desk-layer__slot">
              {override ?? defaultContent}
            </div>
          </div>
        </div>
      ) : null}
    </CompanionDeskContext.Provider>
  );
}
