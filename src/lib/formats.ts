import type { Format } from "./engine";

export const FORMATS: { value: Format; label: string; description: string }[] = [
  {
    value: "SINGLE_ELIMINATION",
    label: "Single elimination",
    description: "Lose once and you're out. Fast and decisive.",
  },
  {
    value: "DOUBLE_ELIMINATION",
    label: "Double elimination",
    description: "Lose once and you drop to the losers bracket. Lose twice and you're out.",
  },
  {
    value: "ROUND_ROBIN",
    label: "Round robin",
    description: "Everyone plays everyone. Best for small groups.",
  },
  {
    value: "SWISS",
    label: "Swiss",
    description: "A few rounds where players with the same record face each other. Great for large fields.",
  },
];

export const formatLabel = (f: Format) => FORMATS.find((x) => x.value === f)?.label ?? f;

export type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

export const VISIBILITIES: { value: Visibility; label: string; description: string }[] = [
  { value: "PUBLIC", label: "Public", description: "Listed on Laurel for anyone to find." },
  { value: "UNLISTED", label: "Unlisted", description: "Only people with the link can view it." },
  { value: "PRIVATE", label: "Private", description: "Only you can see it. No sign-up link." },
];

export const visibilityLabel = (v: Visibility) => VISIBILITIES.find((x) => x.value === v)?.label ?? v;
