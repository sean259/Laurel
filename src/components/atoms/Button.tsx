import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  /** Main action on a light surface. */
  primary: "bg-ink text-on-ink hover:bg-ink-hover",
  /** The one action you want people to take (start, join, create). */
  accent: "bg-accent text-on-accent hover:bg-accent-hover",
  /** Secondary action on a light surface. */
  secondary: "border border-line-strong bg-surface text-ink hover:border-line-hover hover:bg-canvas",
  /** Low-emphasis text button. */
  ghost: "text-muted hover:bg-surface-sunken hover:text-ink",
  /** Destructive action. */
  danger: "border border-danger-line bg-surface text-danger hover:bg-danger-soft",
  /** Secondary action on a dark surface. */
  inverse: "border border-white/25 text-white hover:bg-white/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${block ? "w-full" : ""} ${className}`;
}

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean };

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={buttonStyles({ variant, size, block, className })} {...props} />;
}

export function ButtonLink({ variant, size, block, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonStyles({ variant, size, block, className })} {...props} />;
}
