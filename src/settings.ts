import { useEffect, useState } from "react";
import type { Lang } from "./copy";

// The learner's settings, kept on the device and shared by / and /tawaf (D35).
// A stored value that is not one of the expected two is ignored.

// A stored language wins. Else Malay when the browser's first language is Malay, and English for any other (D34).
export function pickLang(
  stored: string | null,
  first: string | undefined,
): Lang {
  if (stored === "en" || stored === "ms") return stored;
  return first?.split("-")[0].toLowerCase() === "ms" ? "ms" : "en";
}

export function pickHints(stored: string | null): boolean {
  return stored !== "off";
}

// A private window may refuse storage; the page then works with the defaults.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Kept for this visit only.
  }
}

export function useHints(): [boolean, (on: boolean) => void] {
  const [hints, setHints] = useState(() => pickHints(read("vh.hints")));
  const save = (on: boolean) => {
    write("vh.hints", on ? "on" : "off");
    setHints(on);
  };
  return [hints, save];
}

export function useLang(): [Lang, (lang: Lang) => void] {
  const [lang, setLang] = useState(() =>
    pickLang(read("vh.lang"), navigator.language),
  );
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const save = (next: Lang) => {
    write("vh.lang", next);
    setLang(next);
  };
  return [lang, save];
}
