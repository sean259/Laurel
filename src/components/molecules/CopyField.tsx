"use client";

import { useState } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

/** Read-only text with a Copy button. */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          readOnly
          value={value}
          aria-label={label}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 font-mono text-sm"
        />
        <Button variant="accent" onClick={copy}>
          {state === "copied" ? "Copied!" : "Copy link"}
        </Button>
      </div>
      <p aria-live="polite" className="mt-1.5 min-h-4 text-xs text-subtle">
        {state === "copied" && "Link copied to your clipboard."}
        {state === "failed" && "Couldn't copy. Select the link and copy it yourself."}
      </p>
    </div>
  );
}
