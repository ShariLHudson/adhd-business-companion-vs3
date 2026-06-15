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

import { getUiString, type UiTranslationKey } from "@/lib/companionI18n";
import {
  getInterfaceLanguageCode,
  isRtlLanguage,
  type LanguageCode,
} from "@/lib/companionLanguage";
import { getPrefs } from "@/lib/companionStore";

type CompanionLanguageContextValue = {
  language: LanguageCode;
  refresh: () => void;
  t: (key: UiTranslationKey) => string;
  rtl: boolean;
};

const CompanionLanguageContext =
  createContext<CompanionLanguageContextValue | null>(null);

export function CompanionLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("en");

  const refresh = useCallback(() => {
    setLanguage(getInterfaceLanguageCode(getPrefs()));
  }, []);

  useEffect(() => {
    refresh();
    const onPrefs = () => refresh();
    window.addEventListener("companion-prefs-updated", onPrefs);
    return () => window.removeEventListener("companion-prefs-updated", onPrefs);
  }, [refresh]);

  useEffect(() => {
    const rtl = isRtlLanguage(language);
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<CompanionLanguageContextValue>(
    () => ({
      language,
      refresh,
      t: (key) => getUiString(key, language),
      rtl: isRtlLanguage(language),
    }),
    [language, refresh],
  );

  return (
    <CompanionLanguageContext.Provider value={value}>
      {children}
    </CompanionLanguageContext.Provider>
  );
}

export function useCompanionLanguage(): CompanionLanguageContextValue {
  const ctx = useContext(CompanionLanguageContext);
  if (!ctx) {
    return {
      language: "en",
      refresh: () => {},
      t: (key) => getUiString(key, "en"),
      rtl: false,
    };
  }
  return ctx;
}
