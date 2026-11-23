import type { ComponentProps } from "react";

const paddings = { none: "", sm: "p-4", md: "p-6", lg: "p-6 sm:p-8" };

const tones = {
  default: "border-line bg-surface",
  /** Highlighted: something needs attention or is open. */
  accent: "border-accent-line bg-accent-soft",
  /** Highlighted border only, white background. */
  outlined: "border-accent-line bg-surface",
};

/** Surface with a hairline border. The base of every panel on light pages. */
export function Card({
  padding = "md",
  tone = "default",
  radius = "3xl",
  className = "",
  ...props
}: ComponentProps<"div"> & { padding?: keyof typeof paddings; tone?: keyof typeof tones; radius?: "2xl" | "3xl" }) {
  return <div className={`${radius === "2xl" ? "rounded-2xl" : "rounded-3xl"} border ${tones[tone]} ${paddings[padding]} ${className}`} {...props} />;
}
