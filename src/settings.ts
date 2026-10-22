import { useState } from "react";

// The learner's settings, kept on the device and shared by / and /tawaf (D35).
// A stored value that is not one of the expected two is ignored.
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
