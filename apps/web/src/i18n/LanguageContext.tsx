import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ru } from "./ru";
import { uz } from "./uz";
import type { Content } from "./ru";

export type Lang = "ru" | "uz";

const CONTENT: Record<Lang, Content> = { ru, uz };
const STORAGE_KEY = "inwell-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Content;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "ru";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ru" || stored === "uz") return stored;
  } catch {
    // localStorage unavailable (privacy mode, etc.) — fall back silently.
  }
  return "ru";
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore write failures
    }
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);

  const value = useMemo<LanguageContextValue>(() => ({ lang, setLang, t: CONTENT[lang] }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

/** Simple {placeholder} substitution for template strings in content.ts */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
