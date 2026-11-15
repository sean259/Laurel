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
