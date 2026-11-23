"use client";

import { isDarkNow, setTheme, useThemeChoice, type ThemeChoice } from "@/lib/theme";

const iconButton =
  "grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-sunken hover:text-ink";

function Sun({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={`h-[18px] w-[18px] ${className}`}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 1.75v1.5M10 16.75v1.5M1.75 10h1.5M16.75 10h1.5M4.17 4.17l1.06 1.06M14.77 14.77l1.06 1.06M4.17 15.83l1.06-1.06M14.77 5.23l1.06-1.06" />
    </svg>
  );
}

function Moon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className={`h-[18px] w-[18px] ${className}`}>
      <path d="M16.5 12.1A7 7 0 0 1 7.9 3.5a7 7 0 1 0 8.6 8.6Z" />
    </svg>
  );
}

function Monitor({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={`h-4 w-4 ${className}`}>
      <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" />
      <path d="M7 16.5h6" />
    </svg>
  );
}

/**
 * Header button: flips between light and dark. Which icon and label show is decided by CSS
 * (`dark:`), so it's right on the first paint, before React has loaded.
 */
export function ThemeToggle() {
  useThemeChoice(); // keeps the theme applied after React's dev remount
  return (
    <button type="button" className={iconButton} onClick={() => setTheme(isDarkNow() ? "light" : "dark")}>
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
    </button>
  );
}

const OPTIONS: { value: ThemeChoice; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "System", icon: <Monitor /> },
  { value: "light", label: "Light", icon: <Sun className="!h-4 !w-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="!h-4 !w-4" /> },
];

/** Footer control: System / Light / Dark. */
export function ThemePicker() {
  const choice = useThemeChoice();
  return (
    <fieldset className="inline-flex rounded-full border border-line bg-surface p-0.5">
      <legend className="sr-only">Theme</legend>
      {OPTIONS.map((o) => (
        <label
          key={o.value}
          title={o.label}
          className="relative grid h-7 w-8 cursor-pointer place-items-center rounded-full text-subtle transition-colors hover:text-ink has-[:checked]:bg-surface-sunken has-[:checked]:text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus has-[:focus-visible]:[outline-style:solid]"
        >
          <input
            type="radio"
            name="theme"
            value={o.value}
            checked={choice === o.value}
            onChange={() => setTheme(o.value)}
            className="sr-only"
          />
          {o.icon}
          <span className="sr-only">{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
