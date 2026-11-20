import { cloneElement, useId, type ReactElement, type ReactNode } from "react";

type ControlProps = { id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean };

/**
 * Label + control + hint + error, wired together for screen readers.
 * Pass a single control (Input, Textarea, Select) as the child.
 */
export function Field({
  label,
  optional = false,
  hint,
  error,
  action,
  children,
  className = "",
}: {
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  /** Small control shown on the right of the label row (e.g. "Shuffle seeds"). */
  action?: ReactNode;
  children: ReactElement<ControlProps>;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {optional && <span className="font-normal text-subtle"> (optional)</span>}
        </label>
        {action}
      </div>
      {cloneElement(children, { id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
