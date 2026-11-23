import type { CSSProperties } from "react";

// Hand-picked so the pieces spread across the screen without looking like a grid.
// left %, size rem, fall seconds, delay seconds, sideways drift, spin
const PIECES: [number, number, number, number, string, string][] = [
  [4, 1.0, 19, -2, "3rem", "160deg"],
  [13, 0.8, 24, -14, "-2rem", "-120deg"],
  [22, 1.2, 21, -7, "4rem", "220deg"],
  [31, 0.9, 27, -20, "-3rem", "90deg"],
  [42, 1.1, 18, -11, "2rem", "-200deg"],
  [51, 0.8, 25, -3, "-4rem", "140deg"],
  [60, 1.3, 22, -17, "3rem", "-90deg"],
  [69, 0.9, 26, -9, "-2rem", "180deg"],
  [78, 1.0, 20, -23, "4rem", "-160deg"],
  [87, 1.2, 23, -5, "-3rem", "120deg"],
  [95, 0.8, 28, -13, "2rem", "-140deg"],
];

/**
 * Slowly falling seasonal decorations (snow, leaves, bats…). The glyph comes from CSS for the
 * current season, and the layer only shows while a season with decorations is active.
 * Purely decorative: hidden from screen readers, never clickable, off for reduced motion.
 */
export function SeasonalEffects() {
  return (
    <div aria-hidden className="season-fx">
      {PIECES.map(([left, size, duration, delay, drift, spin], i) => (
        <span
          key={i}
          style={
            {
              left: `${left}%`,
              fontSize: `${size}rem`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              "--drift": drift,
              "--spin": spin,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
