import { useMediaQuery } from "./useMediaQuery";

// Reads a UI colour token for the scene, such as the accent glow (brief: "accent at 55% with an accent-ink core").
export function useToken(name: string): string {
  // Tokens change with the colour scheme, so follow it.
  useMediaQuery("(prefers-color-scheme: dark)");
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
