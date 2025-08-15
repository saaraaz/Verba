"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en.json";
import fa from "../locales/fa.json";

type SupportedLang = "en" | "fa";
type Translations = Record<string, string>;

const translations: Record<SupportedLang, Translations> = {
  en: en as Translations,
  fa: fa as Translations,
};

function detectInitialLanguage(): SupportedLang {
  // Prefer saved language if we're on the client
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("verba_lang");
    if (saved === "fa" || saved === "en") return saved as SupportedLang;

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

  // Persist choice
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("verba_lang", language);
      } catch {
        /* ignore storage errors */
      }
    }
  }, [language]);

  // Set document direction & language attribute
  useEffect(() => {
    if (typeof document !== "undefined") {
      const dir = language === "fa" ? "rtl" : "ltr";
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", language);
    }
  }, [language]);

  // Replace {{var}} placeholders with provided values
  function interpolateTemplate(
    template: string,
    variables?: Record<string, string | number>
  ): string {
    if (!variables) return template;

    let result = template;
    for (const [name, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{\\s*${name}\\s*}}`, "g");
      result = result.replace(placeholder, String(value));
    }
    return result;
  }

  // Translate a key, falling back to the provided fallback or the key itself
  const t: TranslationContextType["t"] = (key, fallback, vars) => {
    const catalog = translations[language] ?? ({} as Translations);
    const raw = catalog[key] ?? fallback ?? key;
    const template = typeof raw === "string" ? raw : String(raw);
    return interpolateTemplate(template, vars);
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
