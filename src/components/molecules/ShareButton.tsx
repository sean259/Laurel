"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "../atoms/Button";

/**
 * Share the current page: the native share sheet on phones, otherwise copy the link.
 * The result is announced to screen readers.
 */
export function ShareButton({ title, variant = "secondary" }: { title: string; variant?: ButtonVariant }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    const url = window.location.href.split("#")[0];
    // Touch devices get the share sheet; desktops copy, which is what people expect there.
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <>
      <Button variant={variant} onClick={share}>
        <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M10 2.5v10M6.5 6 10 2.5 13.5 6M4.5 10v5.5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V10" />
        </svg>
        {state === "copied" ? "Link copied" : state === "failed" ? "Couldn't copy" : "Share"}
      </Button>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Link copied to your clipboard." : state === "failed" ? "Couldn't copy the link." : ""}
      </span>
    </>
  );
}
