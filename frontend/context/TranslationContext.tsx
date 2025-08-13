"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en.json";
import fa from "../locales/fa.json";

type SupportedLang = "en" | "fa";
type Translations = Record<string, any>;

const translations: Record<SupportedLang, Translations> = {
  en,
  fa,
};

function detectInitialLanguage(): SupportedLang {
  // Prefer saved language if we're on the client
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("verba_lang");
    if (saved === "fa" || saved === "en") return saved;

    // Fallback to browser language
    const navLang =
      typeof navigator !== "undefined"
        ? navigator.language?.toLowerCase?.()
        : undefined;
    if (navLang?.startsWith("fa")) return "fa";
    if (navLang?.startsWith("en")) return "en";
  }

  // SSR or unknown → default to English
  return "en";
}

interface TranslationContextType {
  language: SupportedLang;
  setLanguage: (lang: SupportedLang) => void;
  t: (
    key: string,
    fallback?: string,
    vars?: Record<string, string | number>
  ) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export const TranslationProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [language, setLanguage] = useState<SupportedLang>(() =>
    detectInitialLanguage()
  );

  // Persist choice only; do NOT change <html dir> (keeps layout as-is)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("verba_lang", language);
      } catch {
        // ignore storage errors
      }
    }
  }, [language]);

  const t: TranslationContextType["t"] = (key, fallback, vars) => {
    const template = translations[language][key] || fallback || key;
    if (!vars) return template;

    return Object.entries(vars).reduce((result, [varName, value]) => {
      return result.replace(
        new RegExp(`{{\\s*${varName}\\s*}}`, "g"),
        String(value)
      );
    }, template);
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
