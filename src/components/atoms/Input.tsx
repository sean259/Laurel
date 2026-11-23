import type { ComponentProps } from "react";

/** Shared look for text inputs, textareas and selects. `compact` is for dense lists. */
export function controlStyles({ compact = false, readOnly = false }: { compact?: boolean; readOnly?: boolean } = {}) {
  return `w-full border border-line-strong text-ink outline-none transition placeholder:text-subtle hover:border-line-hover focus:border-accent-strong focus:ring-4 focus:ring-accent-strong/20 aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-subtle ${
    compact ? "rounded-lg px-3 py-1.5 text-sm" : "rounded-xl px-3.5 py-2.5"
  } ${readOnly ? "bg-canvas" : "bg-surface"}`;
}

type Extra = { compact?: boolean };

export function Input({ className = "", compact, ...props }: ComponentProps<"input"> & Extra) {
  return <input className={`${controlStyles({ compact, readOnly: props.readOnly })} ${className}`} {...props} />;
}

export function Textarea({ className = "", compact, ...props }: ComponentProps<"textarea"> & Extra) {
  return <textarea className={`${controlStyles({ compact, readOnly: props.readOnly })} ${className}`} {...props} />;
}

export function Select({ className = "", compact, ...props }: ComponentProps<"select"> & Extra) {
  return <select className={`${controlStyles({ compact })} ${className}`} {...props} />;
}
