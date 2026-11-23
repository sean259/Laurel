"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

/**
 * Light / dark theme. The choice is saved in localStorage and applied as `data-theme` on <html>
 * ("light" or "dark"; no attribute = follow the OS). An inline script in the root layout applies it
 * before the first paint, so there's no flash. See globals.css for the colors.
 */
export type ThemeChoice = "system" | "light" | "dark";

const KEY = THEME_KEY;
const EVENT = "laurel:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readChoice(): ThemeChoice {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
}

/** Whether the page is showing the dark theme right now. */
export function isDarkNow() {
  const choice = readChoice();
  return choice === "dark" || (choice === "system" && window.matchMedia(DARK_QUERY).matches);
}

export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    // Storage blocked (private mode): the theme still changes for this page view.
  }
  apply(choice);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // another tab changed it
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The saved choice. Renders as "system" on the server and updates right after hydration. */
export function useThemeChoice(): ThemeChoice {
  // React's dev-mode remount resets <html> attributes, clearing what the inline script set.
  // Re-apply before paint; this is a no-op in production.
  useLayoutEffect(() => apply(readChoice()), []);
  return useSyncExternalStore(subscribe, readChoice, () => "system");
}
