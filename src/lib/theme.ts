"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { SEASONAL_KEY, SEASONS, THEME_KEY } from "./theme-script";

/**
 * Light / dark theme plus the monthly seasonal theme.
 * - Light/dark is saved in localStorage and applied as `data-theme` on <html> ("light" or "dark";
 *   no attribute = follow the OS).
 * - Seasonal is on unless saved as "off"; it's applied as `data-season` (the local month's season).
 * An inline script in the root layout applies both before the first paint, so there's no flash.
 * See globals.css for the colors.
 */
export type ThemeChoice = "system" | "light" | "dark";

const EVENT = "laurel:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode): the change still applies to this page view.
  }
}

function readChoice(): ThemeChoice {
  const t = read(THEME_KEY);
  return t === "light" || t === "dark" ? t : "system";
}

const readSeasonal = () => read(SEASONAL_KEY) !== "off";

/** This month's season, or the one being previewed with ?season=<key>. */
function currentSeason(): string {
  const preview = new URLSearchParams(window.location.search).get("season");
  if (preview && (SEASONS as readonly string[]).includes(preview)) return preview;
  return SEASONS[new Date().getMonth()];
}

function apply() {
  const root = document.documentElement;
  const choice = readChoice();
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
  if (readSeasonal()) root.setAttribute("data-season", currentSeason());
  else root.removeAttribute("data-season");
}

/** Whether the page is showing the dark theme right now. */
export function isDarkNow() {
  const choice = readChoice();
  return choice === "dark" || (choice === "system" && window.matchMedia(DARK_QUERY).matches);
}

function changed() {
  apply();
  window.dispatchEvent(new Event(EVENT));
}

export function setTheme(choice: ThemeChoice) {
  write(THEME_KEY, choice === "system" ? null : choice);
  changed();
}

export function setSeasonal(on: boolean) {
  write(SEASONAL_KEY, on ? null : "off");
  changed();
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

/** Re-applies the theme after React's dev-mode remount, which resets <html> attributes. No-op in production. */
function useReapply() {
  useLayoutEffect(apply, []);
}

/** The saved light/dark choice. Renders as "system" on the server and updates right after hydration. */
export function useThemeChoice(): ThemeChoice {
  useReapply();
  return useSyncExternalStore(subscribe, readChoice, () => "system");
}

/** Whether seasonal themes are on. Renders as on (the default) on the server. */
export function useSeasonal(): boolean {
  useReapply();
  return useSyncExternalStore(subscribe, readSeasonal, () => true);
}
