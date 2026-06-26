"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadCompanionPhotoCatalog,
  subscribeCompanionPhotoCatalog,
  type CompanionPhotoCatalogSnapshot,
} from "@/lib/companionPhotoCatalog";
import { ASSETS } from "@/lib/companionUi";

type CompanionPhotoContextValue = {
  catalog: CompanionPhotoCatalogSnapshot;
  refresh: (force?: boolean) => Promise<void>;
};

const defaultCatalog: CompanionPhotoCatalogSnapshot = {
  images: [ASSETS.profile],
  version: "0",
  primarySrc: ASSETS.profile,
  loadedAt: "",
  revision: 0,
};

const CompanionPhotoContext =
  createContext<CompanionPhotoContextValue | null>(null);

/** One catalog for every workspace — Live Reality™ pattern for companion portraits. */
export function CompanionPhotoProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CompanionPhotoCatalogSnapshot>(defaultCatalog);

  const refresh = useCallback(async (force = false) => {
    const next = await loadCompanionPhotoCatalog({ forceRefresh: force });
    setCatalog(next);
  }, []);

  useEffect(() => {
    void refresh(true);
  }, [refresh]);

  useEffect(() => {
    return subscribeCompanionPhotoCatalog(() => {
      void refresh(true);
    });
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => void refresh(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const value = useMemo(() => ({ catalog, refresh }), [catalog, refresh]);

  return (
    <CompanionPhotoContext.Provider value={value}>
      {children}
    </CompanionPhotoContext.Provider>
  );
}

export function useCompanionPhotoCatalog(): CompanionPhotoContextValue {
  const ctx = useContext(CompanionPhotoContext);
  if (!ctx) {
    return {
      catalog: defaultCatalog,
      refresh: async () => {},
    };
  }
  return ctx;
}
