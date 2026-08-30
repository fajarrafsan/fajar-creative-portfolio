"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Locale = "id" | "en";

/**
 * A value that exists in both languages.
 *
 * Copy is stored as pairs rather than as keys pointing at a separate
 * dictionary. With a single translator and a few hundred strings, keeping the
 * two versions physically adjacent is what stops them drifting apart — you
 * cannot edit the Indonesian and forget the English when they are one line
 * from each other.
 */
export type Dual<T = string> = { id: T; en: T };

export const dual = <T,>(id: T, en: T): Dual<T> => ({ id, en });

const STORAGE_KEY = "portfolio-locale";
const DEFAULT_LOCALE: Locale = "id";
const EVENT = "portfolio-locale-change";

function isLocale(value: unknown): value is Locale {
  return value === "id" || value === "en";
}

/**
 * The locale lives in localStorage, not in React state.
 *
 * Reading it during render would mismatch hydration (the server has no
 * storage), and reading it in an effect then calling setState triggers the
 * cascading render React warns about. `useSyncExternalStore` is built for
 * exactly this: the server snapshot is the default, the client snapshot is
 * whatever storage holds, and React reconciles the two itself.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  // `storage` fires only in OTHER tabs, which is what keeps a second tab in
  // sync when the language is switched here.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
    // No stored choice yet: take the browser's own preference once.
    return navigator.language?.toLowerCase().startsWith("id") ? "id" : "en";
  } catch {
    // Storage blocked (private mode, blocked cookies) — the default still works.
    return DEFAULT_LOCALE;
  }
}

const getServerSnapshot = (): Locale => DEFAULT_LOCALE;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Resolve a Dual (or a plain value, which passes straight through). */
  t: <T>(value: Dual<T> | T) => T;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (value) => (isDual(value) ? value[DEFAULT_LOCALE] : value) as never,
});

function isDual<T>(value: Dual<T> | T): value is Dual<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in (value as object) &&
    "en" in (value as object)
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference will not persist, but the switch below still re-renders.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  // `lang` has to track the switch: screen readers pick pronunciation from it,
  // and it is what search engines read the page as.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (<T,>(v: Dual<T> | T) => (isDual(v) ? v[locale] : v)) as LocaleContextValue["t"],
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** Shorthand for components that only need to resolve copy. */
export function useT() {
  return useContext(LocaleContext).t;
}
