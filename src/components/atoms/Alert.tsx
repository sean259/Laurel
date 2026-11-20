import type { ReactNode } from "react";

const tones = {
  error: "bg-danger-soft text-danger border-danger-line",
  info: "bg-accent-soft text-amber-900 border-amber-200",
  success: "bg-success-soft text-success border-emerald-200",
};

/** Inline message. Errors are announced to screen readers as soon as they appear. */
export function Alert({
  tone = "error",
  children,
  className = "",
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]} ${className}`}>
      {children}
    </p>
  );
}

/** Short error line under a control or button. `inverse` is for dark surfaces. */
export function ErrorText({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return (
    <p role="alert" className={`text-xs font-medium ${inverse ? "text-red-300" : "text-danger"}`}>
      {children}
    </p>
  );
}
